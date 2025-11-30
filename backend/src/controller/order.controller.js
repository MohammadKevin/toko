import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getOrderStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);

    const [monthSales, weekSales, totalOrders, totalUsers] = await Promise.all([
      prisma.order.aggregate({
        _sum: { totalPrice: true },
        where: { createdAt: { gte: startOfMonth } },
      }),
      prisma.order.aggregate({
        _sum: { totalPrice: true },
        where: { createdAt: { gte: startOfWeek } },
      }),
      prisma.order.count(),
      prisma.user.count(),
    ]);

    res.json({
      sales: {
        month: monthSales._sum.totalPrice || 0,
        week: weekSales._sum.totalPrice || 0,
      },
      totalOrders,
      totalUsers,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createOrder = async (req, res) => {
  const { userId, totalPrice, paymentMethod, items } = req.body;

  if (!userId || !Array.isArray(items) || items.length === 0 || !totalPrice) {
    return res.status(400).json({
      message: "Data order tidak lengkap (User ID, Total Harga, atau Items kosong)",
    });
  }

  try {
    // Ambil produk berdasarkan ID
    const productIds = items.map((i) => i.productId);
    const existingProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    // Validasi stok
    for (const item of items) {
      const product = existingProducts.find((p) => p.id === item.productId);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({
          message: `Stok produk "${product ? product.name : item.productId}" tidak cukup atau produk tidak ditemukan.`,
        });
      }
    }

    // Transaksi database
    const order = await prisma.$transaction(async (tx) => {
      // Kurangi stok
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Buat order
      return await tx.order.create({
        data: {
          userId,
          totalPrice,
          paymentMethod,
          items: {
            create: items.map((i) => ({
              productId: i.productId,
              quantity: i.quantity,
            })),
          },
        },
        include: { items: true },
      });
    });

    res.status(201).json({ message: "Order berhasil dibuat!", order });
  } catch (error) {
    console.error("❌ ERROR saat membuat order:", error);
    res.status(500).json({ message: "Terjadi kesalahan internal server." });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: { product: true },
        },
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" }, // urut terbaru
    });

    res.json(orders);
  } catch (error) {
    console.error("❌ ERROR ambil semua order:", error);
    res.status(500).json({ message: error.message });
  }
};
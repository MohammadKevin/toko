import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// 🔹 Buat order baru
export const createOrder = async (req, res) => {
  try {
    const { userId, totalPrice, paymentMethod, items } = req.body;

    // Validasi sederhana
    if (!userId || !totalPrice || !paymentMethod || !items?.length) {
      return res.status(400).json({ message: "Data order tidak lengkap" });
    }

    // Prisma nested create untuk OrderItem
    const order = await prisma.order.create({
      data: {
        userId,
        totalPrice,
        paymentMethod,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
      include: { items: true }, // Optional, balik data order lengkap
    });

    res.status(201).json({ message: "Order berhasil", order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal membuat order" });
  }
};

// 🔹 Ambil semua order (admin)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: { user: true, items: { include: { product: true } } },
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message || "Gagal mengambil data order" });
  }
};

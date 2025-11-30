import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getAllProducts = async (req, res) => {
    try {
        const products = await prisma.product.findMany();
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await prisma.product.findUnique({
        where: { id: Number(id) },
        });
    if (!product) return res.status(404).json({ message: "Produk tidak ditemukan" });
    res.json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock, imageUrl } = req.body;

    // kalau ada file yang diupload → pakai file
    // kalau tidak ada → cek apakah user mengisi link imageUrl
    const image = req.file 
      ? `/uploads/${req.file.filename}`
      : imageUrl || null; 

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: Number(price),
        category,
        stock: Number(stock),
        image,
      }
    });

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, stock, imageUrl } = req.body;

    const image = req.file 
      ? `/uploads/${req.file.filename}`
      : imageUrl || undefined;

    const product = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(price !== undefined && { price: Number(price) }),
        ...(category && { category }),
        ...(stock !== undefined && { stock: Number(stock) }),
        ...(image && { image }),
      }
    });

    res.json({ message: "Produk berhasil diupdate", product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const productId = Number(id);

    // 🔹 Hapus item terkait di Cart
    await prisma.cartItem.deleteMany({
      where: { productId }
    });

    // 🔹 Hapus item terkait di OrderItem
    await prisma.orderItem.deleteMany({
      where: { productId }
    });

    // 🔹 Baru hapus produk
    await prisma.product.delete({
      where: { id: productId }
    });

    res.json({ message: "Produk berhasil dihapus" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
}
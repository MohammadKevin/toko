import express from "express";
import multer from "multer";
import path from "path";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controller/product.controller.js";

const router = express.Router();

const app = express();
app.use(express.json());

// 🧠 Konfigurasi penyimpanan file
const storage = multer.diskStorage({
destination: (req, file, cb) => {
    cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.post("/", upload.single("image"), createProduct);
router.delete("/:id", deleteProduct);
router.put("/:id", upload.single("image"), updateProduct);

export default router;

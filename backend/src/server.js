import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import productRoutes from "./routes/product.routes.js";
import authRoutes from "./routes/auth.routes.js";
import orderRoutes from "./routes/order.routes.js";

dotenv.config();

// Fix __dirname karena pakai ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Static folder uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/products", productRoutes);
app.use("/auth", authRoutes);
app.use("/orders", orderRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

export default app;

import express from "express";
import { createOrder, getAllOrders, getOrderStats } from "../controller/order.controller.js";

const router = express.Router();

router.post("/", createOrder);
router.get("/", getAllOrders);
router.get("/stats", getOrderStats);

export default router;
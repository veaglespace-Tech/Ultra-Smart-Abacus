import express from "express";
import authRoutes from "./routes/authRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import batchRoutes from "./routes/batchRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";

const app = express();

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/batches", batchRoutes);
app.use("/api/courses", courseRoutes);

export default app;
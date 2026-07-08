import express from "express"
import dotenv from "dotenv"
import cors from "cors"

import authRoutes from "./routes/authRoutes.js"
import teacherRoutes from "./routes/teacherRoutes.js"
import franchiseRoutes from "./routes/franchiseRoutes.js"
import inventoryRoutes from "./routes/inventoryRoutes.js"
import errorMiddleware from "./middleware/errorMiddleware.js"
import studentRoutes from "./routes/studentRoutes.js";
import batchRoutes from "./routes/batchRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import feeRoutes from "./routes/feeRoutes.js";
import referralRoutes from "./routes/referralRoutes.js";
import path from "path";





const app = express()


app.use(cors())
app.use(express.json())



app.use("/api/auth", authRoutes)
app.use("/api/teachers", teacherRoutes)
app.use("/api/franchise", franchiseRoutes)
app.use("/api/inventory", inventoryRoutes)
app.use("/api/students", studentRoutes)
app.use("/api/batches", batchRoutes)
app.use("/api/courses", courseRoutes)
app.use("/api/notifications", notificationRoutes)
app.use("/api/fees", feeRoutes)
app.use("/api/attendance", attendanceRoutes);
app.use("/api/referral", referralRoutes);
app.use(errorMiddleware);
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);


const PORT = process.env.PORT || 5000


app.listen(PORT,()=>{
 console.log(`Server running at http://localhost:${PORT}`)
})
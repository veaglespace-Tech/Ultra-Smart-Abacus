BigInt.prototype.toJSON = function () {
  return Number(this);
};

import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import prisma from "./config/prisma.js"

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
import salaryRoutes from "./routes/salaryRoutes.js";
import examRoutes from "./routes/examRoutes.js";
import path from "path";

const app = express()

app.use(cors())
app.use(express.json())

function sanitizeBigInt(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'bigint') return Number(obj);
  if (typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(sanitizeBigInt);
  }

  const cleaned = {};
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if (typeof value === 'bigint') {
      cleaned[key] = Number(value);
    } else if (value !== null && typeof value === 'object') {
      cleaned[key] = sanitizeBigInt(value);
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

// Global BigInt JSON serialization middleware
app.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function (data) {
    const cleanData = sanitizeBigInt(data);
    return originalJson.call(this, cleanData);
  };
  next();
});

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
app.use("/api/salary", salaryRoutes);
app.use("/api/exams", examRoutes);
app.use(errorMiddleware);
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);

async function ensureDefaultTeacher() {
  try {
    const existing = await prisma.teacher.findFirst();
    if (!existing) {
      let user = await prisma.user.findFirst();
      if (!user) {
        user = await prisma.user.create({
          data: {
            name: "Teacher Admin",
            email: `teacher_${Date.now()}@abacus.com`,
            password: "password123",
            role: "TEACHER",
          },
        });
      }
      await prisma.teacher.create({
        data: {
          name: user.name || "Teacher Admin",
          qualification: "Abacus Master Instructor",
          experience: 5,
          userId: user.id,
        },
      });
      console.log("[Setup] Default Teacher record initialized in database.");
    }
  } catch (err) {
    console.error("[Setup Teacher Error]", err.message);
  }
}
ensureDefaultTeacher();

const PORT = process.env.PORT || 5000

app.listen(PORT,()=>{
 console.log(`Server running at http://localhost:${PORT}`)
})
// Server restart trigger v45

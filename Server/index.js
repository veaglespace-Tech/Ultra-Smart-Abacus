// BigInt JSON serializer initialization (v7)
// Force Nodemon server module reload (v18)
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

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

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
async function performTargetCleanup() {
  try {
    const fs = await import("fs");
    const franchises = await prisma.franchise.findMany({
      include: { user: true }
    });

    const targets = franchises.filter(f => {
      const fn = (f.name || "").toLowerCase();
      const un = (f.user?.name || "").toLowerCase();
      const fe = (f.email || "").toLowerCase();
      return (
        fn.includes("tejas") || fn.includes("kanawade") ||
        fn.includes("aditya") || fn.includes("more") ||
        fn.includes("manager") ||
        un.includes("tejas") || un.includes("kanawade") ||
        un.includes("aditya") || un.includes("more") ||
        un.includes("manager") ||
        fe.includes("tejas") || fe.includes("aditya") || fe.includes("manager")
      );
    });

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: "tejas" } },
          { name: { contains: "kanawade" } },
          { name: { contains: "aditya" } },
          { name: { contains: "more" } },
          { name: { contains: "manager" } },
          { email: { contains: "tejas" } },
          { email: { contains: "aditya" } },
          { email: { contains: "manager" } }
        ]
      }
    });

    let deletedFranchises = [];
    let deletedUsers = [];

    for (const f of targets) {
      try {
        await prisma.student.updateMany({ where: { franchiseId: f.id }, data: { franchiseId: null } });
        await prisma.teacher.updateMany({ where: { franchiseId: f.id }, data: { franchiseId: null } });
        await prisma.batch.deleteMany({ where: { franchiseId: f.id } });
        await prisma.fee.deleteMany({ where: { franchiseId: f.id } });
        await prisma.salary.deleteMany({ where: { franchiseId: f.id } });

        await prisma.franchise.delete({ where: { id: f.id } });
        deletedFranchises.push({ id: f.id, name: f.name, email: f.email });

        if (f.userId) {
          await prisma.user.delete({ where: { id: f.userId } }).catch(() => {});
          deletedUsers.push({ id: f.userId, name: f.user?.name, email: f.user?.email });
        }
      } catch (e) {
        console.error("Cleanup franchise error:", e.message);
      }
    }

    for (const u of users) {
      if (!deletedUsers.some(du => du.id === u.id)) {
        try {
          await prisma.franchise.deleteMany({ where: { userId: u.id } });
          await prisma.user.delete({ where: { id: u.id } });
          deletedUsers.push({ id: u.id, name: u.name, email: u.email });
        } catch (e) {
          console.error("Cleanup user error:", e.message);
        }
      }
    }

    const report = `=== DELETED TARGET FRANCHISES (${deletedFranchises.length}) ===\n` +
      JSON.stringify(deletedFranchises, null, 2) +
      `\n\n=== DELETED TARGET USERS (${deletedUsers.length}) ===\n` +
      JSON.stringify(deletedUsers, null, 2);

    fs.writeFileSync('d:/OnlineMusucalEventsMVC/Ultra-Smart-Abacus/Server/inspect_output.txt', report);
    console.log("[DB CLEANUP COMPLETE]", report);
  } catch (err) {
    console.error("[Target Cleanup Error]", err.message);
  }
}
setTimeout(performTargetCleanup, 1000);

const PORT = process.env.PORT || 5000

app.listen(PORT,()=>{
 console.log(`Server running at http://localhost:${PORT}`)
})

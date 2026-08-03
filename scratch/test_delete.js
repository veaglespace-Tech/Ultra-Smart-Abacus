import prisma from "../Server/config/prisma.js";

async function testDelete() {
  try {
    const fees = await prisma.fee.findMany();
    console.log("All fees in DB:", fees);
  } catch (err) {
    console.error("Error finding fees:", err);
  } finally {
    await prisma.$disconnect();
  }
}

testDelete();

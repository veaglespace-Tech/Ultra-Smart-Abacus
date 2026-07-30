import prisma from '../Server/config/prisma.js';

async function inspect() {
  try {
    const rawRows = await prisma.$queryRawUnsafe(`SELECT id, title, isRead, recipientType, createdBy FROM Notification`);
    console.log("RAW NOTIFICATION ROWS IN MYSQL DB:");
    console.log(JSON.stringify(rawRows, null, 2));
  } catch (err) {
    console.error("Error inspecting database:", err);
  } finally {
    await prisma.$disconnect();
  }
}

inspect();

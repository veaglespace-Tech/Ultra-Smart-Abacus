import prisma from '../Server/config/prisma.js';
import fs from 'fs';

async function run() {
  try {
    const notifs = await prisma.$queryRawUnsafe(`SELECT id, title, isRead, recipientType, createdBy FROM Notification`);
    const reads = await prisma.$queryRawUnsafe(`SELECT * FROM NotificationRead`);
    
    fs.writeFileSync('d:/OnlineMusucalEventsMVC/Ultra-Smart-Abacus/scratch/db_state.json', JSON.stringify({
      notificationsCount: notifs.length,
      notifications: notifs,
      readsCount: reads.length,
      reads: reads
    }, null, 2));

    console.log("DB State dumped to scratch/db_state.json");
  } catch (err) {
    console.error("Error inspecting DB:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

run();

import prisma from '../Server/config/prisma.js';
import fs from 'fs';

async function inspect() {
  try {
    const notifs = await prisma.$queryRawUnsafe(`SELECT * FROM Notification`);
    const reads = await prisma.$queryRawUnsafe(`SELECT * FROM NotificationRead`);
    
    const output = `--- NOTIFICATIONS (${notifs.length}) ---\n` + 
      JSON.stringify(notifs, null, 2) + 
      `\n\n--- NOTIFICATION READS (${reads.length}) ---\n` + 
      JSON.stringify(reads, null, 2);

    fs.writeFileSync('d:/OnlineMusucalEventsMVC/Ultra-Smart-Abacus/scratch/inspect_output.txt', output);
    console.log("Written inspection to scratch/inspect_output.txt");
  } catch (err) {
    fs.writeFileSync('d:/OnlineMusucalEventsMVC/Ultra-Smart-Abacus/scratch/inspect_output.txt', "Error: " + err.message);
  } finally {
    await prisma.$disconnect();
  }
}

inspect();

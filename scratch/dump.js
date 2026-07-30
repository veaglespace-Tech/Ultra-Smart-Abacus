import prisma from '../Server/config/prisma.js';
import fs from 'fs';

async function dump() {
  try {
    const rows = await prisma.$queryRawUnsafe(`SELECT * FROM Notification`);
    fs.writeFileSync('./scratch/db_dump.txt', JSON.stringify(rows, null, 2));
    console.log(`Successfully dumped ${rows.length} rows to scratch/db_dump.txt`);
  } catch (err) {
    fs.writeFileSync('./scratch/db_dump.txt', `Error: ${err.message}`);
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

dump();

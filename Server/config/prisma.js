import { PrismaClient } from "@prisma/client"
import dotenv from "dotenv"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({
    path: path.resolve(__dirname, "../.env")
})

if (!process.env.DATABASE_URL) {
    throw new Error(
        "DATABASE_URL is missing. Add it to CRM/Server/.env, for example: DATABASE_URL=\"mysql://root:@localhost:3306/ultra_abacus_db\""
    )
}

const prisma = new PrismaClient()

// Auto-ensure isRead column and NotificationRead user tracking table exist in MySQL
prisma.$executeRawUnsafe(`
  ALTER TABLE Notification ADD COLUMN isRead TINYINT(1) NOT NULL DEFAULT 0
`).catch(() => {});

prisma.$executeRawUnsafe(`
  CREATE TABLE IF NOT EXISTS NotificationRead (
    id INT AUTO_INCREMENT PRIMARY KEY,
    notificationId INT NOT NULL,
    userId INT NOT NULL,
    readAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_notification (notificationId, userId)
  )
`).catch(() => {});



async function dumpDb() {
  try {
    const notifs = await prisma.$queryRawUnsafe(`SELECT * FROM Notification`);
    const reads = await prisma.$queryRawUnsafe(`SELECT * FROM NotificationRead`);
    const fs = await import("fs");
    const output = `--- NOTIFICATIONS (${notifs.length}) ---\n` + 
      JSON.stringify(notifs, null, 2) + 
      `\n\n--- NOTIFICATION READS (${reads.length}) ---\n` + 
      JSON.stringify(reads, null, 2);
    fs.writeFileSync('d:/OnlineMusucalEventsMVC/Ultra-Smart-Abacus/Server/inspect_output.txt', output);
  } catch (e) {
    console.error("dumpDb error:", e);
  }
}
setTimeout(dumpDb, 1000);

export default prisma

import prisma from '../Server/config/prisma.js';

async function main() {
  try {
    console.log('Adding isRead column to Notification table if missing...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE Notification ADD COLUMN isRead TINYINT(1) NOT NULL DEFAULT 0;
    `).catch(err => {
      console.log('Column may already exist or:', err.message);
    });

    console.log('Updating all existing notifications to isRead = 0 (false)...');
    await prisma.$executeRawUnsafe(`
      UPDATE Notification SET isRead = 0 WHERE isRead IS NULL;
    `).catch(err => console.log('Update notice:', err.message));

    console.log('Done checking database schema for Notification.isRead!');
  } catch (error) {
    console.error('Error modifying DB:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

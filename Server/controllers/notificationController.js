BigInt.prototype.toJSON = function () {
  return Number(this);
};

function safeFormatNotifications(list) {
    if (!Array.isArray(list)) return [];
    return list.map(n => {
        const formatted = {};
        for (const key in n) {
            const val = n[key];
            if (typeof val === 'bigint') {
                formatted[key] = Number(val);
            } else {
                formatted[key] = val;
            }
        }
        const isUserRead = formatted.userIsRead !== undefined ? formatted.userIsRead : n.userIsRead;
        const isRead = Boolean(
            isUserRead === 1 || 
            isUserRead === true || 
            isUserRead === "1" || 
            Number(isUserRead) === 1 ||
            formatted.isRead === 1 || 
            formatted.isRead === true
        );
        return {
            ...formatted,
            id: Number(n.id),
            isRead: isRead
        };
    });
}

import prisma from '../config/prisma.js';
import asyncHandler from '../utils/asyncHandler.js';
import sendEmail from '../utils/sendEmail.js';
import fs from "fs";

const LOG_FILE = "d:/OnlineMusucalEventsMVC/Ultra-Smart-Abacus/Server/debug_noti.log";

function logDebug(msg) {
    try {
        fs.appendFileSync(LOG_FILE, `[${new Date().toISOString()}] ${msg}\n`);
    } catch (e) {}
}

async function ensureNotificationReadTable() {
    try {
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS NotificationRead (
                id INT AUTO_INCREMENT PRIMARY KEY,
                notificationId INT NOT NULL,
                userId INT NOT NULL,
                readAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_user_notification (notificationId, userId)
            )
        `);
    } catch (e) {
        logDebug(`ensureNotificationReadTable error: ${e.message}`);
    }
}

const buildNotificationEmailHtml = (title, message, recipientType) => `
  <div style="font-family:Arial,sans-serif;padding:20px">
    <h2 style="color:#2563eb; margin-bottom:12px;">${title}</h2>
    <p style="font-size:15px;color:#111827;line-height:1.7;">${message}</p>
    <p style="margin-top:24px;color:#6b7280;font-size:13px;">This notification was sent to ${recipientType.toLowerCase()} via Ultra Smart Abacus.</p>
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
    <small style="color:#6b7280;">Ultra Smart Abacus Team</small>
  </div>
`;

export const createNotification = asyncHandler(async (req, res) => {

    const {
        title,
        message,
        type,
        recipientType,
        batchId,
        studentId
    } = req.body;

    if (recipientType === "BATCH") {

        if (!batchId) {

            return res.status(400).json({
                success: false,
                message: "Batch ID is required for BATCH recipient type"
            });

        }

        const batch = await prisma.batch.findUnique({

            where: {
                id: Number(batchId)
            }

        });

        if (!batch) {

            return res.status(404).json({
                success: false,
                message: "Batch not found"
            });

        }

    }

    if (recipientType === "STUDENT") {

        if (!studentId) {

            return res.status(400).json({
                success: false,
                message: "Student ID is required for STUDENT recipient type"
            });

        }

        const student = await prisma.student.findUnique({

            where: {
                id: Number(studentId)
            }

        });

        if (!student) {

            return res.status(404).json({
                success: false,
                message: "Student not found"
            });

        }

    }

    const notification = await prisma.notification.create({

        data: {

            title,
            message,
            type,
            recipientType,
            batchId: batchId ? Number(batchId) : null,
            studentId: studentId ? Number(studentId) : null,
            createdBy: req.user.id

        }

    });

    const notificationSubject = `Ultra Smart Abacus | ${title}`;
    const notificationHtml = buildNotificationEmailHtml(title, message, recipientType);

    let recipients = [];

    if (recipientType === "ALL") {
        const [students, teachers, franchises] = await Promise.all([
            prisma.student.findMany({ select: { name: true, email: true } }),
            prisma.teacher.findMany({ include: { user: true } }),
            prisma.franchise.findMany({ select: { name: true, email: true } })
        ]);

        recipients = [
            ...students.map((student) => ({ email: student.email, name: student.name })),
            ...teachers.map((teacher) => ({ email: teacher.user?.email || null, name: teacher.name })),
            ...franchises.map((franchise) => ({ email: franchise.email, name: franchise.name }))
        ];
    } else if (recipientType === "STUDENTS") {
        recipients = await prisma.student.findMany({ select: { name: true, email: true } });
    } else if (recipientType === "TEACHERS") {
        recipients = await prisma.teacher.findMany({ include: { user: true } });
    } else if (recipientType === "FRANCHISES") {
        recipients = await prisma.franchise.findMany({ select: { name: true, email: true } });
    } else if (recipientType === "BATCH") {
        recipients = await prisma.student.findMany({
            where: { batchId: Number(batchId) },
            select: { name: true, email: true }
        });
    } else if (recipientType === "STUDENT") {
        const student = await prisma.student.findUnique({
            where: { id: Number(studentId) },
            select: { name: true, email: true }
        });

        if (student) {
            recipients = [student];
        }
    }

    const uniqueEmails = [
        ...new Set(
            recipients
                .map((recipient) => recipient?.email)
                .filter((email) => typeof email === "string" && email.trim() !== "")
        )
    ];

    if (uniqueEmails.length > 0) {
        await Promise.allSettled(
            uniqueEmails.map((email) =>
                sendEmail(email, notificationSubject, message, notificationHtml)
            )
        );
    }

    res.status(201).json({

        success: true,
        message: "Notification created successfully",
        data: notification

    });

});


export const getAllNotifications = asyncHandler(async (req, res) => {
    await ensureNotificationReadTable();
    const userId = Number(req.user?.id) || 0;
    const notifications = await prisma.$queryRawUnsafe(`
        SELECT n.*, 
               CASE WHEN nr.id IS NOT NULL THEN 1 ELSE 0 END as userIsRead
        FROM Notification n
        LEFT JOIN NotificationRead nr ON n.id = nr.notificationId AND nr.userId = ${userId}
        ORDER BY n.createdAt DESC
    `);

    const formattedList = safeFormatNotifications(notifications);
    const unreadCount = formattedList.filter(n => !n.isRead).length;

    res.status(200).json({
        success: true,
        notifications: formattedList,
        unreadCount,
        count: formattedList.length,
        data: formattedList
    });
});

export const getTeacherNotifications = asyncHandler(async (req, res) => {
    await ensureNotificationReadTable();
    const userId = Number(req.user?.id) || 0;
    const notifications = await prisma.$queryRawUnsafe(`
        SELECT n.*, 
               CASE WHEN nr.id IS NOT NULL THEN 1 ELSE 0 END as userIsRead
        FROM Notification n
        LEFT JOIN NotificationRead nr ON n.id = nr.notificationId AND nr.userId = ${userId}
        WHERE n.recipientType IN ('ALL', 'TEACHERS') OR n.createdBy = ${userId}
        ORDER BY n.createdAt DESC
    `);

    const formattedList = safeFormatNotifications(notifications);
    const unreadCount = formattedList.filter(n => !n.isRead).length;

    res.status(200).json({
        success: true,
        notifications: formattedList,
        unreadCount,
        count: formattedList.length,
        data: formattedList
    });
});

export const getMyStudentNotifications = asyncHandler(async (req, res) => {
    await ensureNotificationReadTable();
    const userId = Number(req.user?.id) || 0;

    const notifications = await prisma.$queryRawUnsafe(`
        SELECT n.*, 
               CASE WHEN nr.id IS NOT NULL THEN 1 ELSE 0 END as userIsRead
        FROM Notification n
        LEFT JOIN NotificationRead nr ON n.id = nr.notificationId AND nr.userId = ${userId}
        WHERE n.recipientType IN ('ALL', 'STUDENTS', 'STUDENT', 'BATCH')
        ORDER BY n.createdAt DESC
    `);

    const formattedList = safeFormatNotifications(notifications);
    const unreadCount = formattedList.filter(n => !n.isRead).length;

    res.status(200).json({
        success: true,
        notifications: formattedList,
        unreadCount,
        count: formattedList.length,
        data: formattedList
    });
});

export const getFranchiseNotifications = asyncHandler(async (req, res) => {
    await ensureNotificationReadTable();
    const userId = Number(req.user?.id) || 0;
    const notifications = await prisma.$queryRawUnsafe(`
        SELECT n.*, 
               CASE WHEN nr.id IS NOT NULL THEN 1 ELSE 0 END as userIsRead
        FROM Notification n
        LEFT JOIN NotificationRead nr ON n.id = nr.notificationId AND nr.userId = ${userId}
        WHERE n.recipientType IN ('ALL', 'FRANCHISES') OR n.createdBy = ${userId}
        ORDER BY n.createdAt DESC
    `);

    const formattedList = safeFormatNotifications(notifications);
    const unreadCount = formattedList.filter(n => !n.isRead).length;

    logDebug(`GET FRANCHISE NOTIFS: total=${formattedList.length}, unreadCount=${unreadCount}, user=${userId}`);

    res.status(200).json({
        success: true,
        notifications: formattedList,
        unreadCount,
        count: formattedList.length,
        data: formattedList
    });
});


export const getNotificationById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (isNaN(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid notification ID format"
        });
    }

    const notification = await prisma.notification.findUnique({
        where: {
            id: Number(id)
        },
        include: {
            batch: true,
            student: true
        }
    });

    if (!notification) {

        return res.status(404).json({

            success: false,
            message: "Notification not found"

        });

    }

    res.status(200).json({

        success: true,
        data: notification

    });

});


export const updateNotification = asyncHandler(async (req, res) => {

    const { id } = req.params;

    const {
        title,
        message,
        type,
        recipientType,
        batchId,
        studentId
    } = req.body;

    const notification = await prisma.notification.update({

        where: {
            id: Number(id)
        },

        data: {

            title,
            message,
            type,
            recipientType,
            batchId: batchId ? Number(batchId) : null,
            studentId: studentId ? Number(studentId) : null

        }

    });

    res.status(200).json({

        success: true,
        message: "Notification updated successfully",
        data: notification

    });

});


export const deleteNotification = asyncHandler(async (req, res) => {

    const { id } = req.params;

    await prisma.notification.delete({

        where: {
            id: Number(id)
        }

    });

    res.status(200).json({

        success: true,
        message: "Notification deleted successfully"

    });

});

export const getStudentNotifications = asyncHandler(async (req, res) => {
    await ensureNotificationReadTable();
    const { studentId } = req.params;
    const userId = Number(req.user?.id) || 0;

    if (isNaN(studentId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid student ID format"
        });
    }

    const student = await prisma.student.findUnique({
        where: {
            id: Number(studentId)
        }
    });

    if (!student) {
        return res.status(404).json({
            success: false,
            message: "Student not found"
        });
    }

    const batchIdFilter = student.batchId ? Number(student.batchId) : -1;

    const notifications = await prisma.$queryRawUnsafe(`
        SELECT n.*, 
               CASE WHEN nr.id IS NOT NULL THEN 1 ELSE 0 END as userIsRead
        FROM Notification n
        LEFT JOIN NotificationRead nr ON n.id = nr.notificationId AND nr.userId = ${userId}
        WHERE n.recipientType = 'ALL'
           OR n.recipientType = 'STUDENTS'
           OR (n.recipientType = 'STUDENT' AND n.studentId = ${Number(studentId)})
           OR (n.recipientType = 'BATCH' AND n.batchId = ${batchIdFilter})
        ORDER BY n.createdAt DESC
    `);

    const formattedList = safeFormatNotifications(notifications);
    const unreadCount = formattedList.filter(n => !n.isRead).length;

    res.status(200).json({
        success: true,
        count: formattedList.length,
        notifications: formattedList,
        unreadCount,
        data: formattedList
    });
});

export const markNotificationAsRead = asyncHandler(async (req, res) => {
    await ensureNotificationReadTable();
    const { id } = req.params;
    const userId = Number(req.user?.id) || 0;

    if (isNaN(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid notification ID format"
        });
    }

    const numId = Number(id);
    logDebug(`MARK NOTIFICATION ${numId} READ FOR USER ${userId}`);

    try {
        if (prisma.notificationRead) {
            await prisma.notificationRead.upsert({
                where: {
                    notificationId_userId: {
                        notificationId: numId,
                        userId: userId
                    }
                },
                update: {},
                create: {
                    notificationId: numId,
                    userId: userId
                }
            });
        } else {
            await prisma.$executeRawUnsafe(`
                INSERT IGNORE INTO NotificationRead (notificationId, userId) VALUES (${numId}, ${userId})
            `);
        }
    } catch (e) {
        logDebug(`Error inserting NotificationRead: ${e.message}`);
        await prisma.$executeRawUnsafe(`
            INSERT IGNORE INTO NotificationRead (notificationId, userId) VALUES (${numId}, ${userId})
        `).catch(() => {});
    }

    res.status(200).json({
        success: true,
        message: "Notification marked as read",
        id: numId,
        isRead: true
    });
});

export const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
    await ensureNotificationReadTable();
    const userId = Number(req.user?.id) || 0;
    logDebug(`MARK ALL READ REQUEST RECEIVED FOR USER ${userId}`);

    try {
        await prisma.$executeRawUnsafe(`
            INSERT IGNORE INTO NotificationRead (notificationId, userId)
            SELECT id, ${userId} FROM Notification
        `);
    } catch (e) {
        logDebug(`Error inserting markAllRead: ${e.message}`);
    }

    logDebug(`MARK ALL READ EXECUTED SUCCESSFULLY FOR USER ${userId}`);

    res.status(200).json({
        success: true,
        message: "All notifications marked as read"
    });
});

    
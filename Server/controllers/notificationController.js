import prisma from '../config/prisma.js';
import asyncHandler from '../utils/asyncHandler.js';
import sendEmail from '../utils/sendEmail.js';

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

    const notifications = await prisma.notification.findMany({

        include: {
            batch: true,
            student: true
        },

        orderBy: {
            createdAt: "desc"
        }

    });

    res.status(200).json({

        success: true,
        count: notifications.length,
        data: notifications

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
    const { studentId } = req.params;

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

    const notifications = await prisma.notification.findMany({

        where: {

            OR: [

                {
                    recipientType: "ALL"
                },

                {
                    recipientType: "STUDENTS"
                },

                {
                    recipientType: "STUDENT",
                    studentId: Number(studentId)
                },

                {
                    recipientType: "BATCH",
                    batchId: student.batchId
                }

            ]

        },

        orderBy: {

            createdAt: "desc"

        }

    });

    res.status(200).json({

        success: true,
        count: notifications.length,
        data: notifications

    });

});

export const getTeacherNotifications = asyncHandler(async (req, res) => {
    const notifications = await prisma.notification.findMany({
        where: {
            OR: [
                {
                    recipientType: "ALL"
                },
                {
                    recipientType: "TEACHERS"
                },
                {
                    createdBy: req.user.id
                }
            ]
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    res.status(200).json({
        success: true,
        count: notifications.length,
        data: notifications
    });
});

export const getMyStudentNotifications = asyncHandler(async (req, res) => {
    let student = await prisma.student.findFirst({
        where: {
            userId: req.user.id
        }
    });

    if (!student) {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id }
        });

        if (user) {
            student = await prisma.student.findFirst({
                where: { email: user.email }
            });

            // Auto-link student record with user record if not linked
            if (student && !student.userId) {
                student = await prisma.student.update({
                    where: { id: student.id },
                    data: { userId: user.id }
                });
            }

            // Fallback: If no student record exists for this student user, create one on the fly
            if (!student) {
                student = await prisma.student.create({
                    data: {
                        name: user.name,
                        email: user.email,
                        rollNo: `ST-${user.id}-${Math.floor(100 + Math.random() * 900)}`,
                        userId: user.id
                    }
                });
            }
        }
    }

    if (!student) {
        console.error(`Student profile not found for user ID: ${req.user.id}, Role: ${req.user.role}`);
        return res.status(404).json({
            success: false,
            message: `Student profile not found for user ID ${req.user.id} (Role: ${req.user.role})`
        });
    }

    const notifications = await prisma.notification.findMany({
        where: {
            OR: [
                {
                    recipientType: "ALL"
                },
                {
                    recipientType: "STUDENTS"
                },
                {
                    recipientType: "STUDENT",
                    studentId: student.id
                },
                {
                    recipientType: "BATCH",
                    batchId: student.batchId || -1
                }
            ]
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    res.status(200).json({
        success: true,
        count: notifications.length,
        data: notifications
    });
});

export const getFranchiseNotifications = asyncHandler(async (req, res) => {
    const notifications = await prisma.notification.findMany({
        where: {
            OR: [
                {
                    recipientType: "ALL"
                },
                {
                    recipientType: "FRANCHISES"
                },
                {
                    createdBy: req.user.id
                }
            ]
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    res.status(200).json({
        success: true,
        count: notifications.length,
        data: notifications
    });
});

export const submitPublicInquiry = asyncHandler(async (req, res) => {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({
            success: false,
            message: "Name, Email, and Message are required."
        });
    }

    const title = `New Contact Inquiry from ${name}`;
    const fullMessage = `Name: ${name}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\nSubject: ${subject || 'General Inquiry'}\n\nMessage: ${message}`;

    const notification = await prisma.notification.create({
        data: {
            title,
            message: fullMessage,
            type: "ANNOUNCEMENT",
            recipientType: "FRANCHISES",
        }
    });

    try {
        await sendEmail(
            "gunjalsejal04@gmail.com",
            `[Website Contact Form] ${title}`,
            fullMessage
        );
    } catch (e) {
        console.error("Email notification dispatch error:", e);
    }

    res.status(201).json({
        success: true,
        message: "Your inquiry has been submitted successfully and saved to Database.",
        data: notification
    });
});

    
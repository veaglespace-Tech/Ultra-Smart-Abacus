import prisma from '../config/prisma.js';
import asyncHandler from '../utils/asyncHandler.js';

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

    
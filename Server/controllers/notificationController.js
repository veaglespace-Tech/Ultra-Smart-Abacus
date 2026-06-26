import prisma from '../config/prisma.js';

export const createNotification = async (req, res) => {
  try {
    const {  title,
            message,
            type,
            recipientType,
            batchId,
            studentId 
        } = req.body;

        if (recipientType === 'BATCH'){
            if (!batchId) {
                return res.status(400).json
                ({ error: 'Batch ID is required for BATCH recipient type' });
            }   
             const batch = await prisma.batch.findUnique({
                where: { id: Number(batchId) }
            });

            if (!batch) {
                return res.status(404).json({
                    success: false,
                    message: "Batch not found"
                });
            }    

        }

        if (recipientType === 'STUDENT'){
            if (!studentId) {
                return res.status(400).json
                ({ error: 'Student ID is required for STUDENT recipient type' });
            }

            const student = await prisma.student.findUnique({
                where: { id: Number(studentId) }
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

        return res.status(201).json({

            success: true,
            message: "Notification created successfully",
            data: notification

        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            error: error.message
        });

    }
};

// Get All Notifications

export const getAllNotifications = async (req, res) => {

    try {

        const notifications = await prisma.notification.findMany({

            include: {
                batch: true,
                student: true
            },

            orderBy: {
                createdAt: "desc"
            }

        });

        return res.status(200).json({

            success: true,
            data: notifications

        });

    } catch (error) {

        return res.status(500).json({

            success: false,
            error: error.message

        });

    }

};

// Get Notification By Id

export const getNotificationById = async (req, res) => {

    try {

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

        return res.status(200).json({

            success: true,
            data: notification

        });

    } catch (error) {

        return res.status(500).json({

            success: false,
            error: error.message

        });

    }

};

// Update Notification

export const updateNotification = async (req, res) => {

    try {

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

        return res.status(200).json({

            success: true,
            message: "Notification updated successfully",
            data: notification

        });

    } catch (error) {

        return res.status(500).json({

            success: false,
            error: error.message

        });

    }

};

// Delete Notification

export const deleteNotification = async (req, res) => {

    try {

        const { id } = req.params;

        await prisma.notification.delete({

            where: {
                id: Number(id)
            }

        });

        return res.status(200).json({

            success: true,
            message: "Notification deleted successfully"

        });

    } catch (error) {

        return res.status(500).json({

            success: false,
            error: error.message

        });

    }

};

// Notifications For Student

export const getStudentNotifications = async (req, res) => {

    try {

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

        return res.status(200).json({

            success: true,
            data: notifications

        });

    } catch (error) {

        return res.status(500).json({

            success: false,
            error: error.message

        });

    }

};

    
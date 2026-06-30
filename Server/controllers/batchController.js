import prisma from '../config/prisma.js';
import asyncHandler from '../utils/asyncHandler.js';

export const createBatch = asyncHandler(async (req, res) => {

    const {
        name,
        code,
        courseId,
        description,
        level,
        startDate,
        endDate,
        maxStudents
    } = req.body;

    const batch = await prisma.batch.create({

        data: {

            name,
            code,
            courseId: courseId ? Number(courseId) : null,
            description,
            level,
            startDate: startDate ? new Date(startDate) : null,
            endDate: endDate ? new Date(endDate) : null,
            maxStudents: maxStudents ? Number(maxStudents) : null

        },

        include: {
            course: true
        }

    });

    res.status(201).json({

        success: true,
        message: "Batch created successfully",
        data: batch

    });

});

export const getAllBatches = asyncHandler(async (req, res) => {

    const batches = await prisma.batch.findMany({

        include: {
            students: true,
            course: true
        }

    });

    res.status(200).json({

        success: true,
        count: batches.length,
        data: batches

    });

});

export const getBatchById = asyncHandler(async (req, res) => {

    const { id } = req.params;

    const batch = await prisma.batch.findUnique({

        where: {
            id: Number(id)
        },

        include: {
            students: true,
            course: true
        }

    });

    if (!batch) {

        return res.status(404).json({
            success: false,
            message: "Batch not found"
        });

    }

    res.status(200).json({

        success: true,
        data: batch

    });

});

export const updateBatch = asyncHandler(async (req, res) => {

    const batch = await prisma.batch.update({

        where: {
            id: Number(req.params.id)
        },

        data: req.body,

        include: {
            course: true,
            students: true
        }

    });

    res.status(200).json({

        success: true,
        message: "Batch updated successfully",
        data: batch

    });

});

export const deleteBatch = asyncHandler(async (req, res) => {

    await prisma.batch.delete({

        where: {
            id: Number(req.params.id)
        }

    });

    res.status(200).json({

        success: true,
        message: "Batch deleted successfully"

    });

});

export const getBatchesByCourseId = asyncHandler(async (req, res) => {

    const { courseId } = req.params;

    const batches = await prisma.batch.findMany({

        where: {
            courseId: Number(courseId)
        },

        include: {
            course: true,
            students: true
        }

    });

    res.status(200).json({

        success: true,
        count: batches.length,
        data: batches

    });

});
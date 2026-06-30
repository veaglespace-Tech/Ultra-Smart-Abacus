import prisma from '../config/prisma.js';
import asyncHandler from '../utils/asyncHandler.js';

export const createCourse = asyncHandler(async (req, res) => {

    const {
        name,
        code,
        description,
        duration,
        fees
    } = req.body;

    const course = await prisma.course.create({

        data: {

            name,
            code,
            description,
            duration: duration ? Number(duration) : null,
            fees: fees ? Number(fees) : null

        },

        include: {
            Batches: true
        }

    });

    res.status(201).json({

        success: true,
        message: "Course created successfully",
        data: course

    });

});

export const getAllCourses = asyncHandler(async (req, res) => {

    const courses = await prisma.course.findMany({

        include: {
            Batches: true
        }

    });

    res.status(200).json({

        success: true,
        count: courses.length,
        data: courses

    });

});

export const getCourseById = asyncHandler(async (req, res) => {

    const { id } = req.params;

    const course = await prisma.course.findUnique({

        where: {
            id: Number(id)
        },

        include: {
            Batches: true
        }

    });

    if (!course) {

        return res.status(404).json({

            success: false,
            message: "Course not found"

        });

    }

    res.status(200).json({

        success: true,
        data: course

    });

});

export const updateCourse = asyncHandler(async (req, res) => {

    const { id } = req.params;

    const {
        name,
        code,
        description,
        duration,
        fees
    } = req.body;

    const course = await prisma.course.update({

        where: {
            id: Number(id)
        },

        data: {

            name,
            code,
            description,
            duration: duration ? Number(duration) : null,
            fees: fees ? Number(fees) : null

        },

        include: {
            Batches: true
        }

    });

    res.status(200).json({

        success: true,
        message: "Course updated successfully",
        data: course

    });

});

export const deleteCourse = asyncHandler(async (req, res) => {

    const { id } = req.params;

    await prisma.course.delete({

        where: {
            id: Number(id)
        }

    });

    res.status(200).json({

        success: true,
        message: "Course deleted successfully"

    });

});
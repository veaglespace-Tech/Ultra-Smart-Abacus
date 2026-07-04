import prisma from "../config/prisma.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createStudent = asyncHandler(async (req, res) => {

    const { name, email, password, dateOfBirth, gender, phone, address, fatherName, batchId } = req.body;

    const student = await prisma.student.create({
        data: {
            name,
            email,
            password,
            dateOfBirth,
            gender,
            phone,
            address,
            fatherName,
            batchId
        }
    });

 

    res.status(201).json({
        success: true,
        message: "Student created successfully",
        data: student
    });

});

export const getAllStudents = asyncHandler(async (req, res) => {

    const students = await prisma.student.findMany({
        include: {
            batch: true
        }
    });

    res.status(200).json({
        success: true,
        count: students.length,
        data: students
    });

});

export const getStudentById = asyncHandler(async (req, res) => {

    const student = await prisma.student.findUnique({

        where: {
            id: Number(req.params.id)
        },

        include: {
            batch: true
        }

    });

    if (!student) {

        return res.status(404).json({
            success: false,
            message: "Student not found"
        });

    }

    res.status(200).json({
        success: true,
        data: student
    });

});

export const updateStudent = asyncHandler(async (req, res) => {

    const student = await prisma.student.update({

        where: {
            id: Number(req.params.id)
        },

        data: req.body

    });

    res.status(200).json({
        success: true,
        message: "Student updated successfully",
        data: student
    });

});


export const deleteStudent = asyncHandler(async (req, res) => {

    await prisma.student.delete({

        where: {
            id: Number(req.params.id)
        }

    });

    res.status(200).json({
        success: true,
        message: "Student deleted successfully"
    });

});
import prisma from "../config/prisma.js";

export const createStudent = async (req, res) => {
  try {
    const { name, email, rollNo } = req.body;

    const student = await prisma.student.create({
      data: {
        name,
        email,
        rollNo
      }
    });

    res.status(201).json(student);

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};

export const getAllStudents = async (req, res) => {
  const students = await prisma.student.findMany();

  res.status(200).json(students);
};

export const getStudentById = async (req, res) => {
  const { id } = req.params;

  const student = await prisma.student.findUnique({
    where: {
      id: Number(id)
    }
  });

  if (!student) {
    return res.status(404).json({
      error: "Student not found"
    });
  }

  res.status(200).json(student);
};

export const updateStudent = async (req, res) => {
  const { id } = req.params;
  
   const student = await prisma.student.update({
    where: { id: Number(id) },
    data: req.body
  });
  res.status(200).json(student);
};

export const deleteStudent = async (req, res) => {
  const { id } = req.params;

  const student =  await prisma.student.delete({
    where: { id: Number(id) }
  });
  res.status(200).json(student);
};
import prisma from '../config/prisma.js';

export const createCourse = async (req, res) => {
  try {
    const { name, code, description, duration, fees } = req.body;
    const course = await prisma.course.create({
        data: {
            name,
            code,
            //batchId: batchId ? Number(batchId) : null,
            description,
            duration: duration ? Number(duration) : null,
            fees: fees ? Number(fees) : null
        },
         include: {
    Batches: true
  }
    });
    res.status(201).json(course);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getAllCourses = async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        Batches: true
      }
    });
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await prisma.course.findUnique({
        where: { id: Number(id) } ,
        include: {
            Batches: true
        }  
        
    });
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }
    res.status(200).json(course);
    } catch (error) {
    res.status(500).json({ error: error.message });
    }
};

export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, description, duration, fees } = req.body;
    const course = await prisma.course.update({
        where: { id: Number(id) },
        data: {
            name,
            code,
            description,
            duration: duration ? Number(duration) : null,
            fees: fees ? Number(fees) : null
        }
    });
    res.status(200).json(course);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await prisma.course.delete({
        where: { id: Number(id) }
    });
    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  } 
};
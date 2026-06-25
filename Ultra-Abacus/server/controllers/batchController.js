import prisma from '../config/prisma.js';

export const createBatch = async (req, res) => {
    try {
        const { name, code,courseId, description, level, startDate, endDate, maxStudents } = req.body;
        const batch = await prisma.batch.create({
            data: {
                name,
                code,
                courseId: courseId ? Number(courseId) : null,
                description,
                level,
                startDate: new Date(startDate),
    endDate: new Date(endDate),
    maxStudents: Number(maxStudents)
            },
            include: { course: true }
        });
        res.status(201).json(batch);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};  

export const getAllBatches = async (req, res) => {
    try {
        const batches = await prisma.batch.findMany();
        res.status(200).json(batches);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getBatchById = async (req, res) => {
    try {
        const { id } = req.params;
        const batch = await prisma.batch.findUnique({
            where: { id: Number(id) }
        });
        if (!batch) {
            return res.status(404).json({ error: "Batch not found" });
        }
        res.status(200).json(batch);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};  

export const updateBatch = async (req, res) => {
  const batch = await prisma.batch.update({
    where: {
      id: Number(req.params.id)
    },
    data: req.body
  });

  res.status(200).json({
    success: true,
    data: batch
  });
};

export const deleteBatch = async (req, res) => {
    try {
        const { id } = req.params;
        const batch = await prisma.batch.delete({
            where: { id: Number(id) }
        });
        res.status(200).json({ message: "Batch deleted successfully", batch });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


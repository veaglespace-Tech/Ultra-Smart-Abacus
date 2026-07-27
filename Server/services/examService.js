import prisma from "../config/prisma.js";
import CustomError from "../utils/customError.js";

export const examService = {

//   Create Exam

  createExam: async (data) => {

    const {
      title,
      curriculumTrack,
      examType,
      examDate,
      startTime,
      duration,
      totalMarks,
      passingMarks,
      teacherId,
      batchId,
    } = data;

    // Validate teacher
    const teacher = await prisma.teacher.findUnique({
      where: {
        id: Number(teacherId),
      },
    });

    if (!teacher) {
      throw new CustomError("Teacher does not exist", 404);
    }

    // Validate batch
    const batch = await prisma.batch.findUnique({
      where: {
        id: Number(batchId),
      },
    });

    if (!batch) {
      throw new CustomError("Batch does not exist", 404);
    }

    // Business validation
    if (passingMarks > totalMarks) {
      throw new CustomError(
        "Passing marks cannot exceed total marks",
        400
      );
    }

    // Generate Exam Code
    const examCode =
      "EXAM-" +
      Date.now().toString().slice(-6);

    // Create Exam
    return await prisma.exam.create({

      data: {

        title,

        examCode,

        curriculumTrack,

        examType,

        examDate: new Date(examDate),

        startTime,

        duration,

        totalMarks,

        passingMarks,

        teacherId: Number(teacherId),

        batchId: Number(batchId),

      },

      include: {

        teacher: true,

        batch: true,

      },

    });

  },




/**
 * Get All Exams
 */
getAllExams: async (query) => {
  const {
    page = 1,
    limit = 10,
    examType,
    status,
    batchId,
    teacherId,
    search,

    
    sortBy = "examDate",
    sortOrder = "desc",
  } = query

  const skip = (Number(page) - 1) * Number(limit);

  const where = {};

  if (examType) where.examType = examType;
  if (status) where.status = status;
  if (batchId) where.batchId = Number(batchId);
  if (teacherId) where.teacherId = Number(teacherId);

  if (search) {
    where.OR = [
      {
        title: {
          contains: search,
        },
      },
      {
        examCode: {
          contains: search,
        },
      },
    ];
  }

  const [exams, total] = await Promise.all([
    prisma.exam.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        teacher: true,
        batch: true,
      },
    }),

    prisma.exam.count({ where }),
  ]);

  return {
    exams,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
},

/**
 * Get Exam By ID
 */
getExamById: async (id) => {

  const exam = await prisma.exam.findUnique({

    where: {
      id: Number(id),
    },

    include: {
      teacher: true,
      batch: true,
      results: {
        include: {
          student: true,
        },
      },
    },

  });

  if (!exam) {
    throw new CustomError("Exam not found",404);
  }

  return exam;
},

/**
 * Update Exam
 */
updateExam: async (id, data) => {

  const exam = await prisma.exam.findUnique({
    where: {
      id: Number(id),
    },
  });

  if (!exam) {
    throw new CustomError("Exam not found",404);
  }

  if (
    data.totalMarks &&
    data.passingMarks &&
    Number(data.passingMarks) > Number(data.totalMarks)
  ) {
    throw new CustomError(
      "Passing marks cannot exceed total marks",
      400
    );
  }

  return await prisma.exam.update({

    where: {
      id: Number(id),
    },

    data: {

      ...data,

      examDate: data.examDate
        ? new Date(data.examDate)
        : undefined,

      batchId: data.batchId
        ? Number(data.batchId)
        : undefined,

      teacherId: data.teacherId
        ? Number(data.teacherId)
        : undefined,

    },

    include: {

      teacher: true,

      batch: true,

    },

  });

},

/**
 * Delete Exam
 */
deleteExam: async (id) => {

  const exam = await prisma.exam.findUnique({

    where: {
      id: Number(id),
    },

  });

  if (!exam) {
    throw new CustomError("Exam not found",404);
  }

  return await prisma.exam.delete({

    where: {
      id: Number(id),
    },

  });

}
};
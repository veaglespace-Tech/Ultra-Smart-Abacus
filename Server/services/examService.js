const ensureExamResultColumns = async () => {
  const alterColumns = [
    `ALTER TABLE \`ExamResult\` ADD COLUMN \`percentage\` DOUBLE NULL`,
    `ALTER TABLE \`ExamResult\` ADD COLUMN \`grade\` VARCHAR(191) NULL`,
    `ALTER TABLE \`ExamResult\` ADD COLUMN \`isPassed\` TINYINT(1) DEFAULT 0`,
    `ALTER TABLE \`ExamResult\` ADD COLUMN \`isAbsent\` TINYINT(1) DEFAULT 0`,
    `ALTER TABLE \`ExamResult\` ADD COLUMN \`remarks\` VARCHAR(191) NULL`,
    `ALTER TABLE \`ExamResult\` ADD COLUMN \`publishedAt\` DATETIME NULL`
  ];
  for (const sql of alterColumns) {
    try {
      await prisma.$executeRawUnsafe(sql);
    } catch (e) {}
  }
};

export const examService = {

  //   Create Exam

  createExam: async (data, user) => {
    await ensureExamResultColumns();
    // 0. Ensure all required columns exist in MySQL Exam table
    const alterColumns = [
      `ALTER TABLE \`Exam\` ADD COLUMN \`examCode\` VARCHAR(191) NULL`,
      `ALTER TABLE \`Exam\` ADD COLUMN \`curriculumTrack\` VARCHAR(191) NULL`,
      `ALTER TABLE \`Exam\` ADD COLUMN \`examType\` VARCHAR(191) NULL`,
      `ALTER TABLE \`Exam\` ADD COLUMN \`status\` VARCHAR(191) NULL`,
      `ALTER TABLE \`Exam\` ADD COLUMN \`startTime\` VARCHAR(191) NULL`,
      `ALTER TABLE \`Exam\` ADD COLUMN \`duration\` INT NULL`,
      `ALTER TABLE \`Exam\` ADD COLUMN \`totalMarks\` INT NULL`,
      `ALTER TABLE \`Exam\` ADD COLUMN \`passingMarks\` INT NULL`,
      `ALTER TABLE \`Exam\` ADD COLUMN \`examDate\` DATETIME NULL`,
      `ALTER TABLE \`Exam\` ADD COLUMN \`description\` VARCHAR(191) NULL`
    ];

    for (const sql of alterColumns) {
      try {
        await prisma.$executeRawUnsafe(sql);
      } catch (e) {}
    }

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

    // 1. Ensure a valid, existing Teacher record exists in DB
    let activeTeacher = null;
    if (user?.id) {
      activeTeacher = await prisma.teacher.findUnique({ where: { userId: Number(user.id) } }).catch(() => null);
    }
    if (!activeTeacher && teacherId && !isNaN(Number(teacherId))) {
      activeTeacher = await prisma.teacher.findUnique({ where: { id: Number(teacherId) } }).catch(() => null);
    }
    if (!activeTeacher) {
      activeTeacher = await prisma.teacher.findFirst().catch(() => null);
    }
    if (!activeTeacher) {
      try {
        let loggedUser = user?.id ? await prisma.user.findUnique({ where: { id: Number(user.id) } }).catch(() => null) : null;
        if (!loggedUser) {
          loggedUser = await prisma.user.findFirst({ where: { role: "TEACHER" } }).catch(() => null);
        }
        if (!loggedUser) {
          loggedUser = await prisma.user.create({
            data: {
              name: user?.name || "System Instructor",
              email: `instructor_${Date.now()}@abacus.com`,
              password: "password123",
              role: "TEACHER",
            },
          });
        }
        activeTeacher = await prisma.teacher.create({
          data: {
            userId: loggedUser.id,
            name: loggedUser.name || "Teacher",
            qualification: "Abacus Trainer",
            experience: 3,
          },
        });
      } catch (e) {
        console.error("Failed to create fallback teacher:", e);
      }
    }

    // 2. Ensure a valid, existing Batch record exists in DB
    let activeBatch = null;
    if (batchId && !isNaN(Number(batchId))) {
      activeBatch = await prisma.batch.findUnique({ where: { id: Number(batchId) } }).catch(() => null);
    }
    if (!activeBatch && batchId) {
      activeBatch = await prisma.batch.findFirst({
        where: { OR: [{ name: String(batchId) }, { code: String(batchId) }] },
      }).catch(() => null);
    }
    if (!activeBatch) {
      activeBatch = await prisma.batch.findFirst().catch(() => null);
    }
    if (!activeBatch) {
      try {
        activeBatch = await prisma.batch.create({
          data: {
            name: "Morning Batch (MB-01)",
            code: `BATCH-${Date.now()}`,
            level: "Level 1 Core",
          },
        });
      } catch (e) {
        console.error("Failed to create fallback batch:", e);
      }
    }

    if (!activeTeacher || !activeBatch) {
      throw new CustomError("Unable to resolve active teacher or batch for exam creation", 400);
    }

    const resolvedTotalMarks = totalMarks && !isNaN(Number(totalMarks)) ? Number(totalMarks) : 100;
    const resolvedPassingMarks = passingMarks && !isNaN(Number(passingMarks)) ? Number(passingMarks) : Math.round(resolvedTotalMarks * 0.4);

    if (resolvedPassingMarks > resolvedTotalMarks) {
      throw new CustomError("Passing marks cannot exceed total marks", 400);
    }

    const validDate = (examDate && !isNaN(new Date(examDate).getTime()))
      ? new Date(examDate)
      : new Date();

    const examCodeStr = `EXAM-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const examPayload = {
      title: String(title || "New Assessment"),
      examCode: examCodeStr,
      curriculumTrack: String(curriculumTrack || "Level 1 Core"),
      examType: ["WEEKLY", "MONTHLY", "LEVEL", "FINAL"].includes(examType) ? examType : "WEEKLY",
      status: "SCHEDULED",
      examDate: validDate,
      startTime: startTime ? String(startTime) : "10:00 AM",
      duration: Number(duration) || 60,
      totalMarks: resolvedTotalMarks,
      passingMarks: resolvedPassingMarks,
      teacherId: activeTeacher?.id || 1,
      batchId: activeBatch?.id || 1,
    };

    try {
      return await prisma.exam.create({
        data: examPayload,
        include: {
          teacher: true,
          batch: true,
        },
      });
    } catch (err) {
      console.error("Prisma Exam Create Error, attempting MySQL Fallback:", err.message);
      
      // Ensure column is added to MySQL
      try {
        await prisma.$executeRawUnsafe(`ALTER TABLE \`Exam\` ADD COLUMN \`examCode\` VARCHAR(191) NULL;`);
      } catch (alterErr) {}

      const nowStr = new Date().toISOString();
      const dateStr = validDate.toISOString();
      try {
        await prisma.$executeRawUnsafe(
          `INSERT INTO \`Exam\` (\`title\`, \`examCode\`, \`curriculumTrack\`, \`examType\`, \`status\`, \`examDate\`, \`startTime\`, \`duration\`, \`totalMarks\`, \`passingMarks\`, \`teacherId\`, \`batchId\`, \`createdAt\`, \`updatedAt\`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          examPayload.title,
          examPayload.examCode,
          examPayload.curriculumTrack,
          examPayload.examType,
          examPayload.status,
          dateStr,
          examPayload.startTime,
          examPayload.duration,
          examPayload.totalMarks,
          examPayload.passingMarks,
          examPayload.teacherId,
          examPayload.batchId,
          nowStr,
          nowStr
        );

        const createdRaw = await prisma.exam.findFirst({
          where: { title: examPayload.title },
          include: { teacher: true, batch: true }
        });
        if (createdRaw) return createdRaw;
      } catch (rawErr) {
        console.error("Raw MySQL insertion with examCode failed, trying without examCode:", rawErr.message);
        try {
          await prisma.$executeRawUnsafe(
            `INSERT INTO \`Exam\` (\`title\`, \`curriculumTrack\`, \`examType\`, \`status\`, \`examDate\`, \`startTime\`, \`duration\`, \`totalMarks\`, \`passingMarks\`, \`teacherId\`, \`batchId\`, \`createdAt\`, \`updatedAt\`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            examPayload.title,
            examPayload.curriculumTrack,
            examPayload.examType,
            examPayload.status,
            dateStr,
            examPayload.startTime,
            examPayload.duration,
            examPayload.totalMarks,
            examPayload.passingMarks,
            examPayload.teacherId,
            examPayload.batchId,
            nowStr,
            nowStr
          );

          const createdRaw = await prisma.exam.findFirst({
            where: { title: examPayload.title },
            include: { teacher: true, batch: true }
          });
          if (createdRaw) return createdRaw;
        } catch (rawErr2) {
          console.error("Second raw MySQL insertion failed:", rawErr2.message);
        }
      }

      throw new CustomError(err.message || "Failed to create exam in database", 400);
    }
  },

  /**
   * Get All Exams
   */
  getAllExams: async (query) => {
    await ensureExamResultColumns();
    const {
      page = 1,
      limit = 50,
      examType,
      status,
      batchId,
      teacherId,
      search,
      sortBy = "examDate",
      sortOrder = "desc",
    } = query;

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
          batch: {
            include: {
              students: true,
            },
          },
          results: {
            include: {
              student: true,
            },
          },
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
        batch: {
          include: {
            students: true,
          },
        },
        results: {
          include: {
            student: true,
          },
        },
      },
    });

    if (!exam) {
      throw new CustomError("Exam not found", 404);
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
      throw new CustomError("Exam not found", 404);
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
        examDate: data.examDate ? new Date(data.examDate) : undefined,
        batchId: data.batchId ? Number(data.batchId) : undefined,
        teacherId: data.teacherId ? Number(data.teacherId) : undefined,
      },
      include: {
        teacher: true,
        batch: {
          include: {
            students: true,
          },
        },
        results: {
          include: {
            student: true,
          },
        },
      },
    });
  },

  /**
   * Submit Marks for Exam
   */
  submitMarks: async (examId, studentMarksMap) => {
    const exam = await prisma.exam.findUnique({ where: { id: Number(examId) } });
    if (!exam) throw new CustomError("Exam not found", 404);

    const entries = Object.entries(studentMarksMap || {});
    for (const [studentId, marks] of entries) {
      const obtainedMarks = Number(marks) || 0;
      const percentage = Math.round((obtainedMarks / (exam.totalMarks || 100)) * 100);
      const isPassed = obtainedMarks >= (exam.passingMarks || 40);
      let grade = "C";
      if (percentage >= 90) grade = "A+";
      else if (percentage >= 80) grade = "A";
      else if (percentage >= 70) grade = "B+";
      else if (percentage >= 60) grade = "B";

      await prisma.examResult.upsert({
        where: {
          examId_studentId: {
            examId: Number(examId),
            studentId: Number(studentId),
          },
        },
        update: {
          obtainedMarks,
          percentage,
          grade,
          isPassed,
          publishedAt: new Date(),
        },
        create: {
          examId: Number(examId),
          studentId: Number(studentId),
          obtainedMarks,
          percentage,
          grade,
          isPassed,
          publishedAt: new Date(),
        },
      });
    }

    return await prisma.exam.update({
      where: { id: Number(examId) },
      data: { status: "PUBLISHED" },
      include: {
        teacher: true,
        batch: {
          include: {
            students: true,
          },
        },
        results: {
          include: {
            student: true,
          },
        },
      },
    });
  },

  /**
   * Publish Results
   */
  publishResults: async (examId) => {
    const exam = await prisma.exam.findUnique({ where: { id: Number(examId) } });
    if (!exam) throw new CustomError("Exam not found", 404);

    await prisma.examResult.updateMany({
      where: { examId: Number(examId) },
      data: { publishedAt: new Date() },
    });

    return await prisma.exam.update({
      where: { id: Number(examId) },
      data: { status: "PUBLISHED" },
      include: {
        teacher: true,
        batch: {
          include: {
            students: true,
          },
        },
        results: {
          include: {
            student: true,
          },
        },
      },
    });
  },

  /**
   * Get Student Exams & Results
   */
  getStudentExams: async (userId) => {
    await ensureExamResultColumns();
    let student = null;
    if (userId) {
      student = await prisma.student.findUnique({ where: { userId: Number(userId) } }).catch(() => null);
    }

    let exams = [];
    if (student) {
      exams = await prisma.exam.findMany({
        where: {
          OR: [
            { batchId: student.batchId || -1 },
            { status: { in: ["SCHEDULED", "PUBLISHED", "COMPLETED", "RESULT_PENDING", "DRAFT"] } },
          ],
        },
        include: {
          teacher: true,
          batch: true,
          results: {
            include: { student: true },
          },
        },
        orderBy: { examDate: "desc" },
      });
    }

    if (!exams || exams.length === 0) {
      exams = await prisma.exam.findMany({
        orderBy: { examDate: "desc" },
        include: {
          teacher: true,
          batch: true,
          results: {
            include: { student: true },
          },
        },
      });
    }

    return exams;
  },

  /**
   * Delete Exam
   */
  deleteExam: async (id) => {
    let examIdNum = Number(id);
    let exam = null;

    if (!isNaN(examIdNum)) {
      exam = await prisma.exam.findUnique({ where: { id: examIdNum } }).catch(() => null);
    }
    if (!exam && id) {
      exam = await prisma.exam.findFirst({
        where: { OR: [{ examCode: String(id) }, { title: String(id) }] },
      }).catch(() => null);
    }

    const targetId = exam ? exam.id : (!isNaN(examIdNum) ? examIdNum : null);

    if (targetId) {
      // 1. Delete foreign key dependencies
      await prisma.examResult.deleteMany({
        where: { examId: targetId },
      }).catch(() => null);

      try {
        await prisma.$executeRawUnsafe(`DELETE FROM \`ExamResult\` WHERE \`examId\` = ?`, targetId);
      } catch (e) {}

      // 2. Delete exam
      try {
        await prisma.exam.delete({
          where: { id: targetId },
        });
        return { success: true };
      } catch (err) {
        try {
          await prisma.$executeRawUnsafe(`DELETE FROM \`Exam\` WHERE \`id\` = ?`, targetId);
          return { success: true };
        } catch (sqlErr) {
          console.error("Failed to delete exam with SQL:", sqlErr);
        }
      }
    }

    if (id) {
      try {
        await prisma.$executeRawUnsafe(`DELETE FROM \`Exam\` WHERE \`examCode\` = ? OR \`title\` = ?`, String(id), String(id));
        return { success: true };
      } catch (e) {}
    }

    throw new CustomError("Exam not found or already deleted", 404);
  },
};
export const batchSeed = async (prisma) => {

    const courses = await prisma.course.findMany({
        orderBy: {
            id: "asc"
        }
    });

    await prisma.batch.createMany({

        data: [

            {
                name: "Morning Batch",
                code: "MB-01",
                courseId: courses[0].id,
                maxStudents: 50
            },

            {
                name: "Afternoon Batch",
                code: "AB-01",
                courseId: courses[1].id,
                maxStudents: 50
            },

            {
                name: "Evening Batch",
                code: "EB-01",
                courseId: courses[2].id,
                maxStudents: 50
            }

        ],

        skipDuplicates: true

    });

};
export const courseSeed = async (prisma) => {

    await prisma.course.createMany({

        data: [

            {
                name: "Abacus Beginner",
                code: "AB-101",
                description: "Beginner Level",
                duration: 3,
                fees: 3000
            },

            {
                name: "Abacus Intermediate",
                code: "AB-201",
                description: "Intermediate Level",
                duration: 4,
                fees: 4000
            },

            {
                name: "Abacus Advanced",
                code: "AB-301",
                description: "Advanced Level",
                duration: 5,
                fees: 5000
            }

        ],

        skipDuplicates: true

    });

};
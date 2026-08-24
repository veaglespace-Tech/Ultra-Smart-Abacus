import { PrismaClient } from "@prisma/client";

import { studentSeed } from "./seeds/studentSeed.js";
import { courseSeed } from "./seeds/courseSeed.js";
import { batchSeed } from "./seeds/batchSeed.js";
import { teacherSeed } from "./seeds/teacherSeed.js";
import { adminSeed } from "./seeds/adminSeed.js";

const prisma = new PrismaClient();

async function main() {
    await adminSeed(prisma);
    await courseSeed(prisma);
    await batchSeed(prisma);
    await studentSeed(prisma);
    await teacherSeed(prisma);
}

main()

    .then(async () => {

        console.log("✅ Database Seeded");

        await prisma.$disconnect();

    })

    .catch(async (error) => {

        console.error(error);

        await prisma.$disconnect();

        process.exit(1);

    });
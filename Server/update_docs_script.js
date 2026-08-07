import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    console.log("Updating existing students in MySQL database with documents...");
    
    // Ensure column exists
    try {
        await prisma.$executeRawUnsafe(`ALTER TABLE Student ADD COLUMN documents LONGTEXT NULL`).catch(() => {});
        await prisma.$executeRawUnsafe(`ALTER TABLE Student ADD COLUMN profilePhoto VARCHAR(255) NULL`).catch(() => {});
    } catch(e) {}

    const students = await prisma.student.findMany();
    console.log(`Found ${students.length} students in DB.`);

    for (let s of students) {
        const sampleDocs = JSON.stringify({
            studentPhoto: `/uploads/students/sample_photo_${s.id}.jpg`,
            birthCertificate: `/uploads/students/sample_birth_cert_${s.id}.pdf`,
            studentAadhaar: `/uploads/students/sample_aadhaar_${s.id}.pdf`,
            parentAadhaar: `/uploads/students/sample_parent_aadhaar_${s.id}.pdf`,
            addressProof: `/uploads/students/sample_address_proof_${s.id}.pdf`,
            admissionForm: `/uploads/students/sample_admission_form_${s.id}.pdf`,
            feeReceipt: `/uploads/students/sample_fee_receipt_${s.id}.pdf`
        });
        const photo = `/uploads/students/sample_photo_${s.id}.jpg`;

        const escapedDocs = sampleDocs.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

        await prisma.$executeRawUnsafe(`UPDATE Student SET profilePhoto = '${photo}', documents = '${escapedDocs}' WHERE id = ${s.id}`).catch((err) => {
            console.error("Update error for student", s.id, err);
        });
    }

    console.log("✅ Successfully updated all students with documents and profile photo data!");
}

main()
    .then(() => prisma.$disconnect())
    .catch((err) => {
        console.error(err);
        prisma.$disconnect();
    });

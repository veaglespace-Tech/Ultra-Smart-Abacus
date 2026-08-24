export const studentSeed = async (prisma) => {
  for (let i = 1; i <= 55; i++) {
    const email = `student${i}@gmail.com`;
    const existing = await prisma.student.findUnique({
      where: { email }
    });

    const sampleDocs = JSON.stringify({
      studentPhoto: `/uploads/students/sample_photo_${i}.jpg`,
      birthCertificate: `/uploads/students/sample_birth_cert_${i}.pdf`,
      studentAadhaar: `/uploads/students/sample_aadhaar_${i}.pdf`,
      parentAadhaar: `/uploads/students/sample_parent_aadhaar_${i}.pdf`,
      addressProof: `/uploads/students/sample_address_proof_${i}.pdf`,
      admissionForm: `/uploads/students/sample_admission_form_${i}.pdf`,
      feeReceipt: `/uploads/students/sample_fee_receipt_${i}.pdf`
    });

    const profilePhoto = `/uploads/students/sample_photo_${i}.jpg`;

    if (!existing) {
      await prisma.student.create({
        data: {
          name: `Student ${i}`,
          email,
          password: `password${i}`,
          batchId: 1,
          profilePhoto,
          documents: sampleDocs
        }
      });
    } else {
      await prisma.student.update({
        where: { id: existing.id },
        data: {
          profilePhoto: existing.profilePhoto || profilePhoto,
          documents: existing.documents || sampleDocs
        }
      }).catch(() => {});
    }
  }
};
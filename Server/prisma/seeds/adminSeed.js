import bcrypt from "bcrypt";

export async function adminSeed(prisma) {
  const hashPassword = await bcrypt.hash("admin123", 10);
  const franchisePassword = await bcrypt.hash("franchise123", 10);

  // 1. Seed Admin Account
  const adminEmail = "admin@abacus.com";
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        name: "System Super Admin",
        email: adminEmail,
        password: hashPassword,
        role: "ADMIN",
        phone: "9999988888",
        city: "Pune",
        address: "Headquarters, Abacus Tower"
      }
    });
    console.log("✅ Admin user seeded: admin@abacus.com / admin123");
  } else {
    // Ensure role is ADMIN and password updated
    await prisma.user.update({
      where: { email: adminEmail },
      data: {
        role: "ADMIN",
        password: hashPassword
      }
    });
    console.log("✅ Admin user updated: admin@abacus.com / admin123");
  }

  // 2. Seed Franchise Account
  const franchiseEmail = "franchise@abacus.com";
  const existingFranchise = await prisma.user.findUnique({
    where: { email: franchiseEmail }
  });

  if (!existingFranchise) {
    const franchiseUser = await prisma.user.create({
      data: {
        name: "Mumbai West Center Admin",
        email: franchiseEmail,
        password: franchisePassword,
        role: "FRANCHISE",
        phone: "9876543210",
        city: "Mumbai",
        address: "Andheri West, Mumbai"
      }
    });

    await prisma.franchise.create({
      data: {
        userId: franchiseUser.id,
        centerName: "Mumbai West Center",
        centerCode: "MW-001",
        contactPerson: "Franchise Manager",
        phone: "9876543210",
        email: franchiseEmail,
        address: "Andheri West, Mumbai"
      }
    });
    console.log("✅ Franchise user seeded: franchise@abacus.com / franchise123");
  }
}

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  const name = "Admin";
  const email = "admin@example.com";
  const password = "admin123";
  const hashedPassword = await bcrypt.hash(password, 8);

  try {
    const admin = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "admin",
      },
    });

    console.log("Admin user created successfully:", admin);
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();

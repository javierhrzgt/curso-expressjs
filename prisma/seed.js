import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.user.deleteMany();
  console.log("All Users deleted.");

  const demoUsers = [
    {
      name: "Juan Perez",
      email: "juan.perez@example.com",
      password: "PASS1234",
      role: "USER",
    },
    {
      name: "Maria Lopez",
      email: "maria.lopez@example.com",
      password: "PASS1234",
      role: "USER",
    },
    {
      name: "Carlos Garcia",
      email: "carlos.garcia@example.com",
      password: "PASS1234",
      role: "USER",
    },
  ];

  for (const user of demoUsers) {
    await prisma.user.create({
      data: user,
    });
  }

  console.log("Usuarios de demostración creados con éxito");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

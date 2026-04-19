import { OrderStatus, Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const users = [
    { id: 1, name: "Nguyen Van A", email: "vana@example.com" },
    { id: 2, name: "Tran Thi B", email: "thib@example.com" },
    { id: 3, name: "Le Van C", email: "vanc@example.com" },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: {
        name: user.name,
        email: user.email,
      },
      create: user,
    });
  }

  const foods = [
    {
      id: 1,
      name: "Com ga xoi mo",
      price: new Prisma.Decimal("45000.00"),
      description: "Com ga gion kem dua leo",
    },
    {
      id: 2,
      name: "Pho bo tai",
      price: new Prisma.Decimal("55000.00"),
      description: "Pho bo tai mem, nuoc dung dam da",
    },
    {
      id: 3,
      name: "Bun cha Ha Noi",
      price: new Prisma.Decimal("50000.00"),
      description: "Bun cha nuong an kem rau song",
    },
  ];

  for (const food of foods) {
    await prisma.food.upsert({
      where: { id: food.id },
      update: {
        name: food.name,
        price: food.price,
        description: food.description,
      },
      create: food,
    });
  }

  await prisma.order.upsert({
    where: { id: 1 },
    update: {
      userId: 1,
      foodId: 1,
      quantity: 2,
      totalPrice: new Prisma.Decimal("90000.00"),
      status: OrderStatus.SUCCESS,
    },
    create: {
      id: 1,
      userId: 1,
      foodId: 1,
      quantity: 2,
      totalPrice: new Prisma.Decimal("90000.00"),
      status: OrderStatus.SUCCESS,
    },
  });

  console.log("Seed completed: users, foods, orders");
}

main()
  .catch((error) => {
    console.error("Seed failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

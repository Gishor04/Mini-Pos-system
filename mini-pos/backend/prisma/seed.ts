import { PrismaClient, Role, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Seed Admin User
  const adminEmail = 'admin@example.com';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        name: 'Admin Manager',
        email: adminEmail,
        password: hashedPassword,
        role: Role.ADMIN,
      },
    });
    console.log('Seeded admin user: admin@example.com / password123 (ADMIN)');
  } else {
    await prisma.user.update({
      where: { email: adminEmail },
      data: { role: Role.ADMIN },
    });
    console.log('Admin user updated to ADMIN role');
  }

  // Seed Cashier User
  const cashierEmail = 'cashier@example.com';
  const existingCashier = await prisma.user.findUnique({ where: { email: cashierEmail } });
  if (!existingCashier) {
    await prisma.user.create({
      data: {
        name: 'Sarah Cashier',
        email: cashierEmail,
        password: hashedPassword,
        role: Role.USER,
      },
    });
    console.log('Seeded cashier user: cashier@example.com / password123 (USER)');
  } else {
    console.log('Cashier user already exists');
  }

  const count = await prisma.product.count();
  if (count === 0) {
    await prisma.product.createMany({
      data: [
        { name: 'Fresh Milk 1L', category: 'Dairy', sku: 'MILK-001', price: new Prisma.Decimal(2.50), stockQuantity: 50 },
        { name: 'Whole Wheat Bread', category: 'Bakery', sku: 'BREAD-001', price: new Prisma.Decimal(1.80), stockQuantity: 30 },
        { name: 'Basmati Rice 5kg', category: 'Grocery', sku: 'RICE-001', price: new Prisma.Decimal(12.00), stockQuantity: 20 },
        { name: 'Organic Eggs (12 pcs)', category: 'Dairy', sku: 'EGGS-001', price: new Prisma.Decimal(3.50), stockQuantity: 40 },
        { name: 'Arabica Coffee Beans 250g', category: 'Beverages', sku: 'COFFEE-001', price: new Prisma.Decimal(8.50), stockQuantity: 25 },
        { name: 'Potato Chips', category: 'Snacks', sku: 'CHIPS-001', price: new Prisma.Decimal(4.50), stockQuantity: 45 },
      ],
    });
    console.log('Seeded initial catalog products');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

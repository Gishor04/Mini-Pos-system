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
        // Beverages
        { name: 'Fresh Milk 1L', category: 'Beverages', sku: 'MILK-001', price: new Prisma.Decimal(2.50), stockQuantity: 50 },
        { name: 'Arabica Coffee Beans 250g', category: 'Beverages', sku: 'COFFEE-001', price: new Prisma.Decimal(8.50), stockQuantity: 25 },
        { name: 'Classic Cola 500ml', category: 'Beverages', sku: 'COLA-001', price: new Prisma.Decimal(1.50), stockQuantity: 100 },
        { name: 'Orange Juice 1L', category: 'Beverages', sku: 'JUICE-001', price: new Prisma.Decimal(3.20), stockQuantity: 40 },
        
        // Bakery
        { name: 'Whole Wheat Bread', category: 'Bakery', sku: 'BREAD-001', price: new Prisma.Decimal(1.80), stockQuantity: 30 },
        { name: 'Butter Croissant', category: 'Bakery', sku: 'CROI-001', price: new Prisma.Decimal(2.20), stockQuantity: 15 },
        { name: 'Blueberry Muffin', category: 'Bakery', sku: 'MUFF-001', price: new Prisma.Decimal(2.80), stockQuantity: 20 },
        { name: 'Chocolate Cake Slice', category: 'Bakery', sku: 'CAKE-001', price: new Prisma.Decimal(4.50), stockQuantity: 10 },
        
        // Grocery
        { name: 'Basmati Rice 5kg', category: 'Grocery', sku: 'RICE-001', price: new Prisma.Decimal(12.00), stockQuantity: 20 },
        { name: 'Olive Oil 500ml', category: 'Grocery', sku: 'OIL-001', price: new Prisma.Decimal(7.50), stockQuantity: 35 },
        { name: 'Pasta Spaghetti 500g', category: 'Grocery', sku: 'PASTA-001', price: new Prisma.Decimal(1.20), stockQuantity: 60 },
        { name: 'Tomato Ketchup 400g', category: 'Grocery', sku: 'KETCH-001', price: new Prisma.Decimal(2.10), stockQuantity: 45 },
        
        // Dairy
        { name: 'Organic Eggs (12 pcs)', category: 'Dairy', sku: 'EGGS-001', price: new Prisma.Decimal(3.50), stockQuantity: 40 },
        { name: 'Cheddar Cheese 200g', category: 'Dairy', sku: 'CHEES-001', price: new Prisma.Decimal(4.20), stockQuantity: 25 },
        { name: 'Greek Yogurt 500g', category: 'Dairy', sku: 'YOG-001', price: new Prisma.Decimal(3.80), stockQuantity: 30 },
        { name: 'Salted Butter 250g', category: 'Dairy', sku: 'BUTT-001', price: new Prisma.Decimal(2.90), stockQuantity: 0 }, // Out of stock example
        
        // Snacks
        { name: 'Potato Chips Salted', category: 'Snacks', sku: 'CHIPS-001', price: new Prisma.Decimal(1.50), stockQuantity: 80 },
        { name: 'Dark Chocolate Bar 100g', category: 'Snacks', sku: 'CHOC-001', price: new Prisma.Decimal(2.50), stockQuantity: 3 }, // Low stock example
        { name: 'Mixed Nuts 200g', category: 'Snacks', sku: 'NUTS-001', price: new Prisma.Decimal(5.50), stockQuantity: 40 },
        { name: 'Granola Bar', category: 'Snacks', sku: 'GRAN-001', price: new Prisma.Decimal(1.00), stockQuantity: 120 },
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

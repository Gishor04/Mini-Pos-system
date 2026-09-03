const { PrismaClient, Prisma } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const userId = 4; // Use the userId we got from our previous test
    
    // Simulate what SalesService does
    let totalAmount = new Prisma.Decimal(0);
    const preparedItems = [];
    
    const items = [
      { productId: 1, quantity: 1 }
    ];

    for (const itemDto of items) {
      const product = await prisma.product.findUnique({
        where: { id: itemDto.productId },
      });

      if (!product) {
        throw new Error(`Product ID ${itemDto.productId} not found`);
      }

      if (product.stockQuantity < itemDto.quantity) {
        throw new Error(`Insufficient stock for "${product.name}"`);
      }

      // Check where this might fail!
      console.log('Product price:', product.price);
      console.log('Type of product.price:', typeof product.price);
      
      const unitPrice = new Prisma.Decimal(product.price.toString());
      const subtotal = unitPrice.mul(itemDto.quantity);
      totalAmount = totalAmount.add(subtotal);

      preparedItems.push({
        productId: product.id,
        quantity: itemDto.quantity,
        unitPrice,
        subtotal,
        productName: product.name,
      });

      await prisma.product.update({
        where: { id: product.id },
        data: {
          stockQuantity: {
            decrement: itemDto.quantity,
          },
        },
      });
    }

    const lastSale = await prisma.sale.findFirst({
      orderBy: { id: 'desc' },
    });
    const nextId = (lastSale ? lastSale.id : 0) + 1;
    const invoiceNumber = `INV-${String(nextId).padStart(6, '0')}`;

    console.log('Creating sale record...');
    const sale = await prisma.sale.create({
      data: {
        invoiceNumber,
        totalAmount,
        userId,
        items: {
          create: preparedItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
          })),
        },
      },
    });

    console.log('Success:', sale);

  } catch (e) {
    console.error('Error during test:', e);
  } finally {
    await prisma.$disconnect();
  }
}

test();

import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  async createSale(dto: CreateSaleDto, userId: number) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Cannot complete sale with empty cart');
    }

    // Execute in a PostgreSQL transaction
    return this.prisma.$transaction(async (tx) => {
      let totalAmount = new Prisma.Decimal(0);
      const preparedItems: Array<{
        productId: number;
        quantity: number;
        unitPrice: Prisma.Decimal;
        subtotal: Prisma.Decimal;
        productName: string;
      }> = [];

      for (const itemDto of dto.items) {
        const product = await tx.product.findUnique({
          where: { id: itemDto.productId },
        });

        if (!product) {
          throw new NotFoundException(`Product ID ${itemDto.productId} not found`);
        }

        if (product.stockQuantity < itemDto.quantity) {
          throw new BadRequestException(
            `Insufficient stock for "${product.name}". Available: ${product.stockQuantity}, Requested: ${itemDto.quantity}`
          );
        }

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

        // Reduce product stock
        await tx.product.update({
          where: { id: product.id },
          data: {
            stockQuantity: {
              decrement: itemDto.quantity,
            },
          },
        });
      }

      // Generate invoice number e.g. INV-000001
      const lastSale = await tx.sale.findFirst({
        orderBy: { id: 'desc' },
      });
      const nextId = (lastSale ? lastSale.id : 0) + 1;
      const invoiceNumber = `INV-${String(nextId).padStart(6, '0')}`;

      // Create Sale record
      const sale = await tx.sale.create({
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
        include: {
          items: {
            include: {
              product: {
                select: { id: true, name: true, sku: true },
              },
            },
          },
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      return sale;
    });
  }

  async findOne(id: number) {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, sku: true },
            },
          },
        },
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!sale) {
      throw new NotFoundException(`Sale with ID ${id} not found`);
    }

    return sale;
  }

  async findAll() {
    return this.prisma.sale.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, sku: true },
            },
          },
        },
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async getStats() {
    const sales = await this.prisma.sale.findMany({
      include: {
        items: true,
      },
    });

    let totalRevenue = new Prisma.Decimal(0);
    let totalItemsSold = 0;

    for (const sale of sales) {
      totalRevenue = totalRevenue.add(sale.totalAmount);
      for (const item of sale.items) {
        totalItemsSold += item.quantity;
      }
    }

    const lowStockCount = await this.prisma.product.count({
      where: { stockQuantity: { lt: 5 } },
    });

    const totalProducts = await this.prisma.product.count();

    return {
      totalRevenue: totalRevenue.toFixed(2),
      totalSalesCount: sales.length,
      totalItemsSold,
      lowStockCount,
      totalProducts,
    };
  }
}

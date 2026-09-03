import { Controller, Post, Get, Param, Body, UseGuards, Request, ParseIntPipe, HttpException } from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('sales')
@UseGuards(JwtAuthGuard)
export class SalesController {
  constructor(private salesService: SalesService) {}

  @Post()
  async createSale(@Body() createSaleDto: CreateSaleDto, @Request() req: any) {
    try {
      const userId = req.user.sub || req.user.id;
      return await this.salesService.createSale(createSaleDto, userId);
    } catch (e: any) {
      console.error('CREATE SALE ERROR:', e);
      throw new HttpException({ error: e.message, stack: e.stack }, 500);
    }
  }

  @Get()
  async findAll() {
    return this.salesService.findAll();
  }

  @Get('stats')
  async getStats() {
    return this.salesService.getStats();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.salesService.findOne(id);
  }
}

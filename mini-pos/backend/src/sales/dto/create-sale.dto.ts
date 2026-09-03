import { IsArray, IsInt, IsNotEmpty, Min, ValidateNested, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSaleItemDto {
  @IsInt()
  @IsNotEmpty()
  productId!: number;

  @IsInt()
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity!: number;

  @IsOptional()
  @IsNumber()
  unitPrice?: number;

  @IsOptional()
  @IsString()
  productName?: string;

  @IsOptional()
  @IsString()
  productSku?: string;
}

export class CreateSaleDto {
  @IsArray()
  @IsNotEmpty({ message: 'Cart items cannot be empty' })
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  items!: CreateSaleItemDto[];
}

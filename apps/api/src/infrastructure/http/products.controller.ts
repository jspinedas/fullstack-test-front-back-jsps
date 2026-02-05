import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { GetProductByIdUseCase } from '../../application/use-cases/get-product-by-id.use-case';

@Controller('products')
export class ProductsController {
  constructor(private readonly getProductByIdUseCase: GetProductByIdUseCase) {}

  @Get(':id')
  async getById(@Param('id') id: string) {
    const result = await this.getProductByIdUseCase.execute(id);

    if (!result.ok) {
      throw new NotFoundException({ message: 'Product not found' });
    }

    return result.value;
  }
}

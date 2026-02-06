import { Body, Controller, HttpCode, HttpException, HttpStatus, Post } from '@nestjs/common';
import { StartCheckoutUseCase } from '../../application/use-cases/start-checkout.use-case';
import { ConfirmCheckoutUseCase } from '../../application/use-cases/confirm-checkout.use-case';
import { ConfirmCheckoutDto, StartCheckoutDto } from './checkout.dto';

@Controller('checkout')
export class CheckoutController {
  constructor(
    private readonly startCheckoutUseCase: StartCheckoutUseCase,
    private readonly confirmCheckoutUseCase: ConfirmCheckoutUseCase,
  ) {}

  @Post('start')
  @HttpCode(HttpStatus.CREATED)
  async start(@Body() dto: StartCheckoutDto) {
    const result = await this.startCheckoutUseCase.execute({
      productId: dto.productId,
      deliveryInfo: dto.deliveryData,
      baseFee: dto.baseFee,
      deliveryFee: dto.deliveryFee,
    });

    if (!result.ok) {
      const error = (result as { ok: false; error: string }).error;
      if (error === 'PRODUCT_NOT_FOUND') {
        throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
      }
      if (error === 'INSUFFICIENT_STOCK') {
        throw new HttpException(
          'Insufficient stock',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      transactionId: result.value.transactionId,
    };
  }

  @Post('confirm')
  @HttpCode(HttpStatus.OK)
  async confirm(@Body() dto: ConfirmCheckoutDto) {
    const result = await this.confirmCheckoutUseCase.execute({
      transactionId: dto.transactionId,
      paymentData: dto.paymentData,
    });

    if (!result.ok) {
      const error = (result as { ok: false; error: string }).error;
      if (error === 'TRANSACTION_NOT_FOUND') {
        throw new HttpException(
          'Transaction not found',
          HttpStatus.NOT_FOUND,
        );
      }
      if (error === 'INSUFFICIENT_STOCK') {
        throw new HttpException(
          'Insufficient stock',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      transactionId: result.value.transaction.id,
      status: result.value.transaction.status,
      message:
        result.value.transaction.status === 'SUCCESS'
          ? 'Payment successful'
          : 'Payment failed',
    };
  }
}

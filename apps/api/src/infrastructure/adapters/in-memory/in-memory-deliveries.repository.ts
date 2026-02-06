import { Injectable } from '@nestjs/common';
import {
  DeliveriesRepositoryPort,
  DeliveryRepositoryError,
} from '../../../application/ports/deliveries-repository.port';
import { Err, Ok, Result } from '../../../application/use-cases/result';
import { Delivery } from '../../../domain/delivery';

@Injectable()
export class InMemoryDeliveriesRepository
  implements DeliveriesRepositoryPort
{
  private deliveries = new Map<string, Delivery>();

  async create(
    delivery: Delivery,
  ): Promise<Result<Delivery, DeliveryRepositoryError>> {
    if (this.deliveries.has(delivery.id)) {
      return Err('DELIVERY_ALREADY_EXISTS');
    }
    this.deliveries.set(delivery.id, delivery);
    return Ok(delivery);
  }
}

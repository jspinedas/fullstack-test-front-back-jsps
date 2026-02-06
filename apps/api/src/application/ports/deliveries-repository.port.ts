import { Delivery } from '../../domain/delivery';
import { Result } from '../use-cases/result';

export type DeliveryRepositoryError =
  | 'DELIVERY_ALREADY_EXISTS'
  | 'DATABASE_ERROR';

export interface DeliveriesRepositoryPort {
  create(
    delivery: Delivery,
  ): Promise<Result<Delivery, DeliveryRepositoryError>>;
}

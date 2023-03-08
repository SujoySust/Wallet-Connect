import { ObjectType } from '@nestjs/graphql';
import PaginatedResponse from '../../../libs/graphql/pagination/pagination';
import { PaymentTokenModel } from '../paymentToken.model';

@ObjectType()
export class PaymentTokenConnection extends PaginatedResponse(
  PaymentTokenModel,
) {}

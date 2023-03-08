import { ObjectType } from '@nestjs/graphql';
import PaginatedResponse from '../../../libs/graphql/pagination/pagination';
import { AmountCalculationModel } from '../amountCalculation.model';

@ObjectType()
export class AmountCalculationConnection extends PaginatedResponse(
  AmountCalculationModel,
) {}

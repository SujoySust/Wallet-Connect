import { ObjectType } from '@nestjs/graphql';
import { Exchange } from 'src/app/modules/exchange/exchange.model';
import PaginatedResponse from '../../../libs/graphql/pagination/pagination';

@ObjectType()
export class ExchangeConnection extends PaginatedResponse(Exchange) {}

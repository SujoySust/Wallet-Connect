import { ObjectType } from '@nestjs/graphql';
import { SellOffer } from 'src/app/modules/offer/sell/sell-offer.model';
import PaginatedResponse from '../../../libs/graphql/pagination/pagination';

@ObjectType()
export class SellOfferConnection extends PaginatedResponse(SellOffer) {}

import { ObjectType } from '@nestjs/graphql';
import { BuyOffer } from 'src/app/modules/offer/buy/buy-offer.model';
import PaginatedResponse from '../../../libs/graphql/pagination/pagination';

@ObjectType()
export class BuyOfferConnection extends PaginatedResponse(BuyOffer) {}

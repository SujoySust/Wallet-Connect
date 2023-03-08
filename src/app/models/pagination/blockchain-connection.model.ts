import { ObjectType } from '@nestjs/graphql';
import {
  BlockchainModel,
  BlockchainStaffModel,
} from 'src/app/modules/staff/blockchain/blockchain.model';
import PaginatedResponse from '../../../libs/graphql/pagination/pagination';

@ObjectType()
export class BlockchainConnection extends PaginatedResponse(BlockchainModel) {}

@ObjectType()
export class BlockchainStaffConnection extends PaginatedResponse(
  BlockchainStaffModel,
) {}

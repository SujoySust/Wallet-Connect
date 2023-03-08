import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Receipt {
  @Field()
  transactionHash: string;
  transactionIndex: number;
  blockHash: string;
  blockNumber: number;
  from: string;
  to: string;
  contractAddress: string;
  cumulativeGasUsed: number;
  gasUsed: number;
  status: boolean;
}

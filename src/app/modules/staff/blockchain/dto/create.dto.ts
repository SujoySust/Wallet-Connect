import { Field, Float, HideField, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';
import { FileUpload, GraphQLUpload, Upload } from 'graphql-upload';
import { __ } from 'src/app/helpers/functions';
import { Unique } from 'src/libs/decorators/unique.decorator';
@InputType()
export class BlockChainBaseDto {
  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  rpc_url?: string;

  @Field({ nullable: true })
  public_rpc_url?: string;

  @Field({ nullable: true })
  wss_url?: string;

  @Field({ nullable: true })
  api_key?: string;

  @Field()
  provider: number;

  @Field({ nullable: true })
  explorer_url?: string;

  @Field()
  currency_symbol: string;

  @Field({ nullable: true })
  nft_contract?: string;

  @Field({ nullable: true })
  exchange_contract?: string;

  @Field(() => GraphQLUpload, { nullable: true })
  logo?: FileUpload;

  @Field({ nullable: true })
  status: number;
}

@InputType()
export class CreateBlockChainDto extends BlockChainBaseDto {
  @Field()
  @IsString()
  @IsNotEmpty()
  @Unique('Blockchain', { message: () => __('Slug must be unique') })
  slug: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  @Unique('Blockchain', { message: () => __('Network name must be unique') })
  network_name: string;
}

@InputType()
export class UpdateBlockChainDto extends BlockChainBaseDto {
  @Field()
  @IsString()
  @IsNotEmpty()
  slug: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  network_name: string;
}

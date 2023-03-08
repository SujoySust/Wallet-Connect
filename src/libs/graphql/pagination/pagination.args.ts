import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class PaginationArgs {
  skip?: number;

  after?: string;

  before?: string;

  first?: number;

  last?: number;
}

@ArgsType()
export class SearchArgs {
  @Field(() => [String], { description: 'columns for search' })
  columns?: string[];

  @Field({ description: 'value for search in given columns' })
  value?: string;
}

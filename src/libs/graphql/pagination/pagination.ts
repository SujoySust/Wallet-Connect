import { Field, ObjectType, Int } from '@nestjs/graphql';
import { PageInfo } from './page-info.model';
import { Type } from '@nestjs/common';

export default function Paginated<TItem>(TItemClass: Type<TItem>): any {
  @ObjectType(`${TItemClass.name}Edge`)
  abstract class EdgeType {
    @Field(() => String)
    cursor: string;

    @Field(() => TItemClass)
    node: TItem;
  }

  // `isAbstract` decorator option is mandatory to prevent registering in schema
  @ObjectType({ isAbstract: true })
  abstract class PaginatedType {
    @Field(() => [EdgeType], { nullable: true })
    edges: Array<EdgeType>;

    // @Field((type) => [TItemClass], { nullable: true })
    // nodes: Array<TItem>;

    @Field(() => PageInfo)
    pageInfo: PageInfo;

    @Field(() => Int, { nullable: true })
    totalCount?: number;
  }
  return PaginatedType;
}

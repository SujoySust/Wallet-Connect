/* eslint-disable @typescript-eslint/no-var-requires */
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ResponseModel } from 'src/app/models/dto/response.model';
import { SearchModel } from 'src/app/models/dto/search.model';
import { HomeService } from './home.service';

@Resolver()
export class HomeResolver {
  constructor(private readonly homeService: HomeService) {}

  @Query(() => SearchModel)
  async globalSearch(
    @Args('query') query: string,
    @Args('limit', { nullable: true }) limit: number,
  ): Promise<SearchModel> {
    return await this.homeService.globalSearch(query, limit);
  }

  @Mutation(() => ResponseModel)
  async saveNewsLetterSubscription(
    @Args('email') email: string,
  ): Promise<ResponseModel> {
    return await this.homeService.saveNewsLetterSubscription(email);
  }
}

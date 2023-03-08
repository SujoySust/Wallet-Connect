import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { RolePermissionGuard } from '../../../guards/role-permission.guard';
import { Category } from '../../../models/category.model';
import { GqlAuthGuard } from '../../../../libs/auth/gql.auth.guard';
import { CategoryConnection } from '../../../models/pagination/category-connection.model';
import { PaginationArgs } from '../../../../libs/graphql/pagination/pagination.args';
import { CategoryFilter } from './dto/filter.dto';
import { Order } from '../../../models/input/order.input';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/create.dto';
import { ResponseModel } from 'src/app/models/dto/response.model';
import { PERMISSION_KEY_CATEGORY } from 'src/app/helpers/permission_constant';

@Resolver(() => Category)
export class CategoryResolver {
  constructor(private readonly categoryService: CategoryService) {}

  @Query(() => [Category])
  async getCategories(
    @Args({ name: 'status', type: () => Int, nullable: true }) status,
  ): Promise<Category[]> {
    return await this.categoryService.getCategories(status);
  }

  @Query(() => Category)
  async getCategoryById(
    @Args({ name: 'id', type: () => Int }) id,
  ): Promise<Category> {
    return await this.categoryService.getCategoryByID(id);
  }

  @UseGuards(GqlAuthGuard('staff'))
  @UseGuards(new RolePermissionGuard(PERMISSION_KEY_CATEGORY))
  @Query(() => CategoryConnection)
  async getCategoryList(
    @Args({ name: 'paginateNumber', nullable: true }) paginateNumber: number,
    @Args() paginate: PaginationArgs,
    @Args({ nullable: true }) filter: CategoryFilter,
    @Args({
      name: 'orderBy',
      type: () => Order,
      nullable: true,
    })
    orderBy: Order,
  ): Promise<CategoryConnection> {
    return await this.categoryService.getCategoryList(
      paginate,
      filter,
      orderBy,
    );
  }

  @UseGuards(GqlAuthGuard('staff'))
  @UseGuards(new RolePermissionGuard(PERMISSION_KEY_CATEGORY))
  @Mutation(() => ResponseModel)
  async createCategory(
    @Args('data') data: CreateCategoryDto,
  ): Promise<ResponseModel> {
    return await this.categoryService.createCategory(data);
  }

  @UseGuards(GqlAuthGuard('staff'))
  @UseGuards(new RolePermissionGuard(PERMISSION_KEY_CATEGORY))
  @Mutation(() => ResponseModel)
  async updateCategory(
    @Args({ name: 'id', type: () => Int }) id: number,
    @Args('data') data: UpdateCategoryDto,
  ): Promise<ResponseModel> {
    return await this.categoryService.updateCategory(id, data);
  }

  @UseGuards(GqlAuthGuard('staff'))
  @UseGuards(new RolePermissionGuard(PERMISSION_KEY_CATEGORY))
  @Mutation(() => ResponseModel)
  async deleteCategory(
    @Args({ name: 'id', type: () => Int }) id: number,
  ): Promise<ResponseModel> {
    return await this.categoryService.deleteCategory(id);
  }
}

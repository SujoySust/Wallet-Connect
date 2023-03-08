import { Field, HideField, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';
import { FileUpload, GraphQLUpload } from 'graphql-upload';
import { Unique } from 'src/libs/decorators/unique.decorator';

@InputType()
export class BaseCategoryDto {
  @HideField()
  image: string;

  @Field(() => GraphQLUpload, { nullable: true })
  imageFile: FileUpload;

  @Field({ nullable: true })
  status: number;
}

@InputType()
export class CreateCategoryDto extends BaseCategoryDto {
  @Field()
  @Unique('Category')
  @IsNotEmpty()
  @IsString()
  title: string;
}

@InputType()
export class UpdateCategoryDto extends BaseCategoryDto {
  @Field()
  @IsNotEmpty()
  @IsString()
  title: string;
}

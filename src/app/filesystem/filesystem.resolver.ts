import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { FilesystemService } from './filesystem.service';
import { UserEntity } from '../../libs/decorators/user.decorator';
import { User } from '../models/user.model';
import { GraphQLUpload, FileUpload } from 'graphql-upload';
import { GraphQLError } from 'graphql';
import { FileObject } from './file.object';
import { GqlAuthGuard } from '../../libs/auth/gql.auth.guard';

@Resolver('FilesystemResolver')
export class FilesystemResolver {
  constructor(private readonly filesystemService: FilesystemService) {}
  @UseGuards(GqlAuthGuard('user'))
  @Query(() => [FileObject])
  async listFile(@UserEntity() user: User): Promise<Array<FileObject>> {
    return this.filesystemService.listFile(user);
  }

  @UseGuards(GqlAuthGuard('user'))
  @Mutation(() => FileObject)
  async uploadFile(
    @UserEntity() user: User,
    @Args({ name: 'file', type: () => GraphQLUpload }) upload: FileUpload,
  ): Promise<FileObject> {
    try {
      return await this.filesystemService.upload(upload, `user-${user.id}`);
    } catch (e) {
      console.error(e.stack);
      throw new GraphQLError(e.message);
    }
  }

  @UseGuards(GqlAuthGuard('staff'))
  @Query(() => [FileObject])
  async adminFileList(): Promise<Array<FileObject>> {
    return this.filesystemService.adminFileList();
  }
  @UseGuards(GqlAuthGuard('staff'))
  @Mutation(() => FileObject)
  async adminFileUpload(
    @Args({ name: 'file', type: () => GraphQLUpload }) upload: FileUpload,
  ): Promise<FileObject> {
    try {
      return await this.filesystemService.adminUpload(upload);
    } catch (e) {
      console.error(e.stack);
      throw new GraphQLError(e.message);
    }
  }
}

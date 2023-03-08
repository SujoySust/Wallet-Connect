import { PrismaClient } from '@prisma/client';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { prisma_client } from 'src/app/helpers/functions';
import { lcfirst, __ } from 'src/app/helpers/functions';

export function Exists(
  prismaModel: string,
  validationOptions?: ValidationOptions,
) {
  console.log(prismaModel);
  return (object: any, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [prismaModel],
      validator: ExistsConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'Exists' })
export class ExistsConstraint implements ValidatorConstraintInterface {
  async validate(value: any, args: ValidationArguments) {
    let [client] = args.constraints;
    client = lcfirst(client);
    const column = args.property;
    const where = {};
    where[column] = value;
    const prisma = prisma_client;
    try {
      const data = await prisma[client].findFirst({
        where: where,
      });
      return data ? true : false;
    } catch (e) {
      console.error(
        `Can't find '${args.constraints[0]}' prisma model or column '${column}'.`,
      );
      throw e;
    }
  }

  defaultMessage?(args?: ValidationArguments): string {
    return `${args.property} ` + __('does not exists.');
  }
}

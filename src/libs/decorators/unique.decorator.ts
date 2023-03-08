import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { prisma_client } from 'src/app/helpers/functions';
import { lcfirst, __ } from 'src/app/helpers/functions';

export function Unique(
  prismaModel: string,
  validationOptions?: ValidationOptions,
) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [prismaModel],
      validator: UniqueConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'Unique' })
export class UniqueConstraint implements ValidatorConstraintInterface {
  async validate(value: any, args: ValidationArguments) {
    if (!value) return true;
    let [client] = args.constraints;
    client = lcfirst(client);
    const column = args.property;
    const where = {
      [column]: {
        equals: value,
        mode: 'insensitive',
      },
    };
    const prisma = prisma_client;
    try {
      const data = await prisma[client].findFirst({
        where: where,
      });
      return data ? false : true;
    } catch (e) {
      console.error(
        `Can't find '${args.constraints[0]}' prisma model or column '${column}'.`,
      );
      throw e;
    }
  }

  defaultMessage?(args?: ValidationArguments): string {
    return `${args.property} ` + __('already exists.');
  }
}

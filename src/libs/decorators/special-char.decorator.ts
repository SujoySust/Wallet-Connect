/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { __, containsSpecialChars } from 'src/app/helpers/functions';

export function ProtectSpecialChar(validationOptions?: ValidationOptions) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: ProtectSpecialCharConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'ProtectSpecialChar' })
export class ProtectSpecialCharConstraint
  implements ValidatorConstraintInterface
{
  validate(value: any, args: ValidationArguments) {
    if (value) return !containsSpecialChars(value);
    else return true;
  }
  defaultMessage?(args?: ValidationArguments): string {
    return __('Invalid value.');
  }
}

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { RESTRICTED_KEY_WORDS } from 'src/app/helpers/corearray';
import { __ } from 'src/app/helpers/functions';

export function RestrictedKeyWordsCheck(validationOptions?: ValidationOptions) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: RestrictedKeyWordsCheckConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'RestrictedKeyWordsCheck' })
export class RestrictedKeyWordsCheckConstraint
  implements ValidatorConstraintInterface
{
  validate(value: any, args: ValidationArguments) {
    if (RESTRICTED_KEY_WORDS.includes(value?.toLowerCase())) return false;
    else return true;
  }
  defaultMessage?(args?: ValidationArguments): string {
    return __('Restricted Key Word.');
  }
}

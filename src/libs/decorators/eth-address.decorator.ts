/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { __ } from 'src/app/helpers/functions';
import Web3 from 'web3';
const Web3P = require('web3');

export function IsEthAddress(validationOptions?: ValidationOptions) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: EthAddressConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'IsEthAddress' })
export class EthAddressConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const web3: Web3 = new Web3P();
    return web3.utils.isAddress(value);
  }

  defaultMessage?(args?: ValidationArguments): string {
    return __('Invalid address.');
  }
}

/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/ban-types */

import { UnauthorizedException } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime';
import { __ as trans } from '@squareboat/nestjs-localization/dist/src/helpers';
import { isArray } from 'class-validator';
import { randomUUID } from 'crypto';
import { FileUpload } from 'graphql-upload';
import { SearchArgs } from 'src/libs/graphql/pagination/pagination.args';
import Web3 from 'web3';
import { TransactionConfig } from 'web3-core';
import { TransactionReceipt } from 'web3-eth';
import { PrismaService } from '../../libs/prisma/prisma.service';
import { FileObject } from '../filesystem/file.object';
import { FilesystemService } from '../filesystem/filesystem.service';
import { ResponseModel } from '../models/dto/response.model';
import { User } from '../models/user.model';
import { countryList } from './corearray';
import {
  BLOCK_CONFIRMATION_TO_WAIT,
  CODE_ACCOUNT_NOT_ACTIVE,
  CODE_USER_SUSPENDED,
  FILE_TYPE_IMAGE,
  NEWEST_OR_RECENT_IN_MIN,
  STATUS_ACTIVE,
  STATUS_INACTIVE,
  STATUS_SUSPENDED,
} from './coreconstants';

let encryptor = require('simple-encryptor')(
  process.env.APP_KEY || 'AppKeyShouldBeMinimum16Characters',
);

export let app: NestExpressApplication;
export let prisma_client: PrismaService;
export function setApp(nestapp) {
  app = nestapp;
  prisma_client = app.get(PrismaService);
}

Number.prototype['noExponents'] = function () {
  const data = String(this).split(/[eE]/);
  if (data.length == 1) return data[0];

  let z = '';
  const sign = this < 0 ? '-' : '';
  const str = data[0].replace('.', '');
  let mag = Number(data[1]) + 1;

  if (mag < 0) {
    z = sign + '0.';
    while (mag++) z += '0';
    return z + str.replace(/^\-/, '');
  }
  mag -= str.length;
  while (mag--) z += '0';
  return str + z;
};

BigInt.prototype['noExponents'] = function () {
  const data = String(this).split(/[eE]/);
  if (data.length == 1) return data[0];

  let z = '';
  const sign = this < 0 ? '-' : '';
  const str = data[0].replace('.', '');
  let mag = Number(data[1]) + 1;

  if (mag < 0) {
    z = sign + '0.';
    while (mag++) z += '0';
    return z + str.replace(/^\-/, '');
  }
  mag -= str.length;
  while (mag--) z += '0';
  return str + z;
};

BigInt.prototype['toJSON'] = function () {
  return this.toString();
};

export function hex_to_ascii(str1) {
  const hex = str1.toString();
  let str = '';
  for (let n = 0; n < hex.length; n += 2) {
    str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
  }
  return str;
}

export function ascii_to_hex(str) {
  const arr1 = [];
  for (let n = 0, l = str.length; n < l; n++) {
    const hex = Number(str.charCodeAt(n)).toString(16);
    arr1.push(hex);
  }
  return arr1.join('');
}

export function getRandomNumber(length: number): string {
  let result = '';
  const characters = '0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;

  /* let init_number = 1;
  let multiply_number = 9;
  for (let i = 1; i < digit; i++) {
    init_number *= 10;
    multiply_number *= 10;
  }
  return Math.floor(
    Math.random() * init_number + Math.random() * multiply_number,
  ); */
}

export function getUUID(withSlash = false) {
  let id = randomUUID();
  if (!withSlash) id = id.replace(/-/gi, '');
  return id;
}

export function encrypt(value: string, key?: string) {
  if (key) encryptor = require('simple-encryptor')(key);
  return encryptor.encrypt(Buffer.from(value).toString('base64'));
  // return Buffer.from(encryptor.encrypt(value), 'base64').toString('hex');
}

export function decrypt(value: string, key?: string) {
  if (key) encryptor = require('simple-encryptor')(key);
  return Buffer.from(encryptor.decrypt(value), 'base64').toString('ascii');
  // return encryptor.decrypt(Buffer.from(value, 'hex').toString('base64'));
}

export function randomString(length: number) {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export function convertToSlug(Text: string) {
  return Text.toString() // Cast to string
    .toLowerCase() // Convert the string to lowercase letters
    .normalize('NFD') // The normalize() method returns the Unicode Normalization Form of a given string.
    .trim() // Remove whitespace from both sides of a string
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-');
}

export function __(key) {
  return trans(key, global.lang).replace('ERR::INVALID KEY ==> ', '');
}

export function uniqueCode(prefix?: string, suffix?: string): string {
  return (prefix || '') + String(Date.now()) + (suffix || '');
}

export function successResponse(
  msg?: string,
  data?: object,
  code?: number,
): ResponseModel {
  return {
    success: true,
    message: msg ?? __('Data retrieved successfully.'),
    data: data || null,
    code: code || 200,
  };
}

export function errorResponse(
  msg?: string,
  data?: object,
  code?: number,
  messages?: string[],
): ResponseModel {
  return {
    success: false,
    message: msg || __('Something went wrong.'),
    messages: messages ?? [],
    data: data || null,
    code: code || 500,
  };
}

export function processException(e) {
  checkPrismaError(e);
  if (
    (e.hasOwnProperty('response') &&
      !e.response.hasOwnProperty('success') &&
      !e.response.hasOwnProperty('data')
    ) ||!e.hasOwnProperty('response')
  ) {
    console.error(e.stack);
  }
  throw e;
}

function checkPrismaError(e) {
  /* if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
    const field = e.meta['target'][0];
    if (field === 'email')
      throw new ConflictException(__(`Email already used.`));
    if (field === 'phone')
      throw new ConflictException(__(`Phone number already used.`));
    else {
      console.error(e.stack);
      throw new Error(__('Something went wrong.'));
    }
  } else */ if (
    e instanceof Prisma.PrismaClientKnownRequestError ||
    e instanceof Prisma.PrismaClientUnknownRequestError
  ) {
    console.error(e.stack);
    throw new Error(__('Something went wrong.'));
  }
}

export function lcfirst(str) {
  str += '';
  const f = str.charAt(0).toLowerCase();
  return f + str.substr(1);
}

export function ucfirst(str) {
  str += '';
  const f = str.charAt(0).toUpperCase();
  return f + str.substr(1);
}

export function customeNumberFormat(value: number, decimalPoint = 8) {
  return new Decimal(value.toFixed(decimalPoint));
}

export function isAdmin(user: User) {
  return true;
  //return user.role_id === ROLE_ADMIN;
}

export function isUser(user: User) {
  return false;
  //return user.role_id === ROLE_USER;
}

export async function IgnoreUnique(
  value: any,
  model: string,
  column: string,
  ignoreId: number,
) {
  const client = lcfirst(model);
  const where = {};
  where[column] = value;
  const prisma = prisma_client;
  try {
    const data = await prisma[client].findFirst({
      where: {
        id: {
          not: ignoreId,
        },
        ...where,
      },
    });
    return data
      ? errorResponse(column + __(` already exist`))
      : successResponse('');
  } catch (e) {
    console.error(`Can't find '${model}' prisma model or column '${column}'.`);
    throw e;
  }
}

export function getCountry(input: string = null) {
  if (input != null) {
    return countryList[input];
  } else {
    return countryList;
  }
}

export function userAccountCheck(user) {
  if (user.status === STATUS_SUSPENDED)
    throw new UnauthorizedException(
      errorResponse(
        __('Your account is suspended. Contact to support.'),
        null,
        CODE_USER_SUSPENDED,
      ),
    );
  else if (user.status !== STATUS_ACTIVE)
    throw new UnauthorizedException(
      errorResponse(
        __('Your account is not active. Contact to support.'),
        null,
        CODE_ACCOUNT_NOT_ACTIVE,
      ),
    );
}

export function processSearchColumnsAuto(
  searchArgs: SearchArgs,
  exceptColumns?: string[],
) {
  const data = [];
  if (isArray(searchArgs.columns)) {
    searchArgs.columns.forEach((value) => {
      if (!exceptColumns || !exceptColumns.includes(value)) {
        const obj = {};
        obj[value] = {};
        obj[value]['contains'] = searchArgs.value || undefined;
        obj[value]['mode'] = 'insensitive';
        data.push(obj);
      }
    });
  }
  return data;
}

export function processSearchColumnManually(
  searchArgs: SearchArgs,
  colName: string,
  colType: string,
) {
  if (isArray(searchArgs.columns) && searchArgs.columns.includes(colName)) {
    try {
      if (
        colType === 'decimal' ||
        colType === 'number' ||
        colType === 'bigint'
      ) {
        const val = Number(searchArgs.value);
        return val || undefined;
      }
      return undefined;
    } catch (e) {
      console.error(e.stack);
      return undefined;
    }
  } else {
    return undefined;
  }
}

export function adminPrivateKey() {
  return process.env.ADMIN_PRIVATE_KEY;
}

export async function waitForTxConfirmed(
  txObj: TransactionReceipt,
  web3: Web3,
) {
  let confirmations = 0;
  while (confirmations < BLOCK_CONFIRMATION_TO_WAIT) {
    const currentBlock = await web3.eth.getBlockNumber();
    confirmations = currentBlock - txObj.blockNumber;
  }
  const tx = await web3.eth.getTransaction(txObj.transactionHash);
  if (!tx) throw new Error(`Transaction Failed: ${txObj.transactionHash}`);
  return;
}

export async function executeTransaction(
  tx: TransactionConfig,
  web3: Web3,
  pvKey: string,
): Promise<TransactionReceipt> {
  const signedTx = await web3.eth.accounts.signTransaction(tx, pvKey);
  const txObj = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
  await waitForTxConfirmed(txObj, web3);
  return txObj;
}

export function clearTrailingSlash(str: string) {
  return str.replace(/\/$/, '');
}

export function clearBeginingSlash(str: string) {
  return str.replace(/^\//, "");
}

export function containsSpecialChars(str: string, ignoreDash = false): boolean {
  const specialChars = ignoreDash
    ? /[`!@#$%^&*()_+=\[\]{};':"\\|,.<>\/?~]/
    : /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
  return specialChars.test(str);
}

export async function getSettings(
  prisma: PrismaService | null,
  key: string,
): Promise<string> {
  prisma = prisma ? prisma : prisma_client;
  const setting = await prisma.setting.findFirst({
    where: {
      option_key: key,
    },
  });
  return setting ? setting.option_value : '';
}

export async function getSettingsGroup(
  prisma: PrismaService | null = null,
  group_name: Array<any>,
  key: string | undefined = undefined,
) {
  prisma = prisma ? prisma : prisma_client;
  const setting = await prisma.setting.findMany({
    where: {
      option_group: {
        in: group_name,
      },
    },
  });
  let settingObj = {};
  if (setting) {
    settingObj = setting.reduce(
      (acc, cur) => ({ ...acc, [cur.option_key]: cur.option_value }),
      {},
    );
  }
  return key ? settingObj[key] : settingObj;
}

export function covertMilSecToMin(milliseconds: number) {
  return Math.floor(milliseconds / 1000 / 60);
}

export function covertMilSecToSec(milliseconds: number) {
  return Math.floor(milliseconds / 1000);
}

export function toMilliS(mins: number): number {
  return mins * 60 * 1000;
}

export function getUidFromTime(): string {
  return Math.ceil(+new Date()).toString();
}

export function randomUsernameFromWalletAddress(
  wallet_address: string,
): string {
  let result = '';
  const length = 6;
  const characters = wallet_address;
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result.toLowerCase();
}

export function getPercantageValue(value, percentage) {
  return (value * percentage) / 100;
}

export function addMinutes(date, minutes) {
  return new Date(new Date(date).getTime() + minutes * 60000);
}

export function subMinutes(date, minutes) {
  return new Date(new Date(date).getTime() - minutes * 60000);
}

export function convertTokenAmountToInt(amount: Decimal | number, decimal: number): string {
  let multiplier: any = '1';
  for (let i = 0; i < decimal; i++) {
    multiplier += '0';
  }
  return (Number(amount) * Number(multiplier))['noExponents']().split('.')[0];
}

export function checkAndGetAddress(web3: Web3, address: string): string {
  if (web3.utils.isAddress(address)) return web3.utils.toChecksumAddress(address);
  return '';
}

export function getDiffInMillisec(date1: Date, date2?: Date) {
  if (!date2) date2 = new Date();
  return date1.getTime() - date2.getTime();
}

export async function uploadImage(imageFile: FileUpload, path: string): Promise<string | null> {
  let uploadFile: FileObject;
  const file = await imageFile;
  if (file) {
    const fileService = app.get(FilesystemService)
    uploadFile = await fileService.upload(file, path, [FILE_TYPE_IMAGE]);
    if (!uploadFile.url) throw new Error(errorResponse().message);
    return uploadFile.url;
  }
  return null;
}

export function getNewOrRecentInMin() {
  return NEWEST_OR_RECENT_IN_MIN;
}

export function checkUserStatus(user: any) {
  if (user.status == STATUS_ACTIVE) return user;
  else if (user.status == STATUS_SUSPENDED)
    throw new UnauthorizedException(
      errorResponse(
        __('The account is suspended. Contact to support'),
        null,
        CODE_USER_SUSPENDED,
      ),
    );
  else if (user.status == STATUS_INACTIVE)
    throw new UnauthorizedException(
      errorResponse(
        __('The account is not active. Contact to support'),
        null,
        CODE_ACCOUNT_NOT_ACTIVE,
      ),
    );
}

export function base_url() {
  return clearTrailingSlash(process.env.APP_URL ?? '');
}

export function marketplace_url() {
  return clearTrailingSlash(process.env.MARKETPLACE_APP_URL ?? '');
}
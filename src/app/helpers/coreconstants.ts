import { __ } from './functions';

export const ROLE_ADMIN = 1;
export const ROLE_USER = 2;

export const NULL_ETH_ADDRESS = '0x0000000000000000000000000000000000000000';

export const HIGHEST_ERC20_TOKEN_AMOUNT_INTEGER =
  '115792089237316195423570985008687907853269984665640564039457584007913129639935';

export const STATUS_ACTIVE = 1;
export const STATUS_INACTIVE = 0;
export const STATUS_DONE = 1;
export const STATUS_PENDING = 0;
export const STATUS_SUSPENDED = 10;

// Item mint status
export const ITEM_MINT_STATUS_IN_PROGRESS = 0;
export const ITEM_MINT_STATUS_DONE = 1;
export const ITEM_MINT_STATUS_FAILED = 2;
//

export const EXCHANGE_BUY_NOW = 1;
export const EXCHANGE_ACCEPT_OFFER = 2;

export const OFFER_TYPE_SELL = 1;
export const OFFER_TYPE_BUY = 2;

export const SELL_OFFER_TYPE_DEFAULT = 1;
export const SELL_OFFER_TYPE_ACUTION = 2;

export const BUY_OFFER_TYPE_DEFAULT = 1;
export const BUY_OFFER_TYPE_BID = 2;

// Buy sell offer status
export const BUY_SELL_STATUS_IN_PROGRESS = 0;
export const BUY_SELL_STATUS_ACTIVE = 1;
export const BUY_SELL_STATUS_EXPIRED = 2;
export const BUY_SELL_STATUS_COMPLETED = 3;
export const BUY_SELL_STATUS_CANCELLED = 4;

// Exchange offer status
export const EXCHANGE_STATUS_IN_PROGRESS = 0;
export const EXCHANGE_STATUS_DONE = 1;
export const EXCHANGE_STATUS_FAILED = 2;

//custom codes
export const CODE_VERIFY_EMAIL = 901;
export const CODE_VERIFY_DEVICE = 902;
export const CODE_VERIFY_GAUTH = 903;
export const CODE_USER_SUSPENDED = 904;
export const CODE_ACCOUNT_NOT_ACTIVE = 905;
//

export const VERIFY_CODE_TYPE_AUTH = 1;

export const LOGIN_MESSAGE = `Welcome to ${process.env.APP_NAME}!

Click to sign in and accept the ${process.env.APP_NAME} Terms of Service

This request will not trigger a blockchain transaction or cost any gas fees.

Your authentication status will reset after ${process.env.JWT_TOKEN_EXPIRY}.\n`;

export const BLOCK_CONFIRMATION_TO_WAIT = 2;
//model types
export const MODEL_TYPE_COLLECTION = 1;
export const MODEL_TYPE_USER = 2;
//

export const MAX_ROYALTY_PERCENTAGE = 10;

export const DEAFAULT_MAX_FILE_SIZE_IN_BYTE = 10000000; // 10 mb
export const DEFAULT_MAX_FILES_AT_A_TIME = 10;

//blockchain providers
export const BLOCKCHAIN_PROVIDER_MORALIS = 1;
export const BLOCKCHAIN_PROVIDER_ALCHEMY = 2;
export const BLOCKCHAIN_PROVIDER_OTHERS = 3;

//

// Item Events
export const ITEM_EVENT_MINT = 1;
export const ITEM_EVENT_LISTINGS = 2;
export const ITEM_EVENT_SALES = 3;
export const ITEM_EVENT_BUY_OFFERS = 4;
export const ITEM_EVENT_BIDS = 5;
export const ITEM_EVENT_TRANSFERS = 6;
export const ITEM_EVENT_LISTING_CANCEL = 7;
export const ITEM_EVENT_BUY_OFFER_CANCEL = 8;
export const ITEM_EVENT_BID_CANCEL = 9;

export const ITEM_EVENTS = [
  ITEM_EVENT_MINT,
  ITEM_EVENT_LISTINGS,
  ITEM_EVENT_SALES,
  ITEM_EVENT_BUY_OFFERS,
  ITEM_EVENT_BIDS,
  ITEM_EVENT_TRANSFERS,
  ITEM_EVENT_LISTING_CANCEL,
  ITEM_EVENT_BUY_OFFER_CANCEL,
  ITEM_EVENT_BID_CANCEL,
];

//

//payment token types
export const PAYMENT_TOKEN_TYPE_NATIVE_COIN = 1;
export const PAYMENT_TOKEN_TYPE_TOKEN = 2;
//

export const PAYMENT_TOKEN_TYPE = {
  [PAYMENT_TOKEN_TYPE_NATIVE_COIN]: () => __('Native Coin'),
  [PAYMENT_TOKEN_TYPE_TOKEN]: () => __('Token'),
};

//
export const BLOCKCHAIN_TRANSACTION_FEE_LIMIT = 2000000;
//

// Item filter status

export const ITEM_FILTER_STATUS_BUY_NOW = 1;
export const ITEM_FILTER_STATUS_ON_AUCTION = 2;
export const ITEM_FILTER_STATUS_NEW = 3;
export const ITEM_FILTER_STATUS_HAS_OFFERS = 4;

export const NEWEST_OR_RECENT_IN_MIN = 4320;
//

//blockchain testnets slugs
export const BLOCKCHAIN_RINKEBY_SLUG = 'rinkeby';
export const BLOCKCHAIN_ROPSTEN_SLUG = 'ropsten';
export const BLOCKCHAIN_GOERLI_SLUG = 'goerli';
export const BLOCKCHAIN_KOVAN_SLUG = 'kovan';
export const BLOCKCHAIN_BINANCE_TESTNET_SLUG = 'bsctestnet';
export const BLOCKCHAIN_MUMBAI_SLUG = 'mumbai';
//

//blockchain mainnets slugs
export const BLOCKCHAIN_ETHEREUM_SLUG = 'ethereum';
export const BLOCKCHAIN_POLYGON_SLUG = 'polygon';
export const BLOCKCHAIN_BINANCE_MAINNET_SLUG = 'bscmainnet';
//

//blockchain testnets chain id
export const BLOCKCHAIN_RINKEBY_CHAIN_ID = 4;
export const BLOCKCHAIN_ROPSTEN_CHAIN_ID = 3;
export const BLOCKCHAIN_GOERLI_CHAIN_ID = 5;
export const BLOCKCHAIN_KOVAN_CHAIN_ID = 42;
export const BLOCKCHAIN_BINANCE_TESTNET_CHAIN_ID = 97;
export const BLOCKCHAIN_MUMBAI_CHAIN_ID = 80001;
//

//blockchain mainnets chain id
export const BLOCKCHAIN_ETHEREUM_CHAIN_ID = 1;
export const BLOCKCHAIN_POLYGON_CHAIN_ID = 137;
export const BLOCKCHAIN_BINANCE_MAINNET_CHAIN_ID = 56;
//

export const NOTIFICATION_EVENTS_ITEM_SOLD = 1;
export const NOTIFICATION_EVENTS_BID_ACTIVITY = 2;
export const NOTIFICATION_EVENTS_PRICE_CHANGE = 3;
export const NOTIFICATION_EVENTS_AUCTION_EXPIRATION = 4;
export const NOTIFICATION_EVENTS_OUTBID = 5;
export const NOTIFICATION_EVENTS_OWNED_ITEM_UPDATES = 6;
export const NOTIFICATION_EVENTS_SUCCESSFULLY_PURCHASED = 7;
export const NOTIFICATION_EVENTS_OPENSEA_NEWSLETTER = 8;
//file types
export const FILE_TYPE_IMAGE = 'image';
export const FILE_TYPE_VIDEO = 'video';
export const FILE_TYPE_AUDIO = 'audio';
export const FILE_TYPE_3D = '_3d';
//

export const GLOBAL_SEARCH_QUERY_LIMIT = 4;

export const MIN_OFFER_AMOUNT = 0.000001;
export const MAX_OFFER_AMOUNT = 9999999999;

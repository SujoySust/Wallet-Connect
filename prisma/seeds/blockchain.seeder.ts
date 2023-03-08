import { PrismaClient } from '@prisma/client';
import {
  BLOCKCHAIN_BINANCE_TESTNET_CHAIN_ID,
  BLOCKCHAIN_BINANCE_TESTNET_SLUG,
  BLOCKCHAIN_MUMBAI_CHAIN_ID,
  BLOCKCHAIN_MUMBAI_SLUG,
  BLOCKCHAIN_PROVIDER_MORALIS,
  BLOCKCHAIN_RINKEBY_CHAIN_ID,
  BLOCKCHAIN_RINKEBY_SLUG,
  STATUS_ACTIVE,
} from '../../src/app/helpers/coreconstants';

export async function seedBlockchain(prisma: PrismaClient) {
  await prisma.blockchain.createMany({
    data: [
      {
        network_name: 'Rinkeby',
        slug: BLOCKCHAIN_RINKEBY_SLUG,
        public_rpc_url: 'https://rinkeby.infura.io/v3',
        rpc_url:
          'https://speedy-nodes-nyc.moralis.io/66e2c85a937e07662531585b/eth/rinkeby',
        api_key:
          'uKhRFNHBI8E8pkfvSghf4CeMlhqMonn0X38LPqXS6FsVUTn37uuwPlWwktQotyk7',
        explorer_url: 'https://rinkeby.etherscan.io',
        chain_id: BLOCKCHAIN_RINKEBY_CHAIN_ID,
        provider: BLOCKCHAIN_PROVIDER_MORALIS,
        wss_url:
          'wss://speedy-nodes-nyc.moralis.io/66e2c85a937e07662531585b/eth/rinkeby/ws',
        currency_symbol: 'ETH',
        nft_contract: '0x015EEE8C0Ff2f7f9738Fc579347658bbb7D8Dd6F',
        exchange_contract: '0xeFA5a5288148698BD5A4E71Fc8A25330D4545E3B',
        logo: 'images/tokens/eth.svg',
        description: 'Rinkeby is a Ethereum testnet',
        status: STATUS_ACTIVE,
      },
      {
        network_name: 'Mumbai',
        slug: BLOCKCHAIN_MUMBAI_SLUG,
        public_rpc_url: 'https://matic-mumbai.chainstacklabs.com',
        rpc_url:
          'https://speedy-nodes-nyc.moralis.io/66e2c85a937e07662531585b/polygon/mumbai',
        api_key:
          'uKhRFNHBI8E8pkfvSghf4CeMlhqMonn0X38LPqXS6FsVUTn37uuwPlWwktQotyk7',
        explorer_url: 'https://mumbai.polygonscan.com',
        chain_id: BLOCKCHAIN_MUMBAI_CHAIN_ID,
        provider: BLOCKCHAIN_PROVIDER_MORALIS,
        wss_url:
          'wss://speedy-nodes-nyc.moralis.io/66e2c85a937e07662531585b/polygon/mumbai/ws',
        currency_symbol: 'MATIC',
        nft_contract: '0x98f06F2DfF6Fa409248C75898082af429f2073e7',
        exchange_contract: '0xa115C3A0068aBABe9cb1A0d10284d393043DF63A',
        logo: 'images/tokens/polygon.png',
        description: 'Mumbai is a Polygon testnet',
        status: STATUS_ACTIVE,
      },
      {
        network_name: 'BSC Testnet',
        slug: BLOCKCHAIN_BINANCE_TESTNET_SLUG,
        public_rpc_url: 'https://data-seed-prebsc-1-s1.binance.org:8545',
        rpc_url:
          'https://speedy-nodes-nyc.moralis.io/66e2c85a937e07662531585b/bsc/testnet',
        api_key:
          'uKhRFNHBI8E8pkfvSghf4CeMlhqMonn0X38LPqXS6FsVUTn37uuwPlWwktQotyk7',
        explorer_url: 'https://testnet.bscscan.com',
        chain_id: BLOCKCHAIN_BINANCE_TESTNET_CHAIN_ID,
        provider: BLOCKCHAIN_PROVIDER_MORALIS,
        wss_url:
          'wss://speedy-nodes-nyc.moralis.io/66e2c85a937e07662531585b/bsc/testnet/ws',
        currency_symbol: 'BNB',
        nft_contract: '0x8F902E2dc9863e5345818892f99B6D7334c698DB',
        exchange_contract: '0x33c2888D392243500078a9149FfDa21388a9Ba95',
        logo: 'images/tokens/binance.png',
        description: 'This is testnet of Binance',
        status: STATUS_ACTIVE,
      },
    ],
    skipDuplicates: true,
  });
}

import { registerAs } from '@nestjs/config';
import { base_url } from '../app/helpers/functions';

export const ServicesConfig = registerAs('services', () => {
  return {
    nftStorage: {
      api_key: process.env.NFT_STORAGE_KEY,
    },
    appUrl: base_url(),
  };
});

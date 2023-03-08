import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async put(key: string, item: string | number, ttl = 5) {
    return await this.cacheManager.set(key, item, ttl);
  }

  async get(key: string) {
    return await this.cacheManager.get(key);
  }

  async forget(key: string) {
    return await this.cacheManager.del(key);
  }
}

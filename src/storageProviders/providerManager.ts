import { Logger } from '@map-colonies/js-logger';
import { SERVICES } from '../common/constants';
import { StorageProviderType } from '../common/enums';
import { IConfig } from '../common/interfaces';
import { InjectionObject } from '../common/dependencyRegistration';
import { FsStorageProvider } from './fs/fsStorageProvider';
import { S3StorageProvider } from './s3/s3StorageProvider';

export function getProvider(config: IConfig, logger: Logger): InjectionObject<unknown> {
  const storageProviderType = config.get<string>('storage_provider');
  switch (storageProviderType.toUpperCase()) {
    case StorageProviderType.FS:
      return { token: SERVICES.STORAGE_PROVIDER, provider: FsStorageProvider };
    case StorageProviderType.S3:
      return { token: SERVICES.STORAGE_PROVIDER, provider: S3StorageProvider };
    default:
      logger.error(`invalid tile provider configuration: ${storageProviderType}`);
      throw new Error(`invalid tile provider configuration: ${storageProviderType}`);
  }
}

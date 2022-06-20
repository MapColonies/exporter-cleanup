import { ILogger } from '@map-colonies/mc-utils';
import { promises as fsp } from 'fs';
import { join as pathJoin } from 'path';
import { autoInjectable, inject } from 'tsyringe';
import { SERVICES } from '../../common/constants';
import { IConfig } from '../../common/interfaces';
import { IStorageProvider } from '../iStorageProvider';

@autoInjectable()
export class FsStorageProvider implements IStorageProvider {
  private readonly basePath: string;
  public constructor(@inject(SERVICES.CONFIG) private readonly config: IConfig, @inject(SERVICES.LOGGER) private readonly logger: ILogger) {
    this.basePath = config.get('fs.mountDir');
  }

  public async delete(path: string): Promise<void> {
    const fullPath = pathJoin(this.basePath, path);
    this.logger.debug(`Deleting file in path ${fullPath}`);
    try {
      await fsp.unlink(fullPath);
    } catch (err) {
      const error = err as NodeJS.ErrnoException;
      //ignore file not found error
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }
}

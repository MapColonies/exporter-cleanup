import { promises as fsp } from 'fs';
import { join as pathJoin } from 'path';
import { Logger } from '@map-colonies/js-logger';
import { autoInjectable, inject } from 'tsyringe';
import { SERVICES } from '../../common/constants';
import { IConfig } from '../../common/interfaces';
import { IStorageProvider } from '../iStorageProvider';

@autoInjectable()
export class FsStorageProvider implements IStorageProvider {
  private readonly basePath: string;
  public constructor(@inject(SERVICES.CONFIG) private readonly config: IConfig, @inject(SERVICES.LOGGER) private readonly logger: Logger) {
    this.basePath = config.get('fs.mountDir');
  }

  public async delete(path: string): Promise<void> {
    const fullPath = pathJoin(this.basePath, path);
    this.logger.info(`Deleting entire exporting path ${fullPath}`);
    try {
      await fsp.rm(fullPath, { recursive: true });
    } catch (err) {
      const error = err as NodeJS.ErrnoException;
      //ignore file not found error
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }
}

import { inject } from 'tsyringe';
import { S3, Credentials } from 'aws-sdk';
import { CredentialsOptions } from 'aws-sdk/lib/credentials';
import { Logger } from '@map-colonies/js-logger';
import { SERVICES } from '../../common/constants';
import { IConfig } from '../../common/interfaces';
import { IStorageProvider } from '../iStorageProvider';
import { IS3Config } from './iS3Config';

export class S3StorageProvider implements IStorageProvider {
  private readonly s3: S3;
  private readonly s3Config: IS3Config;
  private readonly prefix: string;

  public constructor(@inject(SERVICES.CONFIG) private readonly config: IConfig, @inject(SERVICES.LOGGER) private readonly logger: Logger) {
    this.s3Config = this.config.get<IS3Config>('s3');
    const credentials: CredentialsOptions = {
      accessKeyId: this.s3Config.accessKeyId,
      secretAccessKey: this.s3Config.secretAccessKey,
    };
    const awsCredentials = new Credentials(credentials);
    this.s3 = new S3({
      credentials: awsCredentials,
      endpoint: this.s3Config.endpoint,
      sslEnabled: this.s3Config.sslEnabled,
      s3ForcePathStyle: true,
      apiVersion: this.s3Config.apiVersion,
      maxRetries: this.s3Config.maxRetries,
    });
    this.prefix = this.s3Config.prefix !== '' ? `${this.s3Config.prefix}/` : '';
  }
  public async delete(path: string): Promise<void> {
    const fullPath = `${this.prefix}${path}`;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    await this.s3.deleteObject({ Bucket: this.s3Config.bucket, Key: fullPath }).promise();
  }
}

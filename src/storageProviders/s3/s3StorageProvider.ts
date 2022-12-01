import { autoInjectable, inject } from 'tsyringe';
import { S3, Credentials } from 'aws-sdk';
import { CredentialsOptions } from 'aws-sdk/lib/credentials';
import { Logger } from '@map-colonies/js-logger';
import { SERVICES } from '../../common/constants';
import { IConfig } from '../../common/interfaces';
import { IStorageProvider } from '../iStorageProvider';
import { IS3Config } from './iS3Config';

interface S3Key {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Key: string;
}

interface S3FindResponse {
  itemsToDelete?: S3Key[];
  continuationToken?: string;
}

@autoInjectable()
export class S3StorageProvider implements IStorageProvider {
  private readonly s3: S3;
  private readonly s3Config: IS3Config;
  private readonly batchSize: number;

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
    this.batchSize = this.s3Config.batchSize;
  }
  public async delete(path: string): Promise<void> {
    this.logger.info(`Will execute deletion of full directory: ${path}`);
    let { itemsToDelete, continuationToken } = await this.parseItemsFromS3(path);
    while (itemsToDelete != undefined && itemsToDelete.length !== 0) {
      await this.deleteFromS3(itemsToDelete);
      const prepareItems = await this.parseItemsFromS3(path, continuationToken);
      itemsToDelete = prepareItems.itemsToDelete;
      continuationToken = prepareItems.continuationToken;
    }
  }

  private async parseItemsFromS3(prefix: string, continuationToken?: string): Promise<S3FindResponse> {
    this.logger.debug(`Listing objects with prefix ${prefix} from bucket ${this.s3Config.bucket}`);
    /* eslint-disable @typescript-eslint/naming-convention */
    const res = await this.s3
      .listObjectsV2({
        Bucket: this.s3Config.bucket,
        MaxKeys: this.batchSize,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      })
      .promise();
    const itemsToDelete = res.Contents?.map((content) => {
      return { Key: content.Key as string };
    });
    /* eslint-enable @typescript-eslint/naming-convention */
    return {
      itemsToDelete,
      continuationToken: res.NextContinuationToken,
    };
  }

  private async deleteFromS3(s3Keys: S3Key[]): Promise<void> {
    this.logger.debug(`Deleting objects from bucket ${this.s3Config.bucket}`);
    this.logger.debug(JSON.stringify(s3Keys));
    // eslint-disable-next-line @typescript-eslint/naming-convention
    await this.s3.deleteObjects({ Bucket: this.s3Config.bucket, Delete: { Objects: s3Keys } }).promise();
  }
}

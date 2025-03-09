import { autoInjectable, inject } from 'tsyringe';
import { S3, DeleteObjectsCommand, DeleteObjectsCommandInput , DeleteObjectCommand} from '@aws-sdk/client-s3';
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
    const credentials = {
      accessKeyId: this.s3Config.accessKeyId,
      secretAccessKey: this.s3Config.secretAccessKey,
    };
    this.s3 = new S3({
      credentials: credentials,
      endpoint: this.s3Config.endpoint,
      tls: this.s3Config.sslEnabled,
      forcePathStyle: this.s3Config.forcePathStyle,
      maxAttempts: this.s3Config.maxRetries,
      region: this.s3Config.region,
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
    const res = await this.s3.listObjectsV2({
      Bucket: this.s3Config.bucket,
      MaxKeys: this.batchSize,
      Prefix: prefix,
      ContinuationToken: continuationToken,
    });
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
    // /* eslint-disable @typescript-eslint/naming-convention  */
    // const input: DeleteObjectsCommandInput = {
    //   Bucket: this.s3Config.bucket,
    //   Delete: {
    //     Objects: s3Keys,
    //     Quiet: true,
    //   },
    // };
    // /* eslint-disable @typescript-eslint/naming-convention  */
    // const command = new DeleteObjectsCommand(input);
    // await this.s3.send(command);
    const deletePromises = s3Keys.map((key) =>
      this.s3.send(
        new DeleteObjectCommand({
          Bucket: this.s3Config.bucket,
          Key: key.Key,
          //Key: key,
        }),
      ),
    );
    await Promise.all(deletePromises);
  
  }
  
}

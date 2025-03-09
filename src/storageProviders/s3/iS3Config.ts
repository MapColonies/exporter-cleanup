import { StorageClass } from '@aws-sdk/client-s3';

export interface IS3Config {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  sslEnabled: boolean;
  maxRetries: number;
  bucket: string;
  prefix: string;
  batchSize: number;
  storageClass?: StorageClass;
  region: string;
  forcePathStyle: boolean;
}

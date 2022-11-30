export interface IS3Config {
  apiVersion: string;
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  sslEnabled: boolean;
  maxRetries: number;
  bucket: string;
  prefix: string;
  batchSize: number;
}

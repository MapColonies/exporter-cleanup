import jsLogger from '@map-colonies/js-logger';
import { S3StorageProvider } from '../../../../src/storageProviders/s3/s3StorageProvider';
import { configMock, initConfig, setConfigValue, clearConfig } from '../../../mocks/config';
import { s3Mock, initS3Mock, deleteObjectMock, deleteObjectPromiseMock } from '../../../mocks/s3';

jest.mock('aws-sdk', () => {
  return {
    ...jest.requireActual<Record<string, unknown>>('aws-sdk'),
    // eslint-disable-next-line @typescript-eslint/naming-convention
    S3: jest.fn(() => s3Mock),
  };
});

const logger = jsLogger({ enabled: false });
//fix linter dont liking variable names with "Provider"
// eslint-disable-next-line @typescript-eslint/naming-convention
let s3StorageProvider: S3StorageProvider;

describe('tile deletion', () => {
  beforeEach(() => {
    initConfig();
    initS3Mock();
  });

  afterEach(() => {
    clearConfig();
    jest.clearAllMocks();
  });

  describe('delete', () => {
    it('deletes specified package from s3 with prefix', async () => {
      setConfigValue('s3', {
        bucket: 'testBucket',
        prefix: 'testPrefix',
      });
      s3StorageProvider = new S3StorageProvider(configMock, logger);

      deleteObjectPromiseMock.mockResolvedValue(undefined);

      await s3StorageProvider.delete('test.gpkg');

      expect(deleteObjectMock).toHaveBeenCalledTimes(1);
      /* eslint-disable @typescript-eslint/naming-convention */
      expect(deleteObjectMock).toHaveBeenCalledWith({
        Bucket: 'testBucket',
        Key: 'testPrefix/test.gpkg',
      });
      /* eslint-enable @typescript-eslint/naming-convention */
      expect(deleteObjectPromiseMock).toHaveBeenCalledTimes(1);
    });

    it('deletes specified package from s3 without prefix', async () => {
      setConfigValue('s3', {
        bucket: 'testBucket',
        prefix: '',
      });
      s3StorageProvider = new S3StorageProvider(configMock, logger);

      deleteObjectPromiseMock.mockResolvedValue(undefined);

      await s3StorageProvider.delete('test.gpkg');

      expect(deleteObjectMock).toHaveBeenCalledTimes(1);
      /* eslint-disable @typescript-eslint/naming-convention */
      expect(deleteObjectMock).toHaveBeenCalledWith({
        Bucket: 'testBucket',
        Key: 'test.gpkg',
      });
      /* eslint-enable @typescript-eslint/naming-convention */
      expect(deleteObjectPromiseMock).toHaveBeenCalledTimes(1);
    });
  });
});

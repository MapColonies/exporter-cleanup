/* eslint-disable @typescript-eslint/naming-convention */
import jsLogger from '@map-colonies/js-logger';
import { S3StorageProvider } from '../../../../src/storageProviders/s3/s3StorageProvider';
import { configMock, initConfig, setConfigValue } from '../../../mocks/config';
import { s3Mock, initS3Mock, listObjectsV2PromiseMock, listObjectsV2Mock, deleteObjectsMock } from '../../../mocks/s3';
import { s3KeysArray, s3KeysArray2 } from '../../../mocks/testData';

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

const batchSize = 100;
const relativeDirectoryPath = 'gpkg_location';

describe('gpkg directory deletion', () => {
  let parseItemsFromS3Spy: jest.SpyInstance;
  let deleteFromS3Spy: jest.SpyInstance;

  beforeEach(() => {
    initConfig();
    initS3Mock();
    setConfigValue('s3', {
      bucket: 'testBucket',
      batchSize: batchSize,
    });
    s3StorageProvider = new S3StorageProvider(configMock, logger);
    parseItemsFromS3Spy = jest.spyOn(s3StorageProvider as unknown as { parseItemsFromS3: jest.Mock }, 'parseItemsFromS3');
    deleteFromS3Spy = jest.spyOn(s3StorageProvider as unknown as { deleteFromS3: jest.Mock }, 'deleteFromS3');
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  it('Should process next S3 delete for 2 batches with correct continuation token', async () => {
    /* eslint-disable @typescript-eslint/naming-convention */
    listObjectsV2PromiseMock
      .mockResolvedValueOnce({
        Contents: s3KeysArray,
        NextContinuationToken: 123456,
      })
      .mockResolvedValueOnce({
        Contents: s3KeysArray2,
        NextContinuationToken: 1789,
      })
      .mockResolvedValueOnce({
        Contents: [],
        NextContinuationToken: 789,
      });
    await s3StorageProvider.delete(relativeDirectoryPath);

    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    expect(listObjectsV2Mock).toHaveBeenCalledTimes(3);
    expect(listObjectsV2Mock).toHaveBeenCalledWith({
      Bucket: 'testBucket',
      ContinuationToken: undefined,
      MaxKeys: 100,
      Prefix: relativeDirectoryPath,
    });
    expect(listObjectsV2Mock).toHaveBeenCalledWith({
      Bucket: 'testBucket',
      ContinuationToken: 1789,
      MaxKeys: 100,
      Prefix: relativeDirectoryPath,
    });
    expect(listObjectsV2Mock).toHaveBeenCalledWith({
      Bucket: 'testBucket',
      MaxKeys: 100,
      Prefix: relativeDirectoryPath,
      ContinuationToken: 123456,
    });
    expect(parseItemsFromS3Spy).toHaveBeenCalledTimes(3);
    expect(deleteFromS3Spy).toHaveBeenCalledTimes(2);
    expect(deleteFromS3Spy).toHaveBeenCalledWith(s3KeysArray);
    expect(deleteFromS3Spy).toHaveBeenCalledWith(s3KeysArray2);
    expect(deleteObjectsMock).toHaveBeenCalledTimes(2);
    expect(deleteObjectsMock).toHaveBeenCalledWith({ Bucket: 'testBucket', Delete: { Objects: s3KeysArray } });
    expect(deleteObjectsMock).toHaveBeenCalledWith({ Bucket: 'testBucket', Delete: { Objects: s3KeysArray2 } });
  });
});

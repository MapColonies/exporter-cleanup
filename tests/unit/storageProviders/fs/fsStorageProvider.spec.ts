import { promises } from 'fs';
import path from 'path';
import jsLogger from '@map-colonies/js-logger';
import { FsStorageProvider } from '../../../../src/storageProviders/fs/fsStorageProvider';
import { configMock, initConfig, setConfigValue } from '../../../mocks/config';

const logger = jsLogger({ enabled: false });
let unlinkMock: jest.SpyInstance;
//fix linter dont liking variable names with "Provider"
// eslint-disable-next-line @typescript-eslint/naming-convention
let fsStorageProvider: FsStorageProvider;

describe('fsStorageProvider', () => {
  beforeEach(() => {
    initConfig();
    setConfigValue('fs.mountDir', 'mount');
    setConfigValue('fs.subPath', 'sub');
    unlinkMock = jest.spyOn(promises, 'unlink');
    jest.spyOn(path, 'join').mockImplementation((...args) => args.join('/'));
    fsStorageProvider = new FsStorageProvider(configMock, logger);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  describe('delete', () => {
    it('deletes expected package', async () => {
      unlinkMock.mockResolvedValue(undefined);
      await fsStorageProvider.delete('test.gpkg');

      expect(unlinkMock).toHaveBeenCalledTimes(1);
      expect(unlinkMock).toHaveBeenCalledWith('mount/sub/test.gpkg');
    });

    it('dont thorw error when file dont exists', async () => {
      const fileNotExistsError = {
        ...new Error('test error'),
        code: 'ENOENT',
      };
      unlinkMock.mockRejectedValue(fileNotExistsError);

      const action = fsStorageProvider.delete('test.gpkg');

      await expect(action).resolves.not.toThrow();
      expect(unlinkMock).toHaveBeenCalledTimes(1);
      expect(unlinkMock).toHaveBeenCalledWith('mount/sub/test.gpkg');
    });

    it('throw error when  the error is not "file not exist"', async () => {
      const testError = {
        ...new Error('test error'),
        code: 'testCode',
      };
      unlinkMock.mockRejectedValue(testError);

      const action = fsStorageProvider.delete('test.gpkg');

      await expect(action).rejects.toBe(testError);
      expect(unlinkMock).toHaveBeenCalledTimes(1);
      expect(unlinkMock).toHaveBeenCalledWith('mount/sub/test.gpkg');
    });
  });
});

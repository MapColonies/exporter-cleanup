import { promises } from 'fs';
import path from 'path';
import jsLogger from '@map-colonies/js-logger';
import { FsStorageProvider } from '../../../../src/storageProviders/fs/fsStorageProvider';
import { configMock, initConfig, setConfigValue } from '../../../mocks/config';

const logger = jsLogger({ enabled: false });
let rm: jest.SpyInstance;
//fix linter don't liking variable names with "Provider"
// eslint-disable-next-line @typescript-eslint/naming-convention
let fsStorageProvider: FsStorageProvider;

describe('fsStorageProvider', () => {
  beforeEach(() => {
    initConfig();
    setConfigValue('fs.mountDir', 'mount');
    setConfigValue('fs.subPath', 'sub');
    rm = jest.spyOn(promises, 'rm');
    jest.spyOn(path, 'join').mockImplementation((...args) => args.join('/'));
    fsStorageProvider = new FsStorageProvider(configMock, logger);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  describe('delete', () => {
    it('deletes expected package', async () => {
      rm.mockResolvedValue(undefined);
      await fsStorageProvider.delete('test_location');

      expect(rm).toHaveBeenCalledTimes(1);
      expect(rm).toHaveBeenCalledWith('mount/test_location', { recursive: true });
    });

    it('dont thorw error when file dont exists', async () => {
      const fileNotExistsError = {
        ...new Error('test error'),
        code: 'ENOENT',
      };
      rm.mockRejectedValue(fileNotExistsError);

      const action = fsStorageProvider.delete('test_location');

      await expect(action).resolves.not.toThrow();
      expect(rm).toHaveBeenCalledTimes(1);
      expect(rm).toHaveBeenCalledWith('mount/test_location', { recursive: true });
    });

    it('throw error when  the error is not "file not exist"', async () => {
      const testError = {
        ...new Error('test error'),
        code: 'testCode',
      };
      rm.mockRejectedValue(testError);

      const action = fsStorageProvider.delete('test_location');

      await expect(action).rejects.toBe(testError);
      expect(rm).toHaveBeenCalledTimes(1);
      expect(rm).toHaveBeenCalledWith('mount/test_location', { recursive: true });
    });
  });
});

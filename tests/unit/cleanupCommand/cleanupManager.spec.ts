import jsLogger from '@map-colonies/js-logger';
import { CleanupManager } from '../../../src/cleanupCommand/cleanupManager';
import { providerMock, deleteMock } from '../../mocks/storageProviders/storageProvider';
import {
  jobManagerClientMock,
  getCompletedUncleanedJobsMock,
  getFailedUncleanedJobsMock,
  updateCleanedMock,
} from '../../mocks/clients/jobManagerClient';
import { completedExportJobsResponse, failedExportJobResponses } from '../../mocks/jobResponsesMocks';

describe('CleanupManager', () => {
  const logger = jsLogger({ enabled: false });
  let manager: CleanupManager;

  beforeEach(() => {
    manager = new CleanupManager(logger, providerMock, jobManagerClientMock);
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('cleanPackages', () => {
    it('deletes all failed and expired packages', async () => {
      getCompletedUncleanedJobsMock.mockResolvedValue(completedExportJobsResponse);
      getFailedUncleanedJobsMock.mockResolvedValue(failedExportJobResponses);
      updateCleanedMock.mockResolvedValue(undefined);
      deleteMock.mockResolvedValue(undefined);

      await manager.cleanPackages();

      expect(getCompletedUncleanedJobsMock).toHaveBeenCalledTimes(1);
      expect(getFailedUncleanedJobsMock).toHaveBeenCalledTimes(1);
      expect(updateCleanedMock).toHaveBeenCalledTimes(3);
      expect(updateCleanedMock).toHaveBeenNthCalledWith(1, '8eddc842-64ee-4e90-b3a5-b10d9e86acb2');
      expect(updateCleanedMock).toHaveBeenNthCalledWith(2, '111dc842-64ee-4e90-b3a5-b10d9e86acb2');
      expect(updateCleanedMock).toHaveBeenNthCalledWith(3, '8eddc842-64ee-4e90-b3a5-b10d9e11111');
      expect(deleteMock).toHaveBeenCalledTimes(3);
      expect(deleteMock).toHaveBeenNthCalledWith(1, 'test1');
      expect(deleteMock).toHaveBeenNthCalledWith(2, 'test2');
      expect(deleteMock).toHaveBeenNthCalledWith(3, 'test3');
    });
  });
});

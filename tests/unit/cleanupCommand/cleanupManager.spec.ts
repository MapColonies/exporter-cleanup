import jsLogger from '@map-colonies/js-logger';
import { CleanupManager } from '../../../src/cleanupCommand/cleanupManager';
import { providerMock, deleteMock } from '../../mocks/storageProviders/storageProvider';
import {
  jobManagerClientMock,
  getCompletedUncleanedJobsMock,
  getFailedUncleanedJobsMock,
  updateCleanedMock,
} from '../../mocks/clients/jobManagerClient';

const failedJobs = [
  {
    id: '37451d7f-aaa3-4bc6-9e68-7cb5eae764b1',
    resourceId: 'demo_1',
    version: 'tiles',
    parameters: {
      packageName: 'test1.gpkg',
    },
    created: '2021-04-25T13:10:06.614Z',
    updated: '2021-04-25T13:10:06.614Z',
    status: 'Failed',
    reason: '',
    isCleaned: false,
    expirationDate: new Date('2021-04-25T13:11:06.614Z'),
  },
  {
    id: '37451d7f-aaa3-4bc6-9e68-7cb5eae764b2',
    resourceId: 'demo_2',
    version: 'tiles',
    tasks: [],
    parameters: {
      packageName: 'test2.gpkg',
    },
    created: '2021-04-11T13:11:06.614Z',
    updated: '2021-04-11T13:11:06.614Z',
    status: 'Failed',
    reason: '',
    isCleaned: true,
    expirationDate: new Date('2021-04-25T13:13:06.614Z'),
  },
];
const successfulJobs = [
  {
    id: '37451d7f-aaa3-4bc6-9e68-7cb5eae764b3',
    resourceId: 'demo_3',
    version: 'tiles',
    parameters: {
      packageName: 'test3.gpkg',
    },
    created: '2021-04-25T13:10:06.614Z',
    updated: '2021-04-25T13:10:06.614Z',
    status: 'Completed',
    reason: '',
    isCleaned: false,
    expirationDate: new Date('2021-04-25T13:11:06.614Z'),
  },
  {
    id: '37451d7f-aaa3-4bc6-9e68-7cb5eae764b4',
    resourceId: 'demo_4',
    version: 'tiles',
    tasks: [],
    parameters: {
      packageName: 'test4.gpkg',
    },
    created: '2021-04-11T13:11:06.614Z',
    updated: '2021-04-11T13:11:06.614Z',
    status: 'Completed',
    reason: '',
    isCleaned: true,
    expirationDate: new Date('2021-04-25T13:13:06.614Z'),
  },
];

describe('CleanupManager', () => {
  const logger = jsLogger({ enabled: false });
  let manager: CleanupManager;

  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2021-04-25T13:12:06.614Z'));
  });

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
      getCompletedUncleanedJobsMock.mockResolvedValue(successfulJobs);
      getFailedUncleanedJobsMock.mockResolvedValue(failedJobs);
      updateCleanedMock.mockResolvedValue(undefined);
      deleteMock.mockResolvedValue(undefined);

      await manager.cleanPackages();

      expect(getCompletedUncleanedJobsMock).toHaveBeenCalledTimes(1);
      expect(getFailedUncleanedJobsMock).toHaveBeenCalledTimes(1);
      expect(updateCleanedMock).toHaveBeenCalledTimes(3);
      expect(updateCleanedMock).toHaveBeenNthCalledWith(1, '37451d7f-aaa3-4bc6-9e68-7cb5eae764b3');
      expect(updateCleanedMock).toHaveBeenNthCalledWith(2, '37451d7f-aaa3-4bc6-9e68-7cb5eae764b1');
      expect(updateCleanedMock).toHaveBeenNthCalledWith(3, '37451d7f-aaa3-4bc6-9e68-7cb5eae764b2');
      expect(deleteMock).toHaveBeenCalledTimes(3);
      expect(deleteMock).toHaveBeenNthCalledWith(1, 'test3.gpkg');
      expect(deleteMock).toHaveBeenNthCalledWith(2, 'test1.gpkg');
      expect(deleteMock).toHaveBeenNthCalledWith(3, 'test2.gpkg');
    });
  });
});

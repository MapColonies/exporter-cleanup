import jsLogger from '@map-colonies/js-logger';
import { trace } from '@opentelemetry/api';

import { container } from 'tsyringe';
import { getApp } from '../../../src/app';
import { JobManagerClient } from '../../../src/clients/jobManagerClient';
import { SERVICES } from '../../../src/common/constants';
import {
  jobManagerClientMock,
  getCompletedUncleanedJobsMock,
  getFailedUncleanedJobsMock,
  updateCleanedMock,
} from '../../mocks/clients/jobManagerClient';
import { deleteMock, providerMock } from '../../mocks/storageProviders/storageProvider';
import { clearConfig, initConfig, configMock } from '../../mocks/config';
import { CleanupCommandCliTrigger } from './helpers/CliTrigger';

describe('cleanupCommand', function () {
  let cli: CleanupCommandCliTrigger;

  let processExitMock: jest.SpyInstance;

  const failedJobs = [
    {
      id: '37451d7f-aaa3-4bc6-9e68-7cb5eae764b1',
      resourceId: 'demo_1',
      version: 'tiles',
      parameters: {
        relativeDirectoryPath: 'test1',
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
        relativeDirectoryPath: 'test2',
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
        relativeDirectoryPath: 'test3',
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
        relativeDirectoryPath: 'test4',
      },
      created: '2021-04-11T13:11:06.614Z',
      updated: '2021-04-11T13:11:06.614Z',
      status: 'Completed',
      reason: '',
      isCleaned: true,
      expirationDate: new Date('2021-04-25T13:13:06.614Z'),
    },
  ];

  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(function () {
    jest.spyOn(global.console, 'error').mockReturnValue(undefined); // prevent cli error logs from messing with test log on bad path tests
    processExitMock = jest.spyOn(global.process, 'exit');
    processExitMock.mockReturnValueOnce(undefined); //prevent cli exit from killing the test

    container.registerInstance(JobManagerClient, jobManagerClientMock);

    initConfig();

    const app = getApp({
      override: [
        { token: SERVICES.CONFIG, provider: { useValue: configMock } },
        { token: SERVICES.LOGGER, provider: { useValue: jsLogger({ enabled: false }) } },
        { token: SERVICES.TRACER, provider: { useValue: trace.getTracer('testTracer') } },
        { token: SERVICES.STORAGE_PROVIDER, provider: { useValue: providerMock } },
        { token: JobManagerClient, provider: { useValue: jobManagerClientMock } },
      ],
      useChild: true,
    });
    cli = new CleanupCommandCliTrigger(app);
  });

  afterEach(() => {
    clearConfig();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('Happy Path', function () {
    it('clean uncleaned packages', async function () {
      jest.setSystemTime(new Date('2021-04-25T13:12:06.614Z'));
      getCompletedUncleanedJobsMock.mockResolvedValue(successfulJobs);
      getFailedUncleanedJobsMock.mockResolvedValue(failedJobs);
      deleteMock.mockResolvedValue(undefined);
      updateCleanedMock.mockResolvedValue(undefined);

      await cli.callAlias();

      expect(getCompletedUncleanedJobsMock).toHaveBeenCalledTimes(1);
      expect(getFailedUncleanedJobsMock).toHaveBeenCalledTimes(1);
      expect(updateCleanedMock).toHaveBeenCalledTimes(3);
      expect(updateCleanedMock).toHaveBeenNthCalledWith(1, '37451d7f-aaa3-4bc6-9e68-7cb5eae764b3');
      expect(updateCleanedMock).toHaveBeenNthCalledWith(2, '37451d7f-aaa3-4bc6-9e68-7cb5eae764b1');
      expect(updateCleanedMock).toHaveBeenNthCalledWith(3, '37451d7f-aaa3-4bc6-9e68-7cb5eae764b2');
      expect(deleteMock).toHaveBeenCalledTimes(3);
      expect(deleteMock).toHaveBeenNthCalledWith(1, 'test3');
      expect(deleteMock).toHaveBeenNthCalledWith(2, 'test1');
      expect(deleteMock).toHaveBeenNthCalledWith(3, 'test2');
    });
  });
});

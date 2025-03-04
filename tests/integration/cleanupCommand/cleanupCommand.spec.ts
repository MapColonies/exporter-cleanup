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
import { completedExportJobsResponse, failedExportJobResponses } from '../../mocks/jobResponsesMocks';

describe('cleanupCommand', function () {
  let cli: CleanupCommandCliTrigger;

  let processExitMock: jest.SpyInstance;

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
      //jest.setSystemTime(new Date('2021-04-25T13:12:06.614Z'));
      getCompletedUncleanedJobsMock.mockResolvedValue(completedExportJobsResponse);
      getFailedUncleanedJobsMock.mockResolvedValue(failedExportJobResponses);
      deleteMock.mockResolvedValue(undefined);
      updateCleanedMock.mockResolvedValue(undefined);

      await cli.callAlias();

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

import jsLogger from '@map-colonies/js-logger';
import nock from 'nock';
import { OperationStatus } from '@map-colonies/mc-priority-queue';
import { JobManagerClient } from '../../../src/clients/jobManagerClient';
import { IJobResponseWithoutParams } from '../../../src/common/interfaces';

describe('JobManagerClient', () => {
  let jobManagerClient: JobManagerClient;
  const jobManagerUrl = 'http://job-manager-job-manager';

  beforeEach(() => {
    jobManagerClient = new JobManagerClient(jsLogger({ enabled: false }));
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('getCompletedUncleanedJobs', () => {
    const expectedQuery = {
      isCleaned: false,
      status: OperationStatus.COMPLETED,
      shouldReturnTasks: false,
      type: '',
    };
    it('calls get with correct query', async () => {
      const getSpy = jest.spyOn(jobManagerClient as unknown as { get: jest.Func }, 'get');
      const path = '/jobs';
      expectedQuery.type = jobManagerClient['tilesJobType'];

      nock(jobManagerUrl).get(path).query(expectedQuery).reply(200, []);

      await jobManagerClient.getCompletedUncleanedJobs();

      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(getSpy).toHaveBeenCalledWith(path, expectedQuery);
    });

    it('returns empty array if response is undefined', async () => {
      nock(jobManagerUrl).get('/jobs').query(expectedQuery).reply(200, undefined);

      const result = await jobManagerClient.getCompletedUncleanedJobs();

      expect(result).toEqual([]);
    });

    it('returns jobs with params', async () => {
      const jobsWithoutParams = [{ id: '1' }, { id: '2' }] as IJobResponseWithoutParams[];
      const jobsWithParams = [
        { id: '1', parameters: {} },
        { id: '2', parameters: {} },
      ];

      nock(jobManagerUrl).get('/jobs').query(expectedQuery).reply(200, jobsWithoutParams);

      jobsWithoutParams.forEach((job, index) => {
        nock(jobManagerUrl).get(`/jobs/${job.id}`).reply(200, jobsWithParams[index]);
      });

      const result = await jobManagerClient.getCompletedUncleanedJobs();

      expect(result).toEqual(jobsWithParams);
    });
  });

  describe('getFailedUncleanedJobs', () => {
    const expectedQuery = {
      isCleaned: false,
      status: OperationStatus.FAILED,
      shouldReturnTasks: false,
      type: '',
    };
    it('calls get with correct query', async () => {
      const getSpy = jest.spyOn(jobManagerClient as unknown as { get: jest.Func }, 'get');
      const path = '/jobs';

      expectedQuery.type = jobManagerClient['tilesJobType'];

      nock(jobManagerUrl).get(path).query(expectedQuery).reply(200, []);

      await jobManagerClient.getFailedUncleanedJobs();

      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(getSpy).toHaveBeenCalledWith(path, expectedQuery);
    });

    it('returns empty array if response is undefined', async () => {
      expectedQuery.type = jobManagerClient['tilesJobType'];

      nock(jobManagerUrl).get('/jobs').query(expectedQuery).reply(200, undefined);

      const result = await jobManagerClient.getFailedUncleanedJobs();

      expect(result).toEqual([]);
    });

    it('returns jobs with params', async () => {
      const jobsWithoutParams = [{ id: '1' }, { id: '2' }] as IJobResponseWithoutParams[];
      const jobsWithParams = [
        { id: '1', parameters: {} },
        { id: '2', parameters: {} },
      ];

      expectedQuery.type = jobManagerClient['tilesJobType'];

      nock(jobManagerUrl).get('/jobs').query(expectedQuery).reply(200, jobsWithoutParams);

      jobsWithoutParams.forEach((job, index) => {
        nock(jobManagerUrl).get(`/jobs/${job.id}`).reply(200, jobsWithParams[index]);
      });

      const result = await jobManagerClient.getFailedUncleanedJobs();

      expect(result).toEqual(jobsWithParams);
    });
  });

  describe('updateCleaned', () => {
    it('calls put with correct body', async () => {
      const putSpy = jest.spyOn(jobManagerClient as unknown as { put: jest.Func }, 'put');
      const jobId = '1';
      const path = `/jobs/${jobId}`;
      const body = { isCleaned: true };

      nock(jobManagerUrl).put(path, body).reply(200);

      await jobManagerClient.updateCleaned(jobId);

      expect(putSpy).toHaveBeenCalledTimes(1);
      expect(putSpy).toHaveBeenCalledWith(path, body);
    });
  });
});

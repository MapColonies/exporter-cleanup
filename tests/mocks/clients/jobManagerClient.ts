import { JobManagerClient } from '../../../src/clients/jobManagerClient';

const getCompletedUncleanedJobsMock = jest.fn();
const getFailedUncleanedJobsMock = jest.fn();
const updateCleanedMock = jest.fn();

const jobManagerClientMock = {
  getCompletedUncleanedJobs: getCompletedUncleanedJobsMock,
  getFailedUncleanedJobs: getFailedUncleanedJobsMock,
  updateCleaned: updateCleanedMock,
} as unknown as JobManagerClient;

export { jobManagerClientMock, getCompletedUncleanedJobsMock, getFailedUncleanedJobsMock, updateCleanedMock };

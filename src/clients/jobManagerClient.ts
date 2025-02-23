import { inject, injectable } from 'tsyringe';
import config from 'config';
import { HttpClient, IHttpRetryConfig } from '@map-colonies/mc-utils';
import { Logger } from '@map-colonies/js-logger';
import { IExporterJobResponse, IJobResponseWithoutParams } from '../common/interfaces';
import { SERVICES } from '../common/constants';
import { OperationStatus } from '../common/enums';

@injectable()
export class JobManagerClient extends HttpClient {
  private readonly tilesJobType: string;
  private readonly tilesTaskType: string;

  public constructor(@inject(SERVICES.LOGGER) protected readonly logger: Logger) {
    super(logger, config.get<string>('jobManager.url'), 'JobManager', config.get<IHttpRetryConfig>('httpRetry'));
    this.tilesJobType = config.get<string>('workerTypes.tiles.jobType');
    this.tilesTaskType = config.get<string>('workerTypes.tiles.taskType');
  }

  public async getCompletedUncleanedJobs(): Promise<IExporterJobResponse[]> {
    const query = {
      isCleaned: false,
      status: OperationStatus.COMPLETED,
      type: this.tilesJobType,
      shouldReturnTasks: false,
    };
    const res = await this.get<IJobResponseWithoutParams[] | undefined>('/jobs', query);
    if (!res) {
      return [];
    }
    const jobsWithParams = await this.getJobsWithParams(res);
    return jobsWithParams;
  }

  public async getFailedUncleanedJobs(): Promise<IExporterJobResponse[]> {
    const query = {
      isCleaned: false,
      status: OperationStatus.FAILED,
      type: this.tilesJobType,
      shouldReturnTasks: false,
    };
    const res = await this.get<IJobResponseWithoutParams[] | undefined>('/jobs', query);
    if (!res) {
      return [];
    }
    const jobsWithParams = await this.getJobsWithParams(res);
    return jobsWithParams;
  }

  public async updateCleaned(jobId: string): Promise<void> {
    const body = {
      isCleaned: true,
    };
    await this.put(`/jobs/${jobId}`, body);
  }

  private async getJobsWithParams(jobs: IJobResponseWithoutParams[]): Promise<IExporterJobResponse[]> {
    const jobsWithParams = await Promise.all(jobs.map(async (job) => this.getExportJobById(job.id)));
    this.logger.info({ msg: `Got ${jobsWithParams.length} jobs with params` });
    return jobsWithParams;
  }

  private async getExportJobById(jobId: string): Promise<IExporterJobResponse> {
    this.logger.debug({ msg: `Getting export job by id`, jobId });
    const job = await this.get<IExporterJobResponse>(`/jobs/${jobId}`);
    return job;
  }
}

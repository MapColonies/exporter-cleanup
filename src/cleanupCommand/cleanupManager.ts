import { Logger } from '@map-colonies/js-logger';
import { inject, singleton } from 'tsyringe';
import { JobManagerClient } from '../clients/jobManagerClient';
import { SERVICES } from '../common/constants';
import { IExporterJobResponse } from '../common/interfaces';

@singleton()
export class CleanupManager {
  public constructor(@inject(SERVICES.LOGGER) private readonly logger: Logger,
    private readonly jobManagerClient: JobManagerClient){}
  
  public async cleanPackages(): Promise<void> {
    const jobs = await this.getJobsToClean();
    for(const job of jobs){
      await this.cleanJob(job);
    }
  }

  private async findExpiredPackages(): Promise<IExporterJobResponse[]> {
    const now = new Date();
    const jobs = await this.jobManagerClient.getCompletedUncleanedJobs();
    const expiredJobs = jobs.filter((job)=> job.expirationDate!= null && job.expirationDate < now);
    return expiredJobs;
  }

  private async findFailedJobs (): Promise<IExporterJobResponse[]>{
    const failedJobs = await this.jobManagerClient.getFailedUncleanedJobs();
    return failedJobs;
  }

  private getPackagePath(job:IExporterJobResponse): string {
    //TODO: implement properly
    const path = job.id //package.tasks?[0].parameters.packageName;
    return path;
  }

  private async getJobsToClean(): Promise<IExporterJobResponse[]>{
    const packages = await this.findExpiredPackages();
    const failedPackages = await this.findFailedJobs();
    packages.push(...failedPackages);
    return packages;
  }

  private async cleanJob(job:IExporterJobResponse): Promise<void> {
    const packagePath = this.getPackagePath(job);
    try {
      this.logger.info(`deleting ${packagePath} for job ${job.id}.`);
      //TODO: delete package
      await this.jobManagerClient.updateCleaned(job.id);
    } catch(err){
      const error = err as Error;
      this.logger.error(`failed to delete package at ${packagePath} due to ${error.message}. will be retied on next schedule.`);
      this.logger.debug(`stack: ${error.stack as string}`);
    }
  }
}

import { IJobResponse } from '@map-colonies/mc-priority-queue';

export interface IConfig {
  get: <T>(setting: string) => T;
  has: (setting: string) => boolean;
}

export interface ICleanupData {
  directoryPath?: string;
  cleanupExpirationTimeUTC?: Date;
}

export interface IExporterCleanupParameters {
  cleanupData?: ICleanupData;
}

export type IExporterJobResponse = IJobResponse<IExporterCleanupParameters, Record<string, unknown>>;

export type IJobResponseWithoutParams = Omit<IExporterJobResponse, 'parameters'>;

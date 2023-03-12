import { IJobResponse } from '@map-colonies/mc-priority-queue';
import { OperationStatus } from './enums';

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

export interface ITaskResponse<T> {
  description: string;
  parameters: T;
  reason: string;
  percentage: number;
  type: string;
  status: OperationStatus;
  attempts: number;
}

export type IExporterJobResponse = IJobResponse<IExporterCleanupParameters, Record<string, unknown>>;

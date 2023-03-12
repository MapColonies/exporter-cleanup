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

export interface IJobResponse<P, T> {
  id: string;
  resourceId: string;
  version: string;
  description: string;
  parameters: P;
  status: OperationStatus;
  reason: string;
  type: string;
  percentage: number;
  priority: number;
  tasks?: ITaskResponse<T>[];
  created: Date;
  updated: Date;
  isCleaned: boolean;
  expirationDate?: Date;
}

export type IExporterJobResponse = IJobResponse<IExporterCleanupParameters, Record<string, unknown>>;

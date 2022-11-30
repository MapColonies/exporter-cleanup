import { OperationStatus } from './enums';

export interface IConfig {
  get: <T>(setting: string) => T;
  has: (setting: string) => boolean;
}

export interface IExporterTaskParameters {
  dbId: string;
  crs: string;
  zoomLevel: number;
  callbackURL: string;
  bbox: unknown;
  expirationTime: Date;
  priority: number;
  tilesPath: string;
  footprint: unknown;
  packageName: string;
}

export interface IExporterJobParameters {
  userId: string;
  footprint: unknown;
  bbox: unknown;
  version: string;
  cswProductId: string;
  tilesPath: string;
  priority: number;
  crs: string;
  fileName: string;
  relativeDirectoryPath: string;
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

export type IExporterJobResponse = IJobResponse<IExporterJobParameters, IExporterTaskParameters>;

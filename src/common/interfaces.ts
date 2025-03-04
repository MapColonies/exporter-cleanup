import { IJobResponse } from '@map-colonies/mc-priority-queue';
import { ExportJobParameters } from '@map-colonies/raster-shared';

export interface IConfig {
  get: <T>(setting: string) => T;
  has: (setting: string) => boolean;
}

export type IExporterJobResponse = IJobResponse<ExportJobParameters, Record<string, unknown>>;

export type IJobResponseWithoutParams = Omit<IExporterJobResponse, 'parameters'>;

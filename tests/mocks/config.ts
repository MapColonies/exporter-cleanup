import config from 'config';
import { IConfig } from '../../src/common/interfaces';

let keys: Record<string, unknown> = {};
const getMock = jest.fn();
const hasMock = jest.fn();

const configMock = {
  get: getMock,
  has: hasMock,
} as IConfig;

const initConfig = (): void => {
  getMock.mockImplementation((key: string): unknown => {
    return keys[key] ?? config.get(key);
  });
};
const setConfigValue = (key: string, value: unknown): void => {
  keys[key] = value;
};

const clearConfig = (): void => {
  keys = {};
};
export { configMock, setConfigValue, clearConfig, initConfig };

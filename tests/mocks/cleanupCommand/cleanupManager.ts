import { CleanupManager } from '../../../src/cleanupCommand/cleanupManager';

const cleanPackagesMock = jest.fn();

const cleanupManagerMock = {
  cleanPackages: cleanPackagesMock,
} as unknown as CleanupManager;

export { cleanupManagerMock, cleanPackagesMock };

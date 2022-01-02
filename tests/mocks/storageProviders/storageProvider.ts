import { IStorageProvider } from '../../../src/storageProviders/iStorageProvider';

const deleteMock = jest.fn();

const providerMock = {
  delete: deleteMock,
} as IStorageProvider;

export { providerMock, deleteMock };

export interface IStorageProvider {
  delete: (path: string) => Promise<void>;
}

const listObjectsV2PromiseMock = jest.fn();
const listObjectsV2Mock = jest.fn();

const deleteObjectsPromiseMock = jest.fn();
const deleteObjectsMock = jest.fn();

const deleteObjectPromiseMock = jest.fn();
const deleteObjectMock = jest.fn();

const s3Mock = {
  listObjectsV2: listObjectsV2Mock,
  deleteObjects: deleteObjectsMock,
  deleteObject: deleteObjectMock,
};

const initS3Mock = (): void => {
  listObjectsV2Mock.mockReturnValue({
    promise: listObjectsV2PromiseMock,
  });
  deleteObjectsMock.mockReturnValue({
    promise: deleteObjectsPromiseMock,
  });
  deleteObjectMock.mockReturnValue({
    promise: deleteObjectPromiseMock,
  });
};

export {
  s3Mock,
  initS3Mock,
  listObjectsV2PromiseMock,
  listObjectsV2Mock,
  deleteObjectsPromiseMock,
  deleteObjectsMock,
  deleteObjectPromiseMock,
  deleteObjectMock,
};

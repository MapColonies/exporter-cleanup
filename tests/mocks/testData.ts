const urisArray = [
  '/gpkg_location/file.file',
  '/gpkg_location/file1.fakeDir0',
  '/gpkg_location/file2.fakeDir1',
  '/gpkg_location/file3.fakeDir2',
  '/gpkg_location/file4.fakeDir3',
  '/gpkg_location/file5.fakeDir4',
];

const urisArray2 = [
  '/gpkg_location/file2.file',
  '/gpkg_location/file6.fakeDir0',
  '/gpkg_location/file7.fakeDir1',
  '/gpkg_location/file8.fakeDir2',
  '/gpkg_location/file9.fakeDir3',
  '/gpkg_location/file10.fakeDir4',
];

const s3KeysArray = urisArray.map((uri) => {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  return { Key: uri };
});

const s3KeysArray2 = urisArray.map((uri) => {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  return { Key: uri };
});

export { urisArray, s3KeysArray, urisArray2, s3KeysArray2 };

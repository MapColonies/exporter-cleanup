/* eslint-disable import/first */
// this import must be called before the first import of tsyring
import 'reflect-metadata';
import { getTracing } from './common/tracing';
import { getApp } from './app';

async function main(): Promise<void> {
  const app = getApp();

  await app.run(process.argv);

  //stop tracing when app finish running
  await Promise.all([getTracing().stop()]);
}

void main();

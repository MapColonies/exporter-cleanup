/* eslint-disable import/first */
// this import must be called before the first import of tsyring
import 'reflect-metadata';
import { tracing } from './common/tracing';
import { getApp } from './app';

async function main(): Promise<void> {
  const app = getApp();

  await app.run(process.argv);

  //stop tracing when app finish running
  await Promise.all([tracing.stop()]);
}

void main();

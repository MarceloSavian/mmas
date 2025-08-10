/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: 'mmas',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      protect: ['production'].includes(input?.stage),
      home: 'aws',
    };
  },
  async run() {
    const storage = await import('./infra/storage');
    await import('./infra/database');
    await import('./infra/secrets');
    await import('./infra/email');
    await import('./infra/api');

    return {
      MyBucket: storage.bucket.name,
    };
  },
});

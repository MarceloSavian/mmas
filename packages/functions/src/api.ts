import { Resource } from 'sst';
import { Handler } from 'aws-lambda';
import { Example } from '@mmas/core/example';

export const handler: Handler = async () => {
  return {
    statusCode: 200,
    body: `${Example.hello()} Linked to ${Resource.MyBucket.name}.`,
  };
};

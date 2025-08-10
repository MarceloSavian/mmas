import { afterAll, describe, expect, it } from 'vitest';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { AuthenticationRepository } from './AuthenticationRepository';
import { Resource } from 'sst';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { AccountSchema } from '../../domain/models/Authentication';

describe('AuthenticationRepository', () => {
  const lowDynamo = new DynamoDB({
    ...(process.env.MOCK_DYNAMODB_ENDPOINT && {
      endpoint: process.env.MOCK_DYNAMODB_ENDPOINT,
      region: 'local',
    }),
  });
  const dynamoDBClient = DynamoDBDocumentClient.from(lowDynamo);

  const authenticationRepository = new AuthenticationRepository(dynamoDBClient);

  afterAll(() => {
    dynamoDBClient.destroy();
  });

  const input = {
    email: 'test@test.com',
    password: 'test_password',
    role: 'ADMIN',
    username: 'Name',
  };

  describe('insert()', () => {
    it('should insert data correctly', async () => {
      const result = await authenticationRepository.insert(input as AccountSchema);

      const keys = {
        PK: `USER#${result.id}`,
        SK: 'USER',
      };

      const gsi = {
        GSI1PK: `EMAIL#${input.email}`,
        GSI1SK: 'USER',
      };

      const command = new GetCommand({
        TableName: Resource.MMAS.name,
        Key: keys,
      });

      const data = await dynamoDBClient.send(command);

      expect(data.Item).toStrictEqual({ ...input, id: result.id, ...keys, ...gsi });
    });
  });
  describe('getByEmail', () => {
    it('should get data correctly by email', async () => {
      const insert = await authenticationRepository.insert(input as AccountSchema);

      const result = await authenticationRepository.findByEmail(input.email);

      expect(result).toEqual({ ...input, id: insert.id });
    });
  });
});

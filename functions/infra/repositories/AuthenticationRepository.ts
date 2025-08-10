import { DynamoDBDocumentClient, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { IAuthenticationRepository } from '../../data/domain/AuthenticationRepository';
import { accountSchema, AccountSchema } from '../../domain/models/Authentication';
import { v4 as uuidv4 } from 'uuid';
import { Resource } from 'sst';

export class AuthenticationRepository implements IAuthenticationRepository {
  constructor(private readonly dynamoDb: DynamoDBDocumentClient) {}

  async insert(input: AccountSchema): Promise<Omit<AccountSchema, 'password'>> {
    const id = uuidv4();

    const item = {
      PK: `USER#${id}`,
      SK: `USER`,
      id,
      ...input,
      GSI1PK: `EMAIL#${input.email}`,
      GSI1SK: 'USER',
    };

    const command = new PutCommand({
      TableName: Resource.MMAS.name,
      Item: item,
    });

    await this.dynamoDb.send(command);

    return { email: input.email, role: input.role, username: input.username };
  }

  async findByEmail(email: string): Promise<AccountSchema | null> {
    const command = new QueryCommand({
      TableName: Resource.MMAS.name,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :e AND GSI1SK = :t',
      ExpressionAttributeValues: {
        ':e': `EMAIL#${email}`,
        ':t': 'USER',
      },
      Limit: 1,
    });

    const res = await this.dynamoDb.send(command);

    if (!res.Items?.length) return null;

    return accountSchema.parse(res.Items[0]);
  }
}

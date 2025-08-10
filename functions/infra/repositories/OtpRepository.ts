import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { Resource } from 'sst';
import { IOtpRepository, otpData, OtpData } from '../../data/domain/OtpRepository';

export class OtpRepository implements IOtpRepository {
  constructor(private readonly dynamoDb: DynamoDBDocumentClient) {}

  async insert(data: Omit<OtpData, 'id'>): Promise<OtpData> {
    const id = uuidv4();

    const item = {
      PK: `OTP#${id}`,
      SK: `OTP`,
      id,
      ...data,
    };

    const command = new PutCommand({
      TableName: Resource.MMAS.name,
      Item: item,
    });

    await this.dynamoDb.send(command);

    return otpData.parse({ id, ...data });
  }

  async findById(id: string): Promise<OtpData | null> {
    const command = new GetCommand({
      TableName: Resource.MMAS.name,
      Key: {
        PK: `OTP#${id}`,
        SK: `OTP`,
      },
    });

    const res = await this.dynamoDb.send(command);

    if (!res.Item) return null;

    return otpData.parse(res.Item);
  }
}

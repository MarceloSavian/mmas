import { Resource } from 'sst';
import { IEmailService } from '../../data/domain/EmailService';
import { CreateEmailIdentityCommand, SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';

export class EmailService implements IEmailService {
  constructor(private readonly sesv2Client: SESv2Client) {}

  async verify(email: string): Promise<undefined> {
    await this.sesv2Client.send(
      new CreateEmailIdentityCommand({
        EmailIdentity: email,
      }),
    );
  }

  async sendSimple(subject: string, text: string, email: string): Promise<undefined> {
    await this.sesv2Client.send(
      new SendEmailCommand({
        FromEmailAddress: `no-reply@${Resource.MyEmail.sender}`,
        ReplyToAddresses: [email],
        Content: {
          Simple: {
            Subject: { Data: subject },
            Body: { Text: { Data: text } },
          },
        },
      }),
    );
  }
}

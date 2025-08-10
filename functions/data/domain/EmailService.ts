export interface IEmailService {
  sendSimple(subject: string, text: string, email: string): Promise<undefined>;
}

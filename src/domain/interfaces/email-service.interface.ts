export interface SendMailOptions {
  from?: string;
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export interface IEmailService {
  sendMail(options: SendMailOptions): Promise<void>;
}

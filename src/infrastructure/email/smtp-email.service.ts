import { env } from "../../config/env";
import {
  IEmailService,
  SendMailOptions,
} from "../../domain/interfaces/email-service.interface";
import nodemailer from "nodemailer";
import Logger from "../logger";

export class SmtpEmailService implements IEmailService {
  private transporter: nodemailer.Transporter;
  private from: string;

  constructor() {
    this.from = `no-reply@${env.SMTP_HOST}`;
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: parseInt(env.SMTP_PORT, 10),
      secure: true,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASSWORD,
      },
    });
  }
  async sendMail(options: SendMailOptions): Promise<void> {
    await this.transporter.sendMail({
      from: options.from || this.from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    Logger.info(
      `Email sent to ${options.to} with subject "${options.subject}"`,
    );
  }
}

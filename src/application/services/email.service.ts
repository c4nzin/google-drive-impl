import { IEmailService } from "../../domain/interfaces/email-service.interface";

export class EmailService {
  constructor(private emailProvider: IEmailService) {}

  async sendUserWelcomeEmail(user: {
    email: string;
    username: string;
    firstName?: string | null;
    lastName?: string | null;
  }) {
    const fullName =
      [user.firstName, user.lastName].filter(Boolean).join(" ") ||
      user.username;
    const subject = "Welcome to Our Service!";
    const text = `Hi ${fullName},\n\nWelcome to our service! We're excited to have you on board.\n\nBest regards,\nThe Team`;
    const html = `<p>Hi ${fullName},</p><p>Welcome to our service! We're excited to have you on board.</p><p>Best regards,<br>The Team</p>`;

    await this.emailProvider.sendMail({
      to: user.email,
      subject,
      text,
      html,
    });
  }
}

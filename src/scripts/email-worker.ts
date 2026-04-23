import { EmailService } from "../application/services/email.service";
import container from "../config/container";
import { IQueue } from "../domain/interfaces";
import Logger from "../infrastructure/logger";
import { emailQueue } from "../infrastructure/queue/email.queue";

async function start() {
  const emailService = container.resolve<EmailService>("emailService");
  const queue = container.resolve<IQueue>("queue");

  await queue.waitUntilReady();

  queue.process("send-welcome-email", async (data) => {
    await emailService.sendUserWelcomeEmail({
      email: data.email as string,
      username: data.username as string,
      firstName: data.firstName as string,
      lastName: data.lastName as string,
    });
  });

  process.on("SIGINT", async () => {
    await queue.close();
    process.exit(0);
  });
}

start().catch((err) => {
  Logger.error(
    {
      error: err?.message || String(err),
    },
    "Email worker failed to start",
  );
});

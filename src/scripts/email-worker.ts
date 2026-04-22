import { EmailService } from "../application/services/email.service";
import container from "../config/container";
import Logger from "../infrastructure/logger";
import { emailQueue } from "../infrastructure/queue/email.queue";

async function start() {
  const emailService = container.resolve<EmailService>("emailService");

  await emailQueue.client.connect();

  emailQueue.process("send-welcome-email", async (job) => {
    const { email, username, firstName, lastName } = job.data;

    await emailService.sendUserWelcomeEmail({
      email,
      username,
      firstName,
      lastName,
    });

    return { success: true };
  });

  emailQueue.on("completed", (job) => {
    Logger.info(` Completed job ${job.id} of type ${job.name}`);
  });

  emailQueue.on("failed", (job, error) => {
    Logger.error(
      {
        jobId: job.id,
        jobName: job.name,
        error: error?.message || String(error),
      },
      "Email job failed",
    );
  });

  process.on("SIGINT", async () => {
    await emailQueue.client.quit();
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

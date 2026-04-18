import Logger from "../../infrastructure/logger";
import { UserCreatedEvent } from "../dtos/user-created.event";
import { EmailService } from "../services/email.service";

type IncomingUserCreatedEvent = Omit<UserCreatedEvent, "type"> & {
  type: string;
};

function formatCreatedAt(createdAt: string | Date) {
  if (typeof createdAt === "string") return createdAt;
  return createdAt.toISOString();
}

export async function handleUserCreated(
  event: IncomingUserCreatedEvent,
  emailService: EmailService,
) {
  if (event.type !== "user.created") {
    Logger.warn(
      {
        eventType: event.type,
        eventId: event.eventId,
      },
      "unexpected event type for user.created handler",
    );
    return;
  }

  const { eventId, data } = event;
  const createdAt = formatCreatedAt(data.createdAt);

  Logger.info(
    {
      eventId,
      userId: data.id,
      email: data.email,
      username: data.username,
      createdAt,
    },
    "processed user.created event",
  );

  await emailService.sendUserWelcomeEmail({
    email: data.email,
    username: data.username,
    firstName: data.firstName,
    lastName: data.lastName,
  });
}

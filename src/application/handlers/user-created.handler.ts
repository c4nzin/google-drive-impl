import { IQueue } from "../../domain/interfaces";
import Logger from "../../infrastructure/logger";
import {
  emailQueue,
  SendWelcomeEmailJobData,
} from "../../infrastructure/queue/email.queue";
import { UserCreatedEvent } from "../dtos/user-created.event";

type IncomingUserCreatedEvent = Omit<UserCreatedEvent, "type"> & {
  type: string;
};

function formatCreatedAt(createdAt: string | Date) {
  if (typeof createdAt === "string") return createdAt;
  return createdAt.toISOString();
}

export async function handleUserCreated(
  event: IncomingUserCreatedEvent,
  queue: IQueue,
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

  const jobData: SendWelcomeEmailJobData = {
    eventId: eventId,
    userId: data.id,
    email: data.email,
    username: data.username ?? "",
    firstName: data.firstName ?? null,
    lastName: data.lastName ?? null,
  };

  await queue.add("send-welcome-email", jobData);
}

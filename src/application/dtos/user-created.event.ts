import { v4 as uuidv4 } from "uuid";

export interface UserCreatedEvent {
  eventId: string;
  type: "user.created";
  version: string;
  timestamp: number;
  data: {
    id: string;
    email: string;
    username: string;
    firstName?: string | null;
    lastName?: string | null;
    createdAt: Date;
  };
}

export function buildUserCreatedEvent(user: {
  id: string;
  email: string;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  createdAt: Date;
}): UserCreatedEvent {
  return {
    eventId: uuidv4(),
    type: "user.created",
    version: "v1",
    timestamp: Date.now(),
    data: {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName ?? null,
      lastName: user.lastName ?? null,
      createdAt: user.createdAt,
    },
  };
}

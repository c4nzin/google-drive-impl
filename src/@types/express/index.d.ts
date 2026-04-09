import { AwilixContainer } from "awilix";
import { User } from "../../domain/entities/user";

declare global {
  namespace Express {
    interface User extends User {}
    interface Request {
      container: AwilixContainer;
    }
  }
}

export {};

import { AwilixContainer } from "awilix";
import { User } from "../../domain/entities/User";

declare global {
  namespace Express {
    interface User extends User {}
    interface Request {
      container: AwilixContainer;
    }
  }
}

export {};

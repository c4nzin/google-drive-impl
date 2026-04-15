import { AutoMap } from "@automapper/classes";

export class User {
  @AutoMap()
  id?: string;

  @AutoMap()
  username!: string;

  @AutoMap()
  email!: string;

  password!: string;

  @AutoMap()
  firstName?: string;

  @AutoMap()
  lastName?: string;

  @AutoMap()
  refreshToken?: string;

  @AutoMap()
  createdAt?: Date;

  @AutoMap()
  updatedAt?: Date;
}

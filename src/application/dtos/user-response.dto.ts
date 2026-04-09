import { AutoMap } from "@automapper/classes";

export class UserResponseDto {
  @AutoMap()
  id!: string;

  @AutoMap()
  username!: string;

  @AutoMap()
  email!: string;

  @AutoMap()
  firstName?: string;

  @AutoMap()
  lastName?: string;
}

import { createContainer, asClass, asValue, InjectionMode } from "awilix";
import { UserModel } from "../infrastructure/persistence/schemas/user-schema";
import { UserRepository } from "../infrastructure/persistence/repositories/UserRepository";
import { UserService } from "../application/services/UserService";
import { UserController } from "../presentation/http/controllers/user.controller";
import { UserRoutes } from "../presentation/http/routes/user-routes";

const container = createContainer({ injectionMode: InjectionMode.PROXY }); //auto matching proxy

container.register({
  userModel: asValue(UserModel),

  userRepository: asClass(UserRepository).scoped(),
  userService: asClass(UserService).scoped(),
  userController: asClass(UserController).scoped(),
  userRoutes: asClass(UserRoutes).scoped(),
});

export default container;

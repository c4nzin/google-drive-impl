import { createContainer, asClass, asValue, InjectionMode } from "awilix";
import { UserModel } from "../infrastructure/persistence/schemas/user-schema";
import { UserRepository } from "../infrastructure/persistence/repositories/UserRepository";
import { UserService } from "../application/services/user.service";
import { UserController } from "../presentation/http/controllers/user.controller";
import { UserRoutes } from "../presentation/http/routes/user-routes";
import { AuthService } from "../application/services/auth.service";
import { AuthController } from "../presentation/http/controllers/auth-controller";
import { AuthRoutes } from "../presentation/http/routes/auth.routes";
import { env } from "./env";

const container = createContainer({ injectionMode: InjectionMode.PROXY });

container.register({
  userModel: asValue(UserModel),

  jwtSecret: asValue(env.JWT_SECRET),
  jwtExpiresIn: asValue(env.JWT_EXPIRES_IN),

  userRepository: asClass(UserRepository).scoped(),
  userService: asClass(UserService).scoped(),
  userController: asClass(UserController).scoped(),
  userRoutes: asClass(UserRoutes).scoped(),

  authService: asClass(AuthService).scoped(),
  authController: asClass(AuthController).scoped(),
  authRoutes: asClass(AuthRoutes).scoped(),
});

export default container;

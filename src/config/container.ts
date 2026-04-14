import { createContainer, asClass, asValue, InjectionMode } from "awilix";
import { UserModel } from "../infrastructure/persistence/schemas/user-schema";
import { UserService } from "../application/services/user.service";
import { UserController } from "../presentation/http/controllers/user.controller";
import { UserRoutes } from "../presentation/http/routes/user-routes";
import { AuthService } from "../application/services/auth.service";
import { AuthController } from "../presentation/http/controllers/auth-controller";
import { AuthRoutes } from "../presentation/http/routes/auth.routes";
import { env } from "./env";
import { LocalStrategy } from "../infrastructure/passport/local.strategy";
import { JwtStrategy } from "../infrastructure/passport/jwt-strategy";
import { UserRepository } from "../infrastructure/persistence/repositories/user.repository";

const container = createContainer({ injectionMode: InjectionMode.CLASSIC });

container.register({
  userModel: asValue(UserModel),

  jwtSecret: asValue(env.JWT_SECRET),
  jwtExpiresIn: asValue(env.JWT_EXPIRES_IN),

  userRepository: asClass(UserRepository).singleton(),
  userService: asClass(UserService).singleton(),
  userController: asClass(UserController).scoped(),
  userRoutes: asClass(UserRoutes).scoped(),

  authService: asClass(AuthService).singleton(),
  authController: asClass(AuthController).scoped(),
  authRoutes: asClass(AuthRoutes).scoped(),
  localStrategy: asClass(LocalStrategy).singleton(),
  jwtStrategy: asClass(JwtStrategy).singleton(),
});

export default container;

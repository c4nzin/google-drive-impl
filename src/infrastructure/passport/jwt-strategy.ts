import {
  ExtractJwt,
  Strategy as BaseJwtStrategy,
  StrategyOptionsWithoutRequest,
} from "passport-jwt";
import { env } from "../../config/env";
import { AwilixContainer } from "awilix";
import { UserService } from "../../application/services/user.service";

const strategyOptions: StrategyOptionsWithoutRequest = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: env.JWT_SECRET,
  passReqToCallback: false,
};

export class JwtStrategy extends BaseJwtStrategy {
  constructor(private container: AwilixContainer) {
    super(strategyOptions, async (payload: any, done: any) => {
      try {
        const userService = this.container.resolve<UserService>("userService");

        const user = await userService.getUserById(payload.userId);

        if (!user) {
          return done(null, false);
        }

        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    });
  }
}

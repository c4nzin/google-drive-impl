import {
  ExtractJwt,
  Strategy as BaseJwtStrategy,
  StrategyOptionsWithoutRequest,
} from "passport-jwt";
import { env } from "../../config/env";
import { UserService } from "../../application/services/user.service";

const strategyOptions: StrategyOptionsWithoutRequest = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: env.JWT_SECRET,
  passReqToCallback: false,
};

export class JwtStrategy extends BaseJwtStrategy {
  constructor(private userService: UserService) {
    super(strategyOptions, async (payload: any, done: any) => {
      try {
        const user = await this.userService.getUserById(payload.userId);

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

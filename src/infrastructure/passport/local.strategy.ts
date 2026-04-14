import { Request } from "express";
import { Strategy } from "passport-local";
import { HttpStatus } from "../../domain/errors/status-codes.enum";
import { AuthService } from "../../application/services/auth.service";

export class LocalStrategy extends Strategy {
  constructor(private readonly authService: AuthService) {
    super({ usernameField: "email" }, (_username, _password, done) =>
      done(null),
    );
  }

  async authenticate(req: Request, options?: any): Promise<any> {
    try {
      const { email, password } = req.body;

      const user = await this.authService.login(email, password);

      if (!user) {
        this.fail({ message: "Invalid credentials" }, HttpStatus.Unauthorized);

        return false;
      }

      return this.success(user);
    } catch (error: any) {
      return this.error(error.message || "Authentication error");
    }
  }
}

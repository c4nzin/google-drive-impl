import { Request, Response, NextFunction } from "express";
import { AuthService } from "../../../application/services/auth.service";
import { HttpStatus } from "../../../domain/errors/status-codes.enum";
import { User } from "../../../domain/entities/user";

export class AuthController {
  constructor(private authService: AuthService) {}

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tokens = await this.authService.createTokens(req.user as User);
      res.status(HttpStatus.OK).json({ tokens });
    } catch (error) {
      next(error);
    }
  }

  async register(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const user = await this.authService.register(req.body as User);
      res.status(HttpStatus.Created).json(user);
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { refreshToken } = req.body as { refreshToken: string };

      const tokens = await this.authService.refreshTokens(refreshToken);

      res.status(HttpStatus.OK).json({ tokens });
    } catch (error) {
      next(error);
    }
  }
}

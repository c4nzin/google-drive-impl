import { Request, Response, NextFunction } from "express";
import { AuthService } from "../../../application/services/auth.service";
import { HttpStatus } from "../../../domain/errors/status-codes.enum";
import { User } from "../../../domain/entities/User";

export class AuthController {
  constructor(private authService: AuthService) {}

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = await this.authService.generateToken(req.user as User);
      res.status(HttpStatus.OK).json({ token });
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
}

import { UserService } from "../../../application/services/user.service";
import { Request, Response, NextFunction } from "express";
import { HttpStatus } from "../../../domain/errors/status-codes.enum";
import { UserResponseDto } from "../../../application/dtos/user-response.dto";
import { mapper } from "../../../config/mapper";
import { User } from "../../../domain/entities/user";

export class UserController {
  constructor(private readonly userService: UserService) {}

  async getUserById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const user = await this.userService.getUserById(req.params.id as string);
      res.status(HttpStatus.OK).json(mapper.map(user, User, UserResponseDto));
    } catch (error) {
      next(error);
    }
  }

  async getUserByEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await this.userService.getUserByEmail(req.body.email);
      res.status(HttpStatus.OK).json(mapper.map(user, User, UserResponseDto));
    } catch (error) {
      next(error);
    }
  }

  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await this.userService.createUser(req.body);
      res
        .status(HttpStatus.Created)
        .json(mapper.map(user, User, UserResponseDto));
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await this.userService.updateUser(
        req.params.id as string,
        req.body,
      );
      res.status(HttpStatus.OK).json(mapper.map(user, User, UserResponseDto));
    } catch (error) {
      next(error);
    }
  }

  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await this.userService.getAllUsers();
      res
        .status(HttpStatus.OK)
        .json(mapper.mapArray(users, User, UserResponseDto));
    } catch (error) {
      next(error);
    }
  }
}

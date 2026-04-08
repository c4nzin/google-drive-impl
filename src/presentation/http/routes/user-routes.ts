import { Router } from "express";
import { UserController } from "../controllers/user.controller";

export class UserRoutes {
  public router: Router;

  constructor(private userController: UserController) {
    this.router = Router();

    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.get("/:id", (req, res, next) =>
      this.userController.getUserById(req, res, next),
    );
    this.router.get("/", (req, res, next) =>
      this.userController.getAllUsers(req, res, next),
    );

    this.router.post("/", (req, res, next) =>
      this.userController.createUser(req, res, next),
    );

    this.router.put("/:id", (req, res, next) =>
      this.userController.updateUser(req, res, next),
    );
  }
}

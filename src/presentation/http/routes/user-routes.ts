import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { validateRequest } from "../middlewares/validate-request";
import { userSchema, userUpdateSchema } from "../schemas/user.schema";

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

    this.router.post("/", validateRequest(userSchema), (req, res, next) =>
      this.userController.createUser(req, res, next),
    );

    this.router.put(
      "/:id",
      validateRequest(userUpdateSchema),
      (req, res, next) => this.userController.updateUser(req, res, next),
    );
  }
}

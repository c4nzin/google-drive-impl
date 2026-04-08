import { Router } from "express";
import { AuthController } from "../controllers/auth-controller";
import { validateRequest } from "../middlewares/validate-request";
import { loginSchema, registerSchema } from "../schemas/auth.schema";

export class AuthRoutes {
  public router: Router;

  constructor(private authController: AuthController) {
    this.router = Router();
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.post("/login", validateRequest(loginSchema), (req, res, next) =>
      this.authController.login(req, res, next),
    );

    this.router.post(
      "/register",
      validateRequest(registerSchema),
      (req, res, next) => this.authController.register(req, res, next),
    );
  }
}

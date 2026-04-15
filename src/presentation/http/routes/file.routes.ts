import { Router, Request, Response, NextFunction } from "express";
import passport from "passport";
import multer from "multer";
import { FileController } from "../controllers/file.controller";
import { validateRequest } from "../middlewares/validate-request";
import { fileUpdateSchema } from "../schemas/file.schema";

const upload = multer({ dest: "./tmp/uploads" });

export class FileRoutes {
  public router: Router;

  constructor(private fileController: FileController) {
    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post(
      "/upload",
      passport.authenticate("jwt", { session: false }),
      upload.single("file"),
      (req, res, next) => this.fileController.upload(req, res, next),
    );

    this.router.get(
      "/",
      passport.authenticate("jwt", { session: false }),
      (req, res, next) => this.fileController.list(req, res, next),
    );

    this.router.get(
      "/:id/download",
      passport.authenticate("jwt", { session: false }),
      (req, res, next) => this.fileController.download(req, res, next),
    );

    this.router.delete(
      "/:id",
      passport.authenticate("jwt", { session: false }),
      (req, res, next) => this.fileController.delete(req, res, next),
    );

    this.router.put(
      "/:id",
      passport.authenticate("jwt", { session: false }),
      validateRequest(fileUpdateSchema),
      (req, res, next) => this.fileController.update(req, res, next),
    );

    this.router.get(
      "/:id",
      passport.authenticate("jwt", { session: false }),
      (req, res, next) => this.fileController.show(req, res, next),
    );
  }
}

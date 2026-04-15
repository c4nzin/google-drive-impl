import { Router } from "express";
import passport from "passport";
import multer from "multer";
import { FileController } from "../controllers/file.controller";

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
  }
}

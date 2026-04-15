import { Request, Response, NextFunction } from "express";
import { FileService } from "../../../application/services/file.service";
import { HttpStatus } from "../../../domain/errors/status-codes.enum";

interface UploadRequest extends Request {
  file?: Express.Multer.File;
}

interface FileParams {
  id: string;
}

export class FileController {
  constructor(private fileService: FileService) {}

  async upload(req: UploadRequest, res: Response, next: NextFunction) {
    try {
      const { parentId } = req.body;
      if (!req.file) {
        throw new Error("No file uploaded");
      }
      const file = req.file;
      const ownerId = (req.user as any).id;

      const saved = await this.fileService.uploadFile(
        ownerId,
        file.path,
        file.originalname,
        file.mimetype,
        file.size,
        parentId,
      );

      res.status(HttpStatus.Created).json(saved);
    } catch (error) {
      next(error);
    }
  }

  async download(req: Request<FileParams>, res: Response, next: NextFunction) {
    try {
      const ownerId = (req.user as any).id;
      const { file, stream } = await this.fileService.downloadFile(
        req.params.id,
        ownerId,
      );

      res.setHeader("Content-Type", file.mimeType);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${file.name}"`,
      );

      stream.pipe(res);
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const ownerId = (req.user as any).id;
      const files = await this.fileService.listFiles(ownerId);
      res.status(HttpStatus.OK).json(files);
    } catch (error) {
      next(error);
    }
  }
}

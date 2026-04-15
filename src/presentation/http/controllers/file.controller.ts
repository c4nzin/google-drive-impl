import { Request, Response, NextFunction } from "express";
import { FileService } from "../../../application/services/file.service";
import { HttpStatus } from "../../../domain/errors/status-codes.enum";
import { ListFilesOptions } from "../../../domain/interfaces";

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
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const parentId = req.query.parentId as string | undefined;
      const search = req.query.search as string | undefined;

      const opts: ListFilesOptions = {
        page,
        limit,
        parentId,
        search,
      };

      const result = await this.fileService.listFiles(ownerId, opts);
      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request<FileParams>, res: Response, next: NextFunction) {
    try {
      const ownerId = (req.user as any).id;
      await this.fileService.deleteFile(req.params.id, ownerId);
      res.status(HttpStatus.NoContent).send();
    } catch (error) {
      next(error);
    }
  }

  async show(req: Request<FileParams>, res: Response, next: NextFunction) {
    try {
      const ownerId = (req.user as any).id;
      const file = await this.fileService.getFileById(req.params.id, ownerId);
      res.status(HttpStatus.OK).json(file);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const ownerId = (req.user as any).id;
      const { name, parentId } = req.body;

      const updated = await this.fileService.updateFile(
        req.params.id as string,
        ownerId,
        {
          name,
          parentId,
        },
      );

      res.status(HttpStatus.OK).json(updated);
    } catch (error) {
      next(error);
    }
  }
}

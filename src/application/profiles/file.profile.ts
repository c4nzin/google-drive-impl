import { createMap } from "@automapper/core";

import { File } from "../../domain/entities/file";
import { mapper } from "../../config/mapper";
import { FileResponseDto } from "../dtos/file-response.dto";

createMap(mapper, File, FileResponseDto);

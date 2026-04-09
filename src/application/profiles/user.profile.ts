import { createMap } from "@automapper/core";
import { mapper } from "../../config/mapper";
import { User } from "../../domain/entities/user";
import { UserResponseDto } from "../dtos/user-response.dto";

createMap(mapper, User, UserResponseDto);

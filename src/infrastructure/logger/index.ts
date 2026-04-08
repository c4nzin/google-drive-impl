import pino from "pino";
import { env } from "../../config/env";

const isDevelopment = env.NODE_ENV === "development";

const Logger = pino({
  level: env.LOG_LEVEL || "info",

  ...(isDevelopment && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        ignore: "pid.hostname",
      },
    },
  }),
});

export default Logger;

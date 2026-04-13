import { Express } from "express";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import path from "path";

export async function buildSwagger(app: Express): Promise<void> {
  let swaggerSpec: swaggerJSDoc.Options = {
    definition: {
      info: {
        title: "Official API documentation for the NestCloud Drive clone api",
        version: "1.0.0",
        description: "API documentation for the NestCloud Drive clone project",
      },
      openapi: "3.0.0",
    },
    apis: [path.join(__dirname, "./routes/*.ts")],
  };

  const swaggerDocument = swaggerJSDoc(swaggerSpec);

  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

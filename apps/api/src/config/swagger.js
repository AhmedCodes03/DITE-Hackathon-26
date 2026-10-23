import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "HealthCare API",
      version: "1.0.0",
      description: "REST API for the HealthCare appointment booking platform"
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Development server"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: [
    "./src/modules/auth/auth.routes.js",
    "./src/modules/appointments/appointments.routes.js"
  ]
};

export const swaggerSpec = swaggerJSDoc(options);

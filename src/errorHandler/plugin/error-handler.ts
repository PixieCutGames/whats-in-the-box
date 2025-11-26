import fp from "fastify-plugin";
import { ZodError } from "zod";
import { Prisma } from "../../generated/prisma/index.js";
import { FastifyInstance } from "fastify";

const errorHandler = fp(async (fastify: FastifyInstance) => {
  console.log("plugin loaded: 🔥 error handler");

  fastify.setErrorHandler((err, request, reply) => {
    // ------------------------------
    // 1. ZOD VALIDATION ERRORS
    // ------------------------------
    if (err instanceof ZodError) {
      console.log("🔥 ZodError Details:", err.issues);
      return reply.status(400).send({
        error: "ValidationError",
        message: "Invalid input.",
        details: err.issues.map((e) => ({
          path: e.path.join("."),
          message: e.message,
        })),
      });
    }

    // ------------------------------
    // 2. FASTIFY BUILT-IN VALIDATION ERRORS
    // (e.g., wrong querystring type)
    // ------------------------------
    if (err.validation) {
      return reply.status(400).send({
        error: "ValidationError",
        message: "Request validation failed.",
        details: err.validation,
      });
    }

    // ------------------------------
    // 3. JWT ERRORS (expired, invalid)
    // ------------------------------
    if (err.name === "JsonWebTokenError" || err.name === "UnauthorizedError") {
      return reply.status(401).send({
        error: "Unauthorized",
        message: "Invalid token.",
      });
    }

    if (err.name === "TokenExpiredError") {
      return reply.status(401).send({
        error: "TokenExpired",
        message: "Token has expired.",
      });
    }

    // Fastify JWT error (from @fastify/jwt)
    if (err.code === "FST_JWT_AUTHORIZATION_FAILURE") {
      return reply.status(401).send({
        error: "Unauthorized",
        message: err.message || "Invalid token.",
      });
    }

    // ------------------------------
    // 4. PRISMA ERRORS
    // ------------------------------
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      // Prisma unique constraint error (e.g. duplicate email)
      if (err.code === "P2002") {
        return reply.status(409).send({
          error: "UniqueConstraintError",
          message: `Unique constraint failed on field: ${err.meta?.target}`,
        });
      }

      // Foreign key constraint error
      if (err.code === "P2003") {
        return reply.status(400).send({
          error: "ForeignKeyError",
          message: "Invalid reference to another record.",
        });
      }

      // Record not found
      if (err.code === "P2025") {
        return reply.status(404).send({
          error: "NotFound",
          message: err.meta?.cause || "Record not found.",
        });
      }

      // General Prisma error fallback
      return reply.status(500).send({
        error: "DatabaseError",
        message: err.message || "Database operation failed.",
      });
    }

    // ------------------------------
    // 5. MULTIPART/UPLOAD ERRORS
    // ------------------------------
    if (err.code === "FST_MULTIPART_INVALID_FIELD_NAME") {
      return reply.status(400).send({
        error: "UploadError",
        message: "Invalid multipart field name.",
      });
    }

    // ------------------------------
    // 6. BAD REQUEST ERRORS
    // ------------------------------
    if (err.statusCode === 404) {
      return reply.status(404).send({
        error: "BadRequest",
        message: err.message || "Bad request.",
      });
    }

    // ------------------------------
    // 7. AUTHENTICATION HOOK ERRORS
    // ------------------------------
    if (err.statusCode === 401) {
      return reply.status(401).send({
        error: "Unauthorized",
        message: err.message || "Authentication required.",
      });
    }

    // ------------------------------
    // 8. FORBIDDEN ERRORS
    // ------------------------------
    if (err.statusCode === 403) {
      return reply.status(403).send({
        error: "Forbidden",
        message: err.message || "Forbidden request.",
      });
    }

    // ------------------------------
    // 9. FORBIDDEN ERRORS
    // ------------------------------
    if (err.statusCode === 404) {
      return reply.status(404).send({
        error: "NOotFound",
        message: err.message || "Resource not found.",
      });
    }

    // ------------------------------
    // 10. CONFLICT ERRORS
    // ------------------------------
    if (err.statusCode === 409) {
      return reply.status(409).send({
        error: "Conflict",
        message: err.message || "Conflict occurred.",
      });
    }

    // ------------------------------
    // 11. FALLBACK (500 INTERNAL ERROR)
    // ------------------------------
    fastify.log.error(err, "🔥 🔥 🔥 "); // logs full stack trace internally

    return reply.status(500).send({
      error: "ServerError",
      message: "An unexpected error occurred.!!!!",
    });
  });
});

export default errorHandler;

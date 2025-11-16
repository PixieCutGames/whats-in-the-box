import fp from "fastify-plugin";
import { FastifyInstance } from "fastify";
import Multipart from "@fastify/multipart";
import uploadRoute from "../routes/upload.js";

const mediaPlugin = fp(async (fastify: FastifyInstance) => {
  // register routes
  fastify.register(Multipart);
  fastify.register(uploadRoute, { prefix: "/media" });
});

export default mediaPlugin;

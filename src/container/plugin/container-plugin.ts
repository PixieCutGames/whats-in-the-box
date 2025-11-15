import fp from "fastify-plugin";
import { FastifyInstance } from "fastify";
import getByIdRoute from "../routes/getById.js";
import createRoute from "../routes/create.js";
import getAllRoute from "../routes/getAll.js";
import updateRoute from "../routes/update.js";

const containerPlugin = fp(async (fastify: FastifyInstance) => {
  // register routes
  fastify.register(getByIdRoute, { prefix: "/container" });
  fastify.register(getAllRoute, { prefix: "/containers" });
  fastify.register(createRoute, { prefix: "/container" });
  fastify.register(updateRoute, { prefix: "/container" });
});

export default containerPlugin;

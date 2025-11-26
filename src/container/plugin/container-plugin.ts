import fp from "fastify-plugin";
import { FastifyInstance } from "fastify";
import getByIdRoute from "../routes/getById.js";
import createRoute from "../routes/create.js";
import getAllRoute from "../routes/getAll.js";
import updateRoute from "../routes/update.js";
import deleteRoute from "../routes/delete.js";

const containerPlugin = fp(async (fastify: FastifyInstance) => {
  console.log("Plugin loaded:", "📦 container plugin");
  // register routes
  fastify.register(getByIdRoute, { prefix: "/container" });
  fastify.register(getAllRoute, { prefix: "/containers" });
  fastify.register(createRoute, { prefix: "/container" });
  fastify.register(updateRoute, { prefix: "/container" });
  fastify.register(deleteRoute, { prefix: "/container" });
});

export default containerPlugin;

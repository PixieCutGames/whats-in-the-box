import fp from "fastify-plugin";
import { FastifyInstance } from "fastify";
import getAllRoute from "../routes/getAll.js";
import getByIdRoute from "../routes/getById.js";
import deleteRoute from "../routes/delete.js";
import createRoute from "../routes/create.js";
import updateRoute from "../routes/update.js";

const itemPlugin = fp(async (fastify: FastifyInstance) => {
  console.log("Plugin loaded:", "🧩 items plugin");
  // register routes
  fastify.register(getAllRoute, { prefix: "/items" });
  fastify.register(getByIdRoute, { prefix: "/item" });
  fastify.register(createRoute, { prefix: "/item" });
  fastify.register(updateRoute, { prefix: "/item" });
  fastify.register(deleteRoute, { prefix: "/item" });
});

export default itemPlugin;

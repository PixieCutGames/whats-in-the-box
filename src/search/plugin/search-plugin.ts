import fp from "fastify-plugin";
import { FastifyInstance } from "fastify";
import quickRoute from "../routes/quick.js";
import advancedRoute from "../routes/advanced.js";

const searchPlugin = fp(async (fastify: FastifyInstance) => {
  console.log("Plugin loaded:", "🔍 search plugin");
  // register routes
  fastify.register(quickRoute, { prefix: "/quick" });
  fastify.register(advancedRoute, { prefix: "/search" });
});

export default searchPlugin;

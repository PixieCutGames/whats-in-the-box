import fp from "fastify-plugin";
import { FastifyInstance } from "fastify";
import quickRoute from "../routes/quick.js";

const searchPlugin = fp(async (fastify: FastifyInstance) => {
  // register routes
  fastify.register(quickRoute, { prefix: "/quick" });
});

export default searchPlugin;

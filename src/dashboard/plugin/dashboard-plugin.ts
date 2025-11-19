import fp from "fastify-plugin";
import { FastifyInstance } from "fastify";
import getStatsRoute from "../routes/getStats.js";
import getActivitiesRoute from "../routes/getActivities.js";

const dashboardPlugin = fp(async (fastify: FastifyInstance) => {
  // register routes
  fastify.register(getStatsRoute, { prefix: "/dashboard" });
  fastify.register(getActivitiesRoute, { prefix: "/dashboard" });
});

export default dashboardPlugin;

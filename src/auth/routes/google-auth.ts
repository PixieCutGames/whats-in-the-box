import { FastifyPluginAsync } from "fastify";

const googleAuthRoute: FastifyPluginAsync = async (fastify, opts) => {
  fastify.get("/google", async (request, reply) => {
    const redirectUrl =
      "https://accounts.google.com/o/oauth2/v2/auth?" +
      new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
        response_type: "code",
        scope: "openid email profile",
        access_type: "offline",
        prompt: "consent",
      });

    reply.redirect(redirectUrl);
  });
};

export default googleAuthRoute;

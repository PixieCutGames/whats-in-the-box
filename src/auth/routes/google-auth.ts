import { FastifyPluginAsync } from "fastify";

const googleAuthRoute: FastifyPluginAsync = async (fastify, opts) => {
  fastify.get("/google", async (request, reply) => {
    const redirectUrl =
      "https://accounts.google.com/o/oauth2/v2/auth?" +
      new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        redirect_uri: `${request.protocol}://${request.host}/auth/google/callback`,
        response_type: "code",
        scope: "openid email profile",
        access_type: "offline",
        prompt: "consent",
      });

    reply.redirect(redirectUrl);
  });
};

export default googleAuthRoute;

import { FastifyPluginAsync } from "fastify";
import { getGoogleTokens } from "../../lib/getGoogleTokens.js";
import { verifyGoogleIdToken } from "../../lib/verifyGoogleIdToken.js";

const googleCallbackRoute: FastifyPluginAsync = async (fastify, opts) => {
  fastify.get("/google/callback", async (request, reply) => {
    const { code } = request.query as { code?: string };

    const tokens: any = await getGoogleTokens(code || "");
    const googleUser = await verifyGoogleIdToken(tokens.id_token);

    // STEP 1 — Look for existing Google account by email
    let user = await fastify.prisma.user.findUnique({
      where: { email: googleUser.email },
    });

    if (user && !user.provider) {
      // STEP 2 — Link Google account
      user = await fastify.prisma.user.update({
        where: { id: user.id },
        data: {
          provider: "google",
          providerId: googleUser.sub,
          isVerified: true,
        },
      });
    }

    // STEP 3 — If no user, create one
    if (!user) {
      user = await fastify.prisma.user.create({
        data: {
          email: googleUser.email,
          name: googleUser.name,
          provider: "google",
          providerId: googleUser.sub,
          isVerified: true,
        },
      });
    }

    // STEP 4 — Create JWT tokens
    const accessToken = fastify.jwt.sign(
      { sub: user.id },
      { expiresIn: "15m" }
    );
    const refreshToken = fastify.jwt.sign(
      { sub: user.id },
      { expiresIn: "30d" }
    );

    reply.redirect(
      `${process.env.FRONTEND_URL}/social-success?token=${accessToken}&refreshToken=${refreshToken}`
    );
  });
};

export default googleCallbackRoute;

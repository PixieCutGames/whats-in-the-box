import { FastifyPluginAsync } from "fastify";

const refreshTokenRoute: FastifyPluginAsync = async (fastify) => {
  fastify.post(
    "/refresh-token",
    { preHandler: fastify.authenticate },
    async (request, reply) => {
      const userId = request.user.sub;
      const user = await fastify.prisma.user.findUnique({
        where: { id: userId },
        omit: {
          password: true,
          verificationToken: true,
          verificationExpiresAt: true,
        },
      });

      if (!user) {
        throw fastify.httpErrors.notFound("Invalid or expired refresh token.");
      }

      const accessToken = fastify.jwt.sign(
        { sub: user.id },
        { expiresIn: "15m" }
      );
      const refreshToken = fastify.jwt.sign(
        { sub: user.id },
        { expiresIn: "30d" }
      );

      return reply.send({ accessToken, refreshToken });
    }
  );
};

export default refreshTokenRoute;

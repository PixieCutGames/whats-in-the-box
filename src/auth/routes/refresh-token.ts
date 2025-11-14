import { FastifyPluginAsync } from "fastify";

const refreshTokenRoute: FastifyPluginAsync = async (fastify) => {
  fastify.post(
    "/refresh-token",
    { preHandler: fastify.authenticate },
    async (request, reply) => {
      const userId = request.user.sub;

      try {
        const user = await fastify.prisma.user.findUnique({
          where: { id: userId },
          omit: {
            password: true,
            verificationToken: true,
            verificationExpiresAt: true,
          },
        });

        if (!user) {
          return reply
            .code(404)
            .send({ error: "Invalid or expired refresh token." });
        }

        const accessToken = fastify.jwt.sign(
          { sub: user.id },
          { expiresIn: "15m" }
        );
        const refreshToken = fastify.jwt.sign(
          { sub: user.id },
          { expiresIn: "30d" }
        );

        return { accessToken, refreshToken };
      } catch (err) {
        console.log(err);
        return reply.code(500).send({ error: "Internal server error" });
      }
    }
  );
};

export default refreshTokenRoute;

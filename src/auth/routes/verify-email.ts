import { FastifyPluginAsync } from "fastify";

const verifyEmailRoute: FastifyPluginAsync = async (fastify, opts) => {
  fastify.get("/verify-email", async (request, reply) => {
    const { token } = request.query as { token?: string };
    if (!token) return reply.code(404).send({ error: "Token required" });

    const user = await fastify.prisma.user.findUnique({
      where: { verificationToken: token },
    });

    if (user?.isVerified) return reply.send({ success: true });
    if (
      !user ||
      !user.verificationExpiresAt ||
      user.verificationExpiresAt < new Date()
    ) {
      return reply.code(404).send({ error: "Invalid or expired token" });
    }

    await fastify.prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationExpiresAt: null,
      },
    });

    return reply.send({ success: true });
  });
};

export default verifyEmailRoute;

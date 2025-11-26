import { FastifyPluginAsync } from "fastify";
import { sendWelcomeEmail } from "../../emails/sendWelcomeEmail.js";

const verifyEmailRoute: FastifyPluginAsync = async (fastify, opts) => {
  fastify.get("/verify-email", async (request, reply) => {
    const { token } = request.query as { token?: string };
    if (!token) throw fastify.httpErrors.notFound("Token required");

    const user = await fastify.prisma.user.findUnique({
      where: { verificationToken: token },
    });

    if (user?.isVerified) return reply.send({ success: true });
    if (
      !user ||
      !user.verificationExpiresAt ||
      user.verificationExpiresAt < new Date()
    ) {
      throw fastify.httpErrors.badRequest("Invalid or expired token.");
    }

    await fastify.prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationExpiresAt: null,
      },
    });

    if (user.email) {
      const res = await sendWelcomeEmail(user.email);
      console.log("sent", res.data, res.error);
    }

    return reply.send({ success: true });
  });
};

export default verifyEmailRoute;

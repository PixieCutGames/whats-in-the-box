import { FastifyPluginAsync } from "fastify";
import * as crypto from "crypto";

const resendVerificationRoute: FastifyPluginAsync = async (fastify) => {
  fastify.patch(
    "/resend-verification",
    {
      schema: {
        body: {
          type: "object",
        },
      },
    },
    async (request, reply) => {
      const body = request.body as any;
      const { token: verificationToken, email } = body;
      const user = await fastify.prisma.user.findFirst({
        where: { OR: [{ email }, { verificationToken }] },
      });
      console.log(user);

      if (!user) {
        return reply.code(404).send({ error: "User not found" });
      }

      const token = crypto.randomBytes(32).toString("hex");
      const date = new Date();
      date.setDate(date.getDate() + 1);

      const updatedUser = await fastify.prisma.user.update({
        where: { id: user.id },
        data: { verificationToken: token, verificationExpiresAt: date },
      });

      const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
      // TODO:  send email using resend.com

      reply.send({
        verificationToken: token,
        verificationLink,
      });
    }
  );
};

export default resendVerificationRoute;

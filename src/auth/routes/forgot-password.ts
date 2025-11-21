import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import crypto from "crypto";
import { sendForgotPasswordEmail } from "../../emails/sendForgotPasswordEmail.js";

const forgotPasswordSchema = z.object({
  email: z.email(),
});

const forgotPasswordRoute: FastifyPluginAsync = async (fastify) => {
  fastify.post(
    "/forgot-password",
    {
      schema: {
        body: {
          type: "object",
        },
      },
    },
    async (request, reply) => {
      const body = request.body as any;
      const { email } = forgotPasswordSchema.parse(body);

      const user = await fastify.prisma.user.findUnique({
        where: { email },
      });
      // Always return success regardless of user existence
      if (!user) {
        return reply.send({
          message:
            "If an account exists, a password reset email has been sent.",
        });
      }

      // 2. Generate raw token
      const rawToken = crypto.randomBytes(32).toString("hex");

      // 3. Hash token before storing
      const tokenHash = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");

      const expiresAt = new Date(Date.now() + 1000 * 60 * 15); // 15 minutes

      // 4. Save token
      await fastify.prisma.passwordResetToken.create({
        data: {
          tokenHash,
          userId: user.id,
          expiresAt,
        },
      });

      // 5. Send email
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}`;

      if ((user.email, rawToken)) {
        const res = await sendForgotPasswordEmail(user.email, rawToken);
        console.log("sent", res.data, res.error);
      }

      return reply.send({
        message: "If an account exists, a password reset email has been sent.",
        resetUrl,
      });
    }
  );
};

export default forgotPasswordRoute;

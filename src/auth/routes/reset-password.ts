import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import crypto from "crypto";
import { hash } from "argon2";
import { hashPassword } from "../utils/password.js";
import { sendPasswordResetConfirmationEmail } from "../../emails/sendPasswordResetConfirmationEmail.js";

const resetPasswordSchema = z.object({
  token: z.string().min(10),
  newPassword: z.string().min(8),
});

const resetPasswordRoute: FastifyPluginAsync = async (fastify) => {
  fastify.post(
    "/reset-password",
    {
      schema: {
        body: {
          type: "object",
        },
      },
    },
    async (request, reply) => {
      const body = request.body as any;
      const { token, newPassword } = resetPasswordSchema.parse(body);
      // 1. Hash token so it matches DB
      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

      // 2. Find token record
      const tokenRecord = await fastify.prisma.passwordResetToken.findFirst({
        where: {
          tokenHash,
        },
      });

      if (!tokenRecord) {
        throw fastify.httpErrors.badRequest("Invalid or expired token.");
      }

      // 3. Check expiry
      if (tokenRecord.expiresAt < new Date()) {
        // Delete expired token
        await fastify.prisma.passwordResetToken.delete({
          where: {
            id: tokenRecord.id,
          },
        });

        throw fastify.httpErrors.badRequest("Token has expired.");
      }

      // 4. Update user password
      const hashedPassword = await hashPassword(newPassword);

      const user = await fastify.prisma.user.update({
        where: { id: tokenRecord.userId },
        data: { password: hashedPassword },
      });

      // 5. Delete token after use
      await fastify.prisma.passwordResetToken.delete({
        where: { id: tokenRecord.id },
      });

      if (user.email) {
        const res = await sendPasswordResetConfirmationEmail(user.email);
        console.log("sent", res.data, res.error);
      }

      return reply.send({
        message: "Password has been reset successfully.",
      });
    }
  );
};

export default resetPasswordRoute;

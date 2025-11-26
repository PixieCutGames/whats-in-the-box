import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { hashPassword } from "../utils/password.js";
import * as crypto from "crypto";
import { sendVerificationEmail } from "../../emails/sendVerificationEmail.js";

const schema = z.object({
  email: z.email(),
  password: z.string().min(8),
  name: z.string().optional(),
});

const registerRoute: FastifyPluginAsync = async (fastify) => {
  fastify.post(
    "/register",
    {
      schema: {
        body: {
          type: "object",
        },
      },
    },
    async (request, reply) => {
      const body = request.body as any;
      const parsed: any = (fastify.userSchema ?? schema).parse(body);

      const existing = await fastify.prisma.user.findUnique({
        where: { email: parsed.email },
      });
      if (existing) {
        throw fastify.httpErrors.conflict("Email already in use");
      }

      let token: string | undefined;
      let date: Date | undefined;
      if (fastify.requireValidation) {
        token = crypto.randomBytes(32).toString("hex");
        date = new Date();
        date.setDate(date.getDate() + 1);
      }

      const hashed = await hashPassword(parsed.password);

      const user = await fastify.prisma.user.create({
        data: {
          email: parsed.email,
          password: hashed,
          name: parsed.name,
          isVerified: !fastify.requireValidation,
          verificationToken: token,
          verificationExpiresAt: date,
        },
      });

      let verificationLink: string | undefined;
      if (fastify.requireValidation && token) {
        verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
        const res = await sendVerificationEmail(user.email, token);
        console.log("sent", res.data, res.error);
      }

      reply.send({
        user: { id: user.id, email: user.email, name: user.name },
        verificationToken: token,
        verificationLink,
      });
    }
  );
};

export default registerRoute;

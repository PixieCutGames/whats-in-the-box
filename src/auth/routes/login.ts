import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { verifyPassword } from "../utils/password.js";

const schema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const loginRoute: FastifyPluginAsync = async (fastify, opts) => {
  fastify.post("/login", async (request, reply) => {
    const body = request.body as any;
    const parsed = schema.parse(body);

    const user = await fastify.prisma.user.findUnique({
      where: { email: parsed.email },
    });
    if (!user)
      return reply.status(401).send({ message: "Invalid credentials" });

    const ok = await verifyPassword(user.password, parsed.password);
    if (!ok) return reply.status(401).send({ message: "Invalid credentials" });

    const accessToken = fastify.jwt.sign(
      { sub: user.id },
      { expiresIn: "15m" }
    );
    const refreshToken = fastify.jwt.sign(
      { sub: user.id },
      { expiresIn: "30d" }
    );

    reply.send({
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, name: user.name },
    });
  });
};

export default loginRoute;

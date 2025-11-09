import { FastifyPluginAsync } from "fastify";
import { z } from "zod";

const schema = z.object({
  email: z.email().optional(),
  name: z.string().optional(),
});

const getSchema = (
  userSchema?: z.ZodObject<z.core.$ZodLooseShape, z.core.$strip> | undefined
) => {
  if (!userSchema) return schema;
  return userSchema.omit({ password: true }).partial();
};

const updateUserRoute: FastifyPluginAsync = async (fastify, opts) => {
  fastify.patch(
    "/update",
    {
      preHandler: fastify.authenticate,
      schema: {
        body: {
          type: "object",
        },
      },
    },
    async (request, reply) => {
      const body = request.body as any;
      const userSchema = getSchema(fastify.userSchema);
      const parsed: any = userSchema.parse(body);

      const userId = request.user.sub;
      try {
        const user = await fastify.prisma.user.findUnique({
          where: { id: userId },
        });

        if (!user) {
          return reply.code(404).send({ error: "User not found" });
        }

        const updatedUser = await fastify.prisma.user.update({
          where: { id: userId },
          data: { ...parsed },
          omit: {
            password: true,
          },
        });

        return reply.send({
          user: updatedUser,
        });
      } catch (err) {
        console.log(err);
        return reply.code(500).send({ error: "Internal server error" });
      }
    }
  );
};

export default updateUserRoute;

import { FastifyPluginAsync } from "fastify";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  imageUrl: z.url().optional().nullable(),
});

const updateRoute: FastifyPluginAsync = async (fastify) => {
  fastify.patch(
    "/:id",
    {
      schema: {
        body: {
          type: "object",
        },
      },
      preHandler: fastify.authenticate,
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const userId = request.user.sub;
      const body = request.body as any;
      const parsed: any = updateSchema.parse(body);

      if (!userId) return reply.code(404).send({ error: "Unauthorized" });

      try {
        const existing = await fastify.prisma.container.findFirst({
          where: { id, userId },
        });

        if (!existing) {
          return reply.code(404).send({ message: "Container not found." });
        }

        const updated = await fastify.prisma.container.update({
          where: { id },
          data: parsed,
        });

        return { container: updated };
      } catch (error) {
        console.log(error);
        return reply.code(500).send({ error: "Internal server error" });
      }
    }
  );
};

export default updateRoute;

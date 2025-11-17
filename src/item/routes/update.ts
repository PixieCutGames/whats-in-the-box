import { FastifyPluginAsync } from "fastify";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  imageId: z.string().optional().nullable(),
  quantity: z.number(),
  containerId: z.string(),
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
      const parsed = updateSchema.parse(body);

      if (!userId) return reply.code(404).send({ error: "Unauthorized" });

      try {
        const existing = await fastify.prisma.item.findFirst({
          where: { id, userId },
        });

        if (!existing) {
          return reply.code(404).send({ message: "Item not found." });
        }

        const updated = await fastify.prisma.item.update({
          where: { id },
          data: parsed,
        });

        // TODO: replace old image with a new one and delete the old one

        return { item: updated };
      } catch (error) {
        console.log(error);
        return reply.code(500).send({ error: "Internal server error" });
      }
    }
  );
};

export default updateRoute;

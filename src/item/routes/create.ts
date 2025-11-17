import { FastifyPluginAsync } from "fastify";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  imageId: z.string().optional().nullable(),
  quantity: z.number(),
  containerId: z.string(),
});

const createRoute: FastifyPluginAsync = async (fastify) => {
  fastify.post(
    "/",
    {
      schema: {
        body: {
          type: "object",
        },
      },
      preHandler: fastify.authenticate,
    },
    async (request, reply) => {
      const userId = request.user.sub;
      const body = request.body as any;
      const parsed = createSchema.parse(body);

      if (!userId) return reply.code(404).send({ error: "Unauthorized" });

      try {
        const item = await fastify.prisma.item.create({
          data: {
            ...parsed,
            userId,
          },
        });

        return reply.code(201).send({ item });
      } catch (error) {
        console.log(error);
        return reply.code(500).send({ error: "Internal server error" });
      }
    }
  );
};

export default createRoute;

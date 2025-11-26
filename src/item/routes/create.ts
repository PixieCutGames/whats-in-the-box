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

      if (!userId) throw fastify.httpErrors.unauthorized("Unauthorized");

      const item = await fastify.prisma.item.create({
        data: {
          ...parsed,
          userId,
        },
        include: {
          container: {
            select: {
              name: true,
              id: true,
            },
          },
        },
      });

      try {
        await fastify.prisma.activity.create({
          data: {
            userId,
            type: "item_created",
            message: `Added "${parsed.name}" to ${item.container.name}`,
            metadata: {
              itemId: item.id,
              containerId: parsed.containerId,
            },
          },
        });
      } catch (error) {
        console.log('ERROR: COULDN"T SAVE ACTIVITY', error);
      }

      return reply.code(201).send({ item });
    }
  );
};

export default createRoute;

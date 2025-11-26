import { FastifyPluginAsync } from "fastify";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  location: z.string().optional(),
  imageId: z.string().nullable().optional(),
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

      const container = await fastify.prisma.container.create({
        data: {
          ...parsed,
          userId,
        },
      });

      try {
        await fastify.prisma.activity.create({
          data: {
            userId,
            type: "container_created",
            message: `Added "${parsed.name}"`,
            metadata: {
              containerId: container.id,
            },
          },
        });
      } catch (error) {
        console.log('ERROR: COULDN"T SAVE ACTIVITY', error);
      }

      return reply.code(201).send({ container });
    }
  );
};

export default createRoute;

import { FastifyPluginAsync } from "fastify";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  imageId: z.string().optional().nullable(),
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

      if (!userId) throw fastify.httpErrors.unauthorized("Unauthorized");

      const existing = await fastify.prisma.container.findFirst({
        where: { id, userId },
      });

      if (!existing) {
        throw fastify.httpErrors.notFound("Container not found");
      }

      const updated = await fastify.prisma.container.update({
        where: { id },
        data: parsed,
      });

      // TODO: replace old image with a new one and delete the old one

      try {
        await fastify.prisma.activity.create({
          data: {
            userId,
            type: "container_updated",
            message: `Updated "${parsed.name}"`,
            metadata: {
              containerId: id,
            },
          },
        });
      } catch (error) {
        console.log('ERROR: COULDN"T SAVE ACTIVITY', error);
      }

      return reply.send({ container: updated });
    }
  );
};

export default updateRoute;

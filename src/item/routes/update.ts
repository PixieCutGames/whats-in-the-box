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

      if (!userId) throw fastify.httpErrors.unauthorized("Unauthorized");

      const existing = await fastify.prisma.item.findFirst({
        where: { id, userId },
      });

      if (!existing) {
        throw fastify.httpErrors.notFound("Item not found.");
      }

      const updated = await fastify.prisma.item.update({
        where: { id },
        data: parsed,
        include: {
          container: {
            select: {
              name: true,
              id: true,
              imageId: true,
            },
          },
        },
      });

      // TODO: replace old image with a new one and delete the old one

      try {
        await fastify.prisma.activity.create({
          data: {
            userId,
            type: "item_updated",
            message: `Updated "${parsed.name}"`,
            metadata: {
              containerId: parsed.containerId,
              itemId: id,
            },
          },
        });
      } catch (error) {
        console.log('ERROR: COULDN"T SAVE ACTIVITY', error);
      }

      return reply.send({
        item: {
          ...updated,
          imageUrl: updated.imageId
            ? `${process.env.CLOUDINARY_IMAGE_URL}${updated.imageId}`
            : null,
          container: {
            ...updated.container,
            imageUrl: updated.container.imageId
              ? `${process.env.CLOUDINARY_IMAGE_URL}${updated.container.imageId}`
              : null,
          },
        },
      });
    }
  );
};

export default updateRoute;

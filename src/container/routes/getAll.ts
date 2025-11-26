import { FastifyPluginAsync } from "fastify";

const getAllRoute: FastifyPluginAsync = async (fastify, opts) => {
  fastify.get(
    "/:limit",
    { preHandler: fastify.authenticate },
    async (request, reply) => {
      const { limit } = request.params as { limit: string | undefined };
      const userId = request.user.sub;
      if (!userId) throw fastify.httpErrors.unauthorized("Unauthorized");

      const containers = await fastify.prisma.container.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        include: {
          _count: {
            select: { items: true },
          },
        },
        take: limit ? Number(limit) : undefined,
      });

      return reply.send({
        containers: containers.map((c: any) => ({
          ...c,
          itemsCount: c._count.items,
          _count: undefined,
          imageUrl: c.imageId
            ? `${process.env.CLOUDINARY_IMAGE_URL}${c.imageId}`
            : null,
        })),
      });
    }
  );
};

export default getAllRoute;

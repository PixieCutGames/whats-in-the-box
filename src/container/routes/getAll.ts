import { FastifyPluginAsync } from "fastify";

const getAllRoute: FastifyPluginAsync = async (fastify, opts) => {
  fastify.get(
    "/",
    { preHandler: fastify.authenticate },
    async (request, reply) => {
      const userId = request.user.sub;
      if (!userId) return reply.code(404).send({ error: "Unauthorized" });

      const containers = await fastify.prisma.container.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { items: true },
          },
        },
      });

      return {
        containers: containers.map((c: any) => ({
          ...c,
          itemsCount: c._count.items,
          _count: undefined,
          imageUrl: c.imageId
            ? `${process.env.CLOUDINARY_IMAGE_URL}${c.imageId}`
            : null,
        })),
      };
    }
  );
};

export default getAllRoute;

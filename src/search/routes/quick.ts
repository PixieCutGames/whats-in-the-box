import { FastifyPluginAsync } from "fastify";
import { z } from "zod";

const quickSearchSchema = z.object({
  query: z.string().min(3),
});

const quickRoute: FastifyPluginAsync = async (fastify, opts) => {
  fastify.get(
    "/:query",
    { preHandler: fastify.authenticate },
    async (request, reply) => {
      const userId = request.user.sub;
      if (!userId) return reply.code(404).send({ error: "Unauthorized" });

      const body = request.params as { query: string };
      const { query } = quickSearchSchema.parse({ query: body.query });

      const result = await fastify.prisma.$transaction(async (tx: any) => {
        // SEARCH CONTAINERS
        const containers = await tx.container.findMany({
          where: {
            userId,
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { location: { contains: query, mode: "insensitive" } },
            ],
          },
          take: 5,
          orderBy: { updatedAt: "desc" },
        });

        // SEARCH ITEMS
        const items = await tx.item.findMany({
          where: {
            userId,
            OR: [{ name: { contains: query, mode: "insensitive" } }],
          },
          take: 5,
          orderBy: { updatedAt: "desc" },
          include: {
            container: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });

        return { containers, items };
      });

      return result;
    }
  );
};

export default quickRoute;

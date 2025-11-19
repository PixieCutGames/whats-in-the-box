import { FastifyPluginAsync } from "fastify";
import { z } from "zod";

const advancedSearchSchema = z.object({
  query: z.string().optional(),
  type: z.enum(["container", "item", "all"]).default("all"),
  updatedFrom: z.string().optional(),
  updatedTo: z.string().optional(),
  sortBy: z.enum(["updatedAt", "relevance"]).default("updatedAt"),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(20),
});

const advancedRoute: FastifyPluginAsync = async (fastify, opts) => {
  fastify.get(
    "/",
    { preHandler: fastify.authenticate },
    async (request, reply) => {
      const userId = request.user.sub;
      if (!userId) return reply.code(404).send({ error: "Unauthorized" });

      const {
        query,
        type,
        updatedFrom,
        updatedTo,
        sortBy,
        sortDir,
        page,
        limit,
      } = advancedSearchSchema.parse(request.query);

      const dateFilter: any = {};
      if (updatedFrom) dateFilter.gte = new Date(updatedFrom);
      if (updatedTo) dateFilter.lte = new Date(updatedTo);

      const textFilter = query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              //   { location: { contains: query, mode: "insensitive" } },
              // TODO: to add agian later after designing the grid and list cards in the FE
            ],
          }
        : {};

      const itemTextFilter = query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              //   { description: { contains: query, mode: "insensitive" } },
              //   { tags: { has: query.toLowerCase() } },
            ],
          }
        : {};

      const skip = (page - 1) * limit;

      const orderBy =
        sortBy === "updatedAt" ? { updatedAt: sortDir } : undefined;

      const result = await fastify.prisma.$transaction(async (tx: any) => {
        // 1. Fetch ALL results (no pagination yet)
        let containers = [];
        let items = [];

        if (type === "container" || type === "all") {
          containers = await tx.container.findMany({
            where: {
              userId,
              AND: [
                textFilter,
                updatedFrom || updatedTo ? { updatedAt: dateFilter } : {},
              ],
            },
            skip,
            take: limit,
            orderBy,
            include: {
              _count: {
                select: { items: true },
              },
            },
          });
        }

        // --- SEARCH ITEMS ---
        if (type === "item" || type === "all") {
          items = await tx.item.findMany({
            where: {
              userId,
              AND: [
                itemTextFilter,
                updatedFrom || updatedTo ? { updatedAt: dateFilter } : {},
              ],
            },
            skip,
            take: limit,
            orderBy,
            include: {
              container: {
                select: { id: true, name: true },
              },
            },
          });
        }

        return {
          containers: containers.map((c: any) => ({
            ...c,
            itemsCount: c._count.items,
            _count: undefined,
            imageUrl: c.imageId
              ? `${process.env.CLOUDINARY_IMAGE_URL}${c.imageId}`
              : null,
          })),
          items: items.map((c: any) => ({
            ...c,
            imageUrl: c.imageId
              ? `${process.env.CLOUDINARY_IMAGE_URL}${c.imageId}`
              : null,
          })),
        };
      });

      return result;
    }
  );
};

export default advancedRoute;

import { FastifyPluginAsync } from "fastify";
import cloudinary from "../../lib/cloudinary.js";

const uploadRoute: FastifyPluginAsync = async (fastify) => {
  fastify.post(
    "/upload",
    {
      preHandler: fastify.authenticate,
    },
    async (request, reply) => {
      const userId = request.user.sub;

      if (!userId) throw fastify.httpErrors.unauthorized("Unauthorized");

      const data = await request.file();

      if (!data) {
        throw fastify.httpErrors.badRequest("No file uploaded");
      }

      // convert file to buffer
      const buffer = await data.toBuffer();

      // upload to Cloudinary
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: `witb/${userId}`, // each user gets own folder
              resource_type: "image",
              transformation: [{ quality: "auto", fetch_format: "auto" }],
            },
            (err, result) => {
              if (err) return reject(err);
              resolve(result);
            }
          )
          .end(buffer);
      });

      const result = uploadResult as any;

      return reply.send({
        publicId: result.public_id,
        url: result.secure_url,
        width: result.width,
        height: result.height,
      });
    }
  );
};

export default uploadRoute;

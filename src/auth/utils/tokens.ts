import { FastifyInstance } from "fastify";

export const signAccessToken = (
  fastify: FastifyInstance,
  payload: string | object | Buffer
) => {
  return fastify.jwt.sign(payload, { expiresIn: "15m" });
};

export const signRefreshToken = (
  fastify: FastifyInstance,
  payload: string | object | Buffer
) => {
  return fastify.jwt.sign(payload, { expiresIn: "30d" });
};

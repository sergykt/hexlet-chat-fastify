// @ts-check

import fastifySocketIo from 'fastify-socket.io';
import fastifyStatic from '@fastify/static';
import fastifyJWT from '@fastify/jwt';
import HttpErrors from 'http-errors';
import cors from '@fastify/cors';

import addRoutes from './routes.js';

const { Unauthorized } = HttpErrors;

const setUpStaticAssets = (app, buildPath) => {
  app.register(fastifyStatic, {
    root: buildPath,
  });

  app.setNotFoundHandler((req, res) => {
    res.sendFile('index.html');
  });
};

const setUpAuth = (app) => {
  // TODO add socket auth
  app
    .register(fastifyJWT, {
      secret: 'supersecret',
    })
    .decorate('authenticate', async (req, reply) => {
      try {
        await req.jwtVerify();
      } catch (_err) {
        reply.send(new Unauthorized());
      }
    });
};

export default async (app, options = { staticPath: 'build' }) => {
  setUpAuth(app);
  setUpStaticAssets(app, options.staticPath);

  const allowedOrigins = ['https://hexlet-chat-eight.vercel.app', 'http://localhost:3000'];

  app.register(cors, {
    origin: allowedOrigins,
  });

  await app.register(fastifySocketIo, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    },
  });
  addRoutes(app, options?.state || {});

  return app;
};

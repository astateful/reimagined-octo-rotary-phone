import Koa from 'koa';
import cors from '@koa/cors';
import http from 'http';

import Router from '@koa/router';

import routers from './routers/index.js';

const errorHandler = (koa) => {
  koa.on('error', (e) => console.error(e));

  return async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      ctx.status = err.status || 500;
      ctx.body = err.message;

      ctx.app.emit('error', err, ctx);
    }
  };
};

const loader = (dataDir, mimeTypes) => {
  const router = new Router({ prefix: '/v1' });
  router.use('/files', routers.files(dataDir, mimeTypes).routes());

  const corsOptions = {
    origin(ctx) {
      return ctx.get('Origin') || '*';
    },
  };

  const koa = new Koa();
  koa.use(errorHandler(koa));
  koa.use(cors(corsOptions));
  koa.use(router.routes());

  return http.createServer(koa.callback());
};

export default loader;

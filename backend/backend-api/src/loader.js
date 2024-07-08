import Koa from 'koa';
import cors from '@koa/cors';
import http from 'http';

import Router from '@koa/router';

import routers from './routers/index.js';

const loader = () => {
  const router = new Router({ prefix: '/v1' });
  router.use('/files', routers.files().routes());

  const koa = new Koa();
  koa.use(
    cors({
      origin(ctx) {
        return ctx.get('Origin') || '*';
      },
    })
  );
  koa.use(router.routes());

  return http.createServer(koa.callback());
};

export default loader;

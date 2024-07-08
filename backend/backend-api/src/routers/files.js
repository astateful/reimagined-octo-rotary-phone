import Router from '@koa/router';
import { promises as fs } from 'fs';
import multer from '@koa/multer';
import path from 'path';
import syncFs from 'fs';

const upload = multer();

const route = () => {
  const router = new Router();

  const dataDir = path.join(process.cwd(), '..', '..', 'data');
  const filesDir = path.join(dataDir, 'files');
  const metadataDir = path.join(dataDir, 'metadata');

  // TODO: move this logic to a configuration layer, as it is blocking
  if (!syncFs.existsSync(dataDir)) syncFs.mkdirSync(dataDir);
  if (!syncFs.existsSync(filesDir)) syncFs.mkdirSync(filesDir);
  if (!syncFs.existsSync(metadataDir)) syncFs.mkdirSync(metadataDir);

  router.post('/', upload.single('file'), async (ctx) => {
    await fs.writeFile(
      path.join(filesDir, ctx.file.originalname),
      ctx.file.buffer
    );

    const metadata = {
      originalname: ctx.file.originalname,
      mimetype: ctx.file.mimetype,
      size: ctx.file.size,
    };

    await fs.writeFile(
      path.join(metadataDir, `${ctx.file.originalname}.metadata.json`),
      JSON.stringify(metadata)
    );

    ctx.body = { result: metadata };
  });

  router.get('/', async (ctx) => {
    const filenames = await fs.readdir(metadataDir);

    const result = await Promise.all(
      filenames.map((filename) =>
        fs.readFile(path.join(metadataDir, filename), 'utf-8').then(JSON.parse)
      )
    );

    ctx.body = { result };
  });

  router.get('/view/:originalname', async (ctx) => {
    const result = await fs.readFile(
      path.join(filesDir, ctx.params.originalname)
    );

    const metadataFilename = `${ctx.params.originalname}.metadata.json`;
    const metadatPath = path.join(metadataDir, metadataFilename);

    const metadata = await fs.readFile(metadatPath, 'utf-8').then(JSON.parse);

    ctx.response.set('content-type', metadata.mimetype);
    ctx.response.body = result;
  });

  return router;
};

export default route;

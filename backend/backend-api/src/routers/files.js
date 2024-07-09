import Router from '@koa/router';
import { promises as fs } from 'fs';
import multer from '@koa/multer';
import path from 'path';
import syncFs from 'fs';

const upload = multer();

function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function makeOcrResponse(value) {
  if (value < 50) {
    return { error: { code: 200, message: 'The data could not read.' } };
  }

  return { result: 'This is read data' };
}

const route = (dataDir, mimeTypes) => {
  const router = new Router();

  const filesDir = path.join(dataDir, 'files');
  const metadataDir = path.join(dataDir, 'metadata');
  const ocrDir = path.join(dataDir, 'ocr');

  // TODO: move this logic to a configuration layer, as it is blocking
  if (!syncFs.existsSync(dataDir)) syncFs.mkdirSync(dataDir);
  if (!syncFs.existsSync(filesDir)) syncFs.mkdirSync(filesDir);
  if (!syncFs.existsSync(metadataDir)) syncFs.mkdirSync(metadataDir);
  if (!syncFs.existsSync(ocrDir)) syncFs.mkdirSync(ocrDir);

  router.post('/', upload.single('file'), async (ctx) => {
    const metadata = {
      originalname: ctx.file.originalname,
      mimetype: ctx.file.mimetype,
      size: ctx.file.size,
    };

    if (!mimeTypes.includes(metadata.mimetype)) {
      const error = new Error('Unsupported mime type');
      error.status = 400;

      throw error;
    }

    await fs.writeFile(
      path.join(filesDir, ctx.file.originalname),
      ctx.file.buffer
    );

    await fs.writeFile(
      path.join(metadataDir, `${ctx.file.originalname}.metadata.json`),
      JSON.stringify(metadata)
    );

    const randomValue = randomIntFromInterval(0, 100);
    const ocr = makeOcrResponse(randomValue);

    await fs.writeFile(
      path.join(ocrDir, `${ctx.file.originalname}.ocr.json`),
      JSON.stringify(ocr)
    );

    ctx.body = { result: { metadata, ocr } };
  });

  router.get('/', async (ctx) => {
    const filenames = await fs.readdir(filesDir);

    const result = await Promise.all(
      filenames.map(async (filename) => {
        const metadataFilename = `${filename}.metadata.json`;
        const metadataPath = path.join(metadataDir, metadataFilename);

        const metadata = await fs
          .readFile(metadataPath, 'utf-8')
          .then(JSON.parse);

        const ocrFilename = `${filename}.ocr.json`;
        const ocrPath = path.join(ocrDir, ocrFilename);

        const ocr = await fs.readFile(ocrPath, 'utf-8').then(JSON.parse);

        return { metadata, ocr };
      })
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

  router.get('/mimeTypes', async (ctx) => {
    ctx.body = { result: mimeTypes };
  });

  return router;
};

export default route;

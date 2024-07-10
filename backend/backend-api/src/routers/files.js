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

const route = (dataDir, mimeTypes, maxSize) => {
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

    if (ctx.file.size > maxSize) {
      const error = new Error('Unsupported file size');
      error.status = 400;

      throw error;
    }

    if (!mimeTypes.includes(metadata.mimetype)) {
      const error = new Error('Unsupported mime type');
      error.status = 400;

      throw error;
    }

    const randomValue = randomIntFromInterval(0, 100);
    const ocr = makeOcrResponse(randomValue);

    const filePath = path.join(filesDir, ctx.file.originalname);
    const ocrPath = path.join(ocrDir, `${ctx.file.originalname}.json`);
    const metadataPath = path.join(
      metadataDir,
      `${ctx.file.originalname}.json`
    );

    await fs.writeFile(filePath, ctx.file.buffer);
    await fs.writeFile(metadataPath, JSON.stringify(metadata));
    await fs.writeFile(ocrPath, JSON.stringify(ocr));

    ctx.body = { result: { metadata, ocr } };
  });

  router.get('/', async (ctx) => {
    const filenames = await fs.readdir(filesDir);

    const result = await Promise.all(
      filenames.map(async (filename) => {
        const metadataFilename = `${filename}.json`;
        const metadataPath = path.join(metadataDir, metadataFilename);
        const metadata = await fs
          .readFile(metadataPath, 'utf-8')
          .then(JSON.parse);

        const ocrFilename = `${filename}.json`;
        const ocrPath = path.join(ocrDir, ocrFilename);
        const ocr = await fs.readFile(ocrPath, 'utf-8').then(JSON.parse);

        return { metadata, ocr };
      })
    );

    ctx.body = { result };
  });

  router.delete('/:originalname', async (ctx) => {
    const { originalname } = ctx.params;

    const filePath = path.join(filesDir, originalname);

    const metadataFilename = `${originalname}.json`;
    const metadataPath = path.join(metadataDir, metadataFilename);

    const ocrFilename = `${originalname}.json`;
    const ocrPath = path.join(ocrDir, ocrFilename);

    await fs.unlink(metadataPath);
    await fs.unlink(ocrPath);
    await fs.unlink(filePath);

    ctx.body = { result: true };
  });

  router.get('/view/:originalname', async (ctx) => {
    const filePath = path.join(filesDir, ctx.params.originalname);

    const metadataFilename = `${ctx.params.originalname}.json`;
    const metadataPath = path.join(metadataDir, metadataFilename);

    const metadata = await fs.readFile(metadataPath, 'utf-8').then(JSON.parse);
    const result = await fs.readFile(filePath);

    ctx.response.set('content-type', metadata.mimetype);
    ctx.response.body = result;
  });

  router.get('/mimeTypes', async (ctx) => {
    ctx.body = { result: mimeTypes };
  });

  return router;
};

export default route;

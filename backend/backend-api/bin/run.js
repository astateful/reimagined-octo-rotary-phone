import loader from '../src/index.js';
import path from 'path';

(async () => {
  const maxSize = 1440000;
  const mimeTypes = ['image/jpg', 'image/jpeg'];
  const dataDir = path.join(process.cwd(), '..', '..', 'data');

  const server = loader(dataDir, mimeTypes, maxSize, console.error);

  server.listen(3010, () => {
    console.log('listening on 3010');
  });
})();

import loader from '../src/index.js';
import path from 'path';

(async () => {
  const dataDir = path.join(process.cwd(), '..', '..', 'data');

  const server = loader(dataDir);

  server.listen(3010, () => {
    console.log('listening on 3010');
  });
})();

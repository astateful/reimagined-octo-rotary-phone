import loader from '../src/index.js';

(async () => {
  const server = loader();
  server.listen(3010, () => {
    console.log('listening on 3010');
  });
})();

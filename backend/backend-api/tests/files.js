import path, { sep } from 'path';
import FormData from 'form-data';
import concat from 'concat-stream';
import fs from 'fs';
import onFinished from 'on-finished';
import os from 'os';
import test from 'ava';

import server from '../src/index.js';

const listen = (url, loader) =>
  Promise.resolve(loader).then(
    (server) =>
      new Promise((resolve, reject) =>
        server
          .listen(url.port)
          .once('listening', resolve(server))
          .once('error', reject)
      )
  );

const file = (name) => {
  return fs.createReadStream(path.join(process.cwd(), 'test-data', name));
};

function submitForm(form, url) {
  const req = form.submit(url);

  return new Promise((resolve, reject) => {
    req.on('error', reject);
    req.on('response', (res) => {
      res.on('error', reject);
      res.pipe(
        concat({ encoding: 'buffer' }, (body) => {
          onFinished(req, () => {
            resolve(body);
          });
        })
      );
    });
  });
}

test.before('setup', async (t) => {
  const outputPath = await fs.promises.mkdtemp(`${os.tmpdir()}${sep}`);

  const mimeTypes = ['image/png'];

  const backendPort = 50012;
  const backendUrl = new URL(`http://0.0.0.0:${backendPort}`);
  const backendServer = await listen(backendUrl, server(outputPath, mimeTypes));

  t.context.backendUrl = backendUrl;
  t.context.backendServer = backendServer;
});

test('mime types', async (t) => {
  const { backendUrl } = t.context;

  const response = await fetch(new URL('/v1/files/mimeTypes', backendUrl));
  const { result } = await response.json();

  t.is(result.length, 1);
  t.is(result[0], 'image/png');
});

test('files, success', async (t) => {
  const { backendUrl } = t.context;

  const form = new FormData();
  form.append('file', file('test.png'));

  const url = new URL('/v1/files', backendUrl);

  const rawPostResponse = await submitForm(form, url);

  const postResponse = JSON.parse(rawPostResponse.toString());
  t.is(postResponse.result.metadata.originalname, 'test.png');
  t.is(postResponse.result.metadata.mimetype, 'image/png');

  const rawGetResponse = await fetch(url);

  const getResponse = await rawGetResponse.json();
  t.is(getResponse.result.length, 1);
  t.is(getResponse.result[0].metadata.originalname, 'test.png');
  t.is(getResponse.result[0].metadata.mimetype, 'image/png');

  const rawViewResponse = await fetch(
    new URL('/v1/files/view/test.png', backendUrl)
  );

  // TODO: test raw data...
  await rawViewResponse.text();

  const deletionUrl = new URL('/v1/files/test.png', backendUrl);

  const rawDeleteResponse = await fetch(deletionUrl, { method: 'delete' });
  const deleteResponse = await rawDeleteResponse.json();

  t.is(deleteResponse.result, true);
});

test('files, upload file, unsupported file type', async (t) => {
  const { backendUrl } = t.context;

  const form = new FormData();
  form.append('file', file('test.gif'));

  const url = new URL('/v1/files', backendUrl);

  const rawResponse = await submitForm(form, url);
  const response = rawResponse.toString();
  t.is(response, 'Unsupported mime type');
});

test.after.always((t) => {
  t.context.backendServer.close();
});

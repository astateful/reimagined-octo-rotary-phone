'use client';

import { useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';

import { useFiles } from '../services';

function Index() {
  const { createFile, getFiles, files } = useFiles();

  useEffect(() => {
    getFiles();
  }, [getFiles]);

  const onDrop = useCallback(
    (acceptedFiles) => {
      acceptedFiles.forEach((file) => {
        createFile(file, () => {
          // perform some OCR result...
        });
      });
    },
    [createFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/png': [], 'image/jpg': [], 'image/jpeg': [] },
    maxFiles: 1,
  });

  return (
    <div>
      <h1>AwesomeOCR</h1>
      <h2>File Upload</h2>
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <p>Drag n drop some files here, or click to select files</p>
        )}
      </div>
      <h2>Files</h2>
      <table>
        <thead>
          <tr>
            <th>Filename</th>
            <th>Data</th>
            <th>OCR Result</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => {
            return (
              <tr key={file.originalname}>
                <td>{file.originalname}</td>
                <td>
                  <img
                    src={`http://localhost:3010/v1/files/view/${file.originalname}`}
                    width={200}
                  />
                </td>
                <td>BING</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/*img.current && <img src={img.current.src} />*/}
    </div>
  );
}

export default Index;

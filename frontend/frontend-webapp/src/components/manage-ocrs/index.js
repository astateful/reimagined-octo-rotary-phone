'use client';

import { useCallback, useEffect } from 'react';
import { array } from 'prop-types';
import { useDropzone } from 'react-dropzone';

import ViewOcr from '../view-ocr';
import { useFiles } from '../../services';

const imageSrcEndpoint = (filename) =>
  `${process.env.NEXT_PUBLIC_API_URL}/files/view/${filename}`;

function ManageOcrs({ mimeTypes }) {
  const { createFile, getFiles, files } = useFiles();

  useEffect(() => {
    getFiles();
  }, [getFiles]);

  const onDrop = useCallback(
    (acceptedFiles) => {
      acceptedFiles.forEach((file) => {
        createFile(file);
      });
    },
    [createFile]
  );

  const accept = mimeTypes.reduce((acc, cur) => ({ ...acc, [cur]: [] }, {}));

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: 1,
  });

  return (
    <div style={{ width: '1000px', margin: '0 auto' }}>
      <h1>AwesomeOCR</h1>
      <h2>File Upload</h2>
      <h3>Supported File Types: {mimeTypes.join(', ')}</h3>
      <div
        {...getRootProps()}
        style={{
          border: '2px dashed #000',
          textAlign: 'center',
          cursor: 'pointer',
        }}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <p>Drag n drop some files here, or click here to select files</p>
        )}
      </div>
      <h2>Files</h2>
      <table style={{ width: '100%' }}>
        <thead>
          <tr>
            <th>Filename</th>
            <th>Data</th>
            <th>OCR Result</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => (
            <tr key={file.metadata.originalname}>
              <td>{file.metadata.originalname}</td>
              <td>
                <img
                  src={imageSrcEndpoint(file.metadata.originalname)}
                  width={200}
                />
              </td>
              <td>
                <ViewOcr ocr={file.ocr} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

ManageOcrs.propTypes = {
  mimeTypes: array.isRequired,
};

export default ManageOcrs;

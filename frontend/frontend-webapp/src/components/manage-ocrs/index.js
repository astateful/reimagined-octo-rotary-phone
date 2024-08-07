'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { array } from 'prop-types';
import { useDropzone } from 'react-dropzone';

import ViewOcr from '../view-ocr';
import styles from './styles.module.css';
import { useFiles } from '../../services';

const imageSrcEndpoint = (filename) =>
  `${process.env.NEXT_PUBLIC_API_URL}/files/view/${filename}`;

function ManageOcrs({ mimeTypes }) {
  const { createFile, getFiles, files, deleteFile, isUploading } = useFiles();

  useEffect(() => {
    getFiles();
  }, [getFiles]);

  const accept = useMemo(
    () => mimeTypes.reduce((acc, cur) => ({ ...acc, [cur]: [] }), {}),
    [mimeTypes]
  );

  const onDrop = useCallback(
    (acceptedFiles) => {
      acceptedFiles.forEach((file) => {
        const isSizeValid = file.size < 1440000;
        const isAccepted = !!accept[file.type];

        if (!isAccepted) alert(`${file.type} is not supported.`);
        else if (!isSizeValid) alert(`${file.type} is larger than 1440000.`);
        else createFile(file);
      });
    },
    [createFile, accept]
  );

  const onDelete = useCallback(
    (filename) => deleteFile(filename),
    [deleteFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: 1,
    disabled: isUploading,
  });

  return (
    <div className={styles.manageOcrs}>
      <h1>AwesomeOCR</h1>
      <h2>File Upload</h2>
      <div {...getRootProps()} className={styles.uploadArea}>
        <input {...getInputProps()} />
        {!isUploading && (
          <>
            <h3>Supported File Types: {mimeTypes.join(', ')}</h3>
            <h3>Maximum File Size: {1440000 / 1000000}MB</h3>
            {isDragActive ? (
              <p>Drop the files here ...</p>
            ) : (
              <p>Drag n drop some files here, or click here to select files</p>
            )}
          </>
        )}
        {isUploading && <p>Uploading...</p>}
      </div>
      <h2>Files</h2>
      <table className={styles.filesArea}>
        <thead>
          <tr>
            <th>Filename</th>
            <th>Data</th>
            <th>OCR Result</th>
            <th>Manage</th>
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
              <td>
                <button onClick={() => onDelete(file.metadata.originalname)}>
                  Delete
                </button>
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

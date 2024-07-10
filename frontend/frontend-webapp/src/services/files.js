import { useCallback, useMemo, useReducer } from 'react';

const initialState = { data: [], isUploading: false };

const delay = (ts) => new Promise((resolve) => setTimeout(() => resolve(), ts));

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'FILE_CREATED': {
      const i = state.data.findIndex(
        (file) =>
          file.metadata.originalname === action.data.metadata.originalname
      );

      if (i !== -1) return state;

      return { ...state, data: [...state.data, action.data] };
    }

    case 'FILE_UPLOADING': {
      return { ...state, isUploading: action.data };
    }

    case 'FILES_FETCHED': {
      return { ...state, data: action.data };
    }

    case 'FILE_DELETED': {
      const i = state.data.findIndex(
        (file) => file.metadata.originalname === action.data
      );

      if (i === -1) return state;

      const data = state.data.filter((value, index) => index !== i);

      return { ...state, data };
    }

    default: {
      return state;
    }
  }
};

const makeEndpoint = (pathname) =>
  `${process.env.NEXT_PUBLIC_API_URL}${pathname}`;

const requestor = async (pathname, options) => {
  const response = await fetch(makeEndpoint(pathname), options);

  if (response.ok) return response.json();

  if (response.status >= 400 && response.status < 500) {
    const message = await response.text();
    throw new Error(`Client Error: ${message}`);
  }

  throw new Error(`Server Error: Unknown error occurred`);
};

const useFiles = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const createFile = useCallback((file) => {
    (async () => {
      try {
        const formData = new FormData();
        formData.append('file', file);

        dispatch({ type: 'FILE_UPLOADING', data: true });

        const options = { method: 'POST', body: formData };
        const response = await requestor('/files', options);

        await delay(5000);

        dispatch({ type: 'FILE_UPLOADING', data: false });

        dispatch({ type: 'FILE_CREATED', data: response.result });
      } catch (e) {
        alert(e.message);
      }
    })();
  }, []);

  const getFiles = useCallback(() => {
    (async () => {
      try {
        const options = { method: 'GET' };
        const response = await requestor('/files', options);

        dispatch({ type: 'FILES_FETCHED', data: response.result });
      } catch (e) {
        alert(e.message);
      }
    })();
  }, []);

  const deleteFile = useCallback((filename) => {
    (async () => {
      try {
        const options = { method: 'DELETE' };
        await requestor(`/files/${filename}`, options);

        dispatch({ type: 'FILE_DELETED', data: filename });
      } catch (e) {
        alert(e.message);
      }
    })();
  }, []);

  return useMemo(
    () => ({
      createFile,
      getFiles,
      deleteFile,
      files: state.data,
      isUploading: state.isUploading,
    }),
    [createFile, getFiles, deleteFile, state.data, state.isUploading]
  );
};

export default useFiles;

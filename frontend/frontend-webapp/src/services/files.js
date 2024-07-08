import { useCallback, useReducer } from 'react';

const initialState = { data: [] };

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'FILE_CREATED': {
      return { ...state, data: [...state.data, action.data] };
    }

    case 'FILES_FETCHED': {
      return { ...state, data: action.data };
    }

    default: {
      return state;
    }
  }
};

const useFiles = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const createFile = useCallback((file, cb) => {
    (async () => {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('http://localhost:3010/v1/files', {
          method: 'POST',
          body: formData,
        });

        const { result } = await response.json();

        dispatch({ type: 'FILE_CREATED', data: result });

        cb(result);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const getFiles = useCallback(() => {
    (async () => {
      try {
        const response = await fetch('http://localhost:3010/v1/files', {
          method: 'GET',
        });

        const { result } = await response.json();

        dispatch({ type: 'FILES_FETCHED', data: result });
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  return { createFile, getFiles, files: state.data };
};

export default useFiles;

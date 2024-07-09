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

        const options = { method: 'POST', body: formData };
        const response = await requestor('/files', options);

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

  return { createFile, getFiles, files: state.data };
};

export default useFiles;

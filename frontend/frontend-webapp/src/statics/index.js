const makeEndpoint = (pathname) =>
  `${process.env.NEXT_PUBLIC_API_URL}${pathname}`;

const getMimeTypes = async () => {
  const response = await fetch(makeEndpoint('/files/mimeTypes'));

  const { result } = await response.json();
  return result;
};

export { getMimeTypes };

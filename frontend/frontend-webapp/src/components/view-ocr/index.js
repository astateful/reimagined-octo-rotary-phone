import { object } from 'prop-types';

function ViewOcr({ ocr }) {
  if (ocr.error) return <div>Error: {ocr.error.message}</div>;
  return <div>{ocr.result}</div>;
}

ViewOcr.propTypes = {
  ocr: object,
};

export default ViewOcr;

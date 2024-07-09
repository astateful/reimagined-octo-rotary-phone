import './layout.css';

import { node } from 'prop-types';

export const metadata = {
  title: 'AwesomeOCR',
  description: 'AwesineOCR is an OCR Manager',
};

function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

RootLayout.propTypes = {
  children: node.isRequired,
};

export default RootLayout;

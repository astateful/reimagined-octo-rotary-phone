import ManageOcrs from '../components/manage-ocrs';

import { getMimeTypes } from '../statics';

async function Index() {
  const mimeTypes = await getMimeTypes();

  return <ManageOcrs mimeTypes={mimeTypes} />;
}

export default Index;

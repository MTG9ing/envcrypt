// envcrypt Express.js TypeScript snippet
// Add this at the very top of your entry file

import { decryptToEnv } from 'envcrypt';

(async () => {
  await decryptToEnv();
  // process.env is now populated with your encrypted variables
  
  import express from 'express';
  const app = express();
  
  // Your app code here...
  const port = process.env.API_PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
})();

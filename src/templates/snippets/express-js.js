// env-lock Express.js snippet
// Add this at the very top of your entry file (before any other imports)

const { decryptToEnv } = require('env-lock');

(async () => {
  await decryptToEnv();
  // process.env is now populated with your encrypted variables
  
  const express = require('express');
  const app = express();
  
  // Your app code here...
  const port = process.env.API_PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
})();

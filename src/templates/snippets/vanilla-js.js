// env-lock Vanilla Node.js snippet
// Add this at the very top of your entry file

const { decryptToEnv } = require('env-lock');

(async () => {
  await decryptToEnv();
  // process.env is now populated with your encrypted variables
  
  // Your code here...
  console.log('Environment loaded:', Object.keys(process.env).filter(k => !k.startsWith('npm_')));
})();

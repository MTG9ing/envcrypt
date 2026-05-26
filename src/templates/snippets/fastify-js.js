// env-lock Fastify snippet
// Add this at the very top of your entry file

import { decryptToEnv } from 'env-lock';

(async () => {
  await decryptToEnv();
  // process.env is now populated with your encrypted variables
  
  import Fastify from 'fastify';
  const fastify = Fastify({ logger: true });
  
  // Your app code here...
  const port = parseInt(process.env.API_PORT || '3000');
  await fastify.listen({ port });
})();

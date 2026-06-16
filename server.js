// need to set dns servers before importing mongoose to avoid dns resolution issues in some environments
import dns from 'node:dns';
dns.setServers(['1.1.1.1', '1.0.0.1']); 


import env from "./src/config/env.js";
import { server } from "./src/app.js";
import connectDB from "./src/config/connectDb.js";
connectDB(env.mongoUri);



server.listen(env.port, () => {
  console.log(`Server is running on port ${env.port}`);
});

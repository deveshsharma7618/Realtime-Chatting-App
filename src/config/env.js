import dotenv from 'dotenv';
dotenv.config();

if (!process.env.MONGODB_URI) {
  console.error('Warning: MONGODB_URI is not set. Please set it in the .env file.');
  process.exit(1);
}

if (!process.env.PORT) {
  console.error('Warning: PORT is not set. Please set it in the .env file.');
  process.exit(1);
}

if(!process.env.JWT_SECRET) {
  console.error('Warning: JWT_SECRET is not set. Please set it in the .env file.');
  process.exit(1);
}

if(!process.env.JWT_EXPIRES_IN) {
  console.error('Warning: JWT_EXPIRES_IN is not set. Please set it in the .env file.');
}

if(!process.env.GOOGLE_EMAIL || !process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REFRESH_TOKEN) {
  console.error('Warning: Google OAuth2 credentials are not fully set. Please set GOOGLE_EMAIL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN in the .env file.');
  process.exit(1);
}

if(!process.env.ADMIN_TOKEN) {
  console.error('Warning: ADMIN_TOKEN is not set. Please set it in the .env file.');
  process.exit(1);
}


const config = {
  port: process.env.PORT,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN, 
  adminToken: process.env.ADMIN_TOKEN,
};

export default Object.freeze(config);
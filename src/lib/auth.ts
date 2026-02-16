import { betterAuth, type Auth } from 'better-auth';
import { MongoClient } from 'mongodb';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { admin } from 'better-auth/plugins';
import 'dotenv/config';

// Validation des variables d'environnement critiques
const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/abab';
const BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET;
const FRONTEND_URLS = process.env.FRONTEND_URLS;

if (!BETTER_AUTH_SECRET) {
  throw new Error('BETTER_AUTH_SECRET is required in environment variables');
}

if (!FRONTEND_URLS) {
  throw new Error('FRONTEND_URLS is required in environment variables');
}

const allowedOrigins = FRONTEND_URLS.split(',').map((url) => url.trim());

const client = new MongoClient(MONGODB_URL);
const db = client.db();

export const auth: Auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
    transaction: false,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    autoSignIn: true,
  },
  plugins: [
    admin({
      defaultRole: 'user',
    }),
  ],
  secret: BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
  trustedOrigins: allowedOrigins,
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
      domain: 'factureproback-production.up.railway.app',
    },
    sessionCookie: {
      sameSite: 'None',
      secure: true,
      domain: 'factureproback-production.up.railway.app',
    },
  },
});

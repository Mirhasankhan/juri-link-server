import dotenv from "dotenv";
import path from "path";

const currentPath = process.cwd();

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  NODE_ENV: process.env.NODE_ENV,
  port: process.env.PORT,
  database_URL: process.env.DATABASE_URL,
  bcrypt_url: process.env.BCRYPT_SALT_ROUNDS || process.env.BCRYPT_SALT_ROUND || "10",
  forget_password_key: process.env.JWT_FORGET_KEY,
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  dashboardUrl: process.env.DASHBOARD_URL || "https://juri-link-dashboard.vercel.app",
  smtpPassword: process.env.SMTP_PASSWORD,
  smtpUserName: process.env.SMTP_USER_NAME,
  encryption_key: process.env.ENCRYPTION_KEY,
  encryption_iv: process.env.ENCRYPTION_IV,
  apiLink: process.env.API_LINK || process.env.BACKEND_BASE_URL,
  redisUrl: process.env.REDIS_URL || "redis://127.0.0.1:6379",
  doSpacesEndPoint: process.env.DO_SPACES_ENDPOINT || "https://nyc3.digitaloceanspaces.com",
  doSpacesRegion: process.env.DO_SPACES_REGION || "nyc3",
  doBucketName: process.env.DO_BUCKET_NAME || "smtech-space",
  doAccessKey: process.env.DO_ACCESS_KEY,
  doSecretKey: process.env.DO_SECRET_KEY,
  doCdnEndPoint: process.env.DO_CDN_ENDPOINT,
  emailSender: {
    email: process.env.EMAIL,
    app_pass: process.env.APP_PASS,
  },
  jwt: {
    jwt_secret: process.env.JWT_SECRET,
    gen_salt: process.env.GEN_SALT || "10",
    expires_in: process.env.EXPIRES_IN || "15d",
  },
  cloudinary: {
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
  },
  stripe: {
    stripe_secret: process.env.STRIPE_SK,
    stripe_public_key: process.env.STRIPE_PK,
    webhook_secret: process.env.STRIPE_WEBHOOK_SECRET,
  },
  zoom: {
    accountId: process.env.ZOOM_ACCOUNT_ID,
    clientId: process.env.ZOOM_CLIENT_ID,
    clientSecret: process.env.ZOOM_CLIENT_SECRET,
  },
  superAdmin: {
    adminName: process.env.SUPER_ADMIN_NAME || "Mir Hasan",
    email: process.env.SUPER_ADMIN_EMAIL || "admin@gmail.com",
    password: process.env.SUPER_ADMIN_PASSWORD || "123456",
  },
};

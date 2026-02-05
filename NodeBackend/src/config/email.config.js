import nodemailer from "nodemailer";

export const createTransporter = () => {
  const port = process.env.EMAIL_PORT
    ? parseInt(process.env.EMAIL_PORT, 10)
    : 587;
  const secure = process.env.EMAIL_SECURE === "true";

  const transportOptions = {
    host: process.env.EMAIL_HOST,
    port,
    secure,
    pool: process.env.EMAIL_POOL === "true" || false,
    auth: undefined,
  };

  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    transportOptions.auth = {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    };
  }

  // Optionally allow insecure TLS (useful for self-signed certs behind dev environments)
  if (process.env.EMAIL_TLS_REJECT_UNAUTHORIZED === "false") {
    transportOptions.tls = { rejectUnauthorized: false };
  }

  return nodemailer.createTransport(transportOptions);
};

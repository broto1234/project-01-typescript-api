const nodeEnv = process.env.NODE_ENV ?? "development";

if (!["development", "test", "production"].includes(nodeEnv)) {
  throw new Error(
    `Invalid NODE_ENV: ${nodeEnv}`
  );
}

const requiredEnv = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `${name} environment variable is not defined`
    );
  }

  return value;
};

const requiredNumberEnv = (name: string): number => {
  const value = Number(requiredEnv(name));

  if (!Number.isFinite(value)) {
    throw new Error(
      `${name} environment variable must be a valid number`
    );
  }

  return value;
};

export const env = {
  nodeEnv,
  port: (() => {
  const value = Number(process.env.PORT ?? 3000);

  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(
      "PORT environment variable must be a positive integer"
    );
  }

  return value;
})(),

  databaseUrl: requiredEnv("DATABASE_URL"),

  jwtSecret: requiredEnv("JWT_SECRET"),

  frontendUrl: requiredEnv("FRONTEND_URL"),

  refreshTokenExpiresDays:
    requiredNumberEnv("REFRESH_TOKEN_EXPIRES_DAYS"),

  bcryptSaltRounds:
    requiredNumberEnv("BCRYPT_SALT_ROUNDS"),

  passwordResetExpiresHours:
    requiredNumberEnv("PASSWORD_RESET_EXPIRES_HOURS"),

  mailHost: requiredEnv("MAIL_HOST"),

  mailPort:
    requiredNumberEnv("MAIL_PORT"),

  mailUser: requiredEnv("MAIL_USER"),

  mailPassword:
    requiredEnv("MAIL_PASSWORD"),

  mailFrom:
    requiredEnv("MAIL_FROM"),
};
const requiredEnv = (
  name: string
): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `${name} environment variable is not defined`
    );
  }

  return value;
};

export const env = {
  port: Number(process.env.PORT ?? 3000),

  databaseUrl: requiredEnv("DATABASE_URL"),

  jwtSecret: requiredEnv("JWT_SECRET"),

  frontendUrl: requiredEnv("FRONTEND_URL"),

  refreshTokenExpiresDays: Number(
    requiredEnv("REFRESH_TOKEN_EXPIRES_DAYS")
  ),

  bcryptSaltRounds: Number(
    requiredEnv("BCRYPT_SALT_ROUNDS")
  ),

  passwordResetExpiresHours: Number(
    requiredEnv("PASSWORD_RESET_EXPIRES_HOURS")
  ),

  mailHost: requiredEnv("MAIL_HOST"),

  mailPort: Number(requiredEnv("MAIL_PORT")),

  mailUser: requiredEnv("MAIL_USER"),

  mailPassword: requiredEnv("MAIL_PASSWORD"),

  mailFrom: requiredEnv("MAIL_FROM"),
};

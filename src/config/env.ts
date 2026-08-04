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
  port: Number(requiredEnv("PORT")),

  databaseUrl: requiredEnv("DATABASE_URL"),

  jwtSecret: requiredEnv("JWT_SECRET"),

  frontendUrl: requiredEnv("FRONTEND_URL"),

  refreshTokenExpiresDays: Number(
    requiredEnv("REFRESH_TOKEN_EXPIRES_DAYS")
  ),

  bcryptSaltRounds: Number(
    requiredEnv("BCRYPT_SALT_ROUNDS")
  ),
};

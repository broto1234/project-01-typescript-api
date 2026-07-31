import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFiles: [
    "<rootDir>/tests/setup.ts",
  ],
};

export default config;
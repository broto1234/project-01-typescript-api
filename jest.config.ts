import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",

  setupFilesAfterEnv: [
    "<rootDir>/tests/setup.ts",
  ],

  testPathIgnorePatterns: [
    "/node_modules/",
    "/dist/",
  ],

  maxWorkers: 1,
};

export default config;
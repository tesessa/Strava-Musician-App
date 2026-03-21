const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.json', // <-- points to your backend tsconfig
    },
  },
  roots: ['<rootDir'],
  testMatch: ['**/tests/**/*.test.ts', '**/__tests__/**/*.test.ts'],
  testPathIgnorePatterns: ['/node_modules/', '**/*.spec.ts', 'spec.ts'],
  modulePathIgnorePatterns: ['spec.ts']
  // testPathIgnorePatterns: [
  //   '/node_modules/', '/e2e/'
  // ]
};
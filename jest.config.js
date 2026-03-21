const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  roots: ['<rootDir>/apps/backend'],
  testMatch: ['**/apps/backend/**/*.test.ts'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/apps/web/',  
    '**/*.spec.ts',
    'spec.ts'
  ],
  modulePathIgnorePatterns: ['spec.ts']
};
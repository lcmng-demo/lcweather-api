/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  setupFiles: [ './src/tests/setupEnv.ts' ],
  testEnvironment: 'node',
  testPathIgnorePatterns: [ '.js' ]
};
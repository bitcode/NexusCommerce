/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  setupFilesAfterEnv: ['./jest.setup.js'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.test.json',
        isolatedModules: true,
        diagnostics: {
          ignoreCodes: [2304, 2582, 2580, 2322, 2339, 2345, 2554, 2769]
        }
      }
    ]
  },
  globals: {
    'ts-jest': {
      isolatedModules: true
    }
  }
};
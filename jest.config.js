module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/src/__tests__/**/*.ts'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
  ],
  moduleNameMapper: {
    '^rdf-js$': '<rootDir>/src/__mocks__/rdf-js.ts',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(rdf-js)/)',
  ],
};
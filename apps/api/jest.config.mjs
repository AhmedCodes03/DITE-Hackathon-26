export default {
  testEnvironment: "node",
  rootDir: "./tests",
  transform: {},
  moduleFileExtensions: ["js", "mjs"],
  testMatch: ["**/*.test.mjs"],
  testPathIgnorePatterns: ["/node_modules/"],
  setupFilesAfterEnv: ["./setup.mjs"],
  testTimeout: 15000,
  verbose: true,
  forceExit: true,
  detectOpenHandles: true,
  collectCoverageFrom: ["../src/**/*.js"],
  coverageProvider: "v8",
  coverageReporters: ["text", "html"]
};

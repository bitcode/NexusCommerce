// This file is used by Jest to set up the global environment
import '@types/jest';

// TypeScript declaration for global object
declare global {
  namespace NodeJS {
    interface Global {
      jest: any;
      describe: any;
      test: any;
      expect: any;
      beforeEach: any;
      afterEach: any;
      beforeAll: any;
      afterAll: any;
    }
  }
}

// No need to assign globals as Jest handles this automatically
// This file is just for TypeScript type declarations
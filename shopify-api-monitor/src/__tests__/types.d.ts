// This file provides type definitions for Jest globals

declare global {
  // Jest globals
  const jest: {
    fn: () => any;
    mock: (moduleName: string, factory?: () => any) => void;
    clearAllMocks: () => void;
    spyOn: (object: any, methodName: string) => any;
    setTimeout: (timeout: number) => void;
  };
  
  // Test functions
  function describe(name: string, fn: () => void): void;
  function test(name: string, fn: () => void): void;
  function expect(value: any): any;
  function beforeEach(fn: () => void): void;
  function afterEach(fn: () => void): void;
  function beforeAll(fn: () => void): void;
  function afterAll(fn: () => void): void;
}

// This export makes this file a module
export {};
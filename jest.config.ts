import type { JestConfigWithTsJest } from "ts-jest";

const jestConfig: JestConfigWithTsJest = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  testMatch: ["**/*.test.ts"],

  //* 1. Configura ts-jest para que sea capaz de procesar archivos .js también
  //* (porque la librería uuid es un archivo .js, no .ts)
  transform: {
    "^.+\\.[tj]sx?$": ["ts-jest", {
        tsconfig: {
            allowJs: true 
        }
    }]
  },

  //* 2. La Excepción: Le dice a Jest "Ignora todo en node_modules EXCEPTO uuid"
  //* Esto fuerza a Jest a transformar 'uuid' usando la regla de arriba.
  transformIgnorePatterns: [
    "node_modules/(?!(uuid)/)"
  ]
};

export default jestConfig;
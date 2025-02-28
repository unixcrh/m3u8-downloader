import { existsSync } from "node:fs";
import dotenv from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const mainResolve = (r) => resolve(__dirname, "..", r);
export const rootResolve = (r) => resolve(__dirname, "../../..", r);
const nodeEnv = process.env.NODE_ENV;
console.log("当前的环境是： ", nodeEnv);

function loadEnv(path) {
  const result = {};

  const _loadEnv = (path) => {
    if (!existsSync(path)) {
      return null;
    }

    const { error, parsed } = dotenv.config({ path });
    if (error != null) {
      return null;
    }

    Object.keys(parsed).forEach((key) => {
      result[key] = parsed[key];
    });
  };

  _loadEnv(path);
  _loadEnv(`${path}.local`);

  return result;
}

function loadDotEnv() {
  const env = loadEnv(rootResolve(".env"));
  const envMode = loadEnv(rootResolve(`.env.${nodeEnv}`));

  return { ...env, ...envMode };
}

export function loadDotEnvRuntime() {
  const env = loadDotEnv();

  Object.keys(env).forEach((key) => {
    if (!process.env[key]) {
      process.env[key] = env[key];
    }
  });
}

export function loadDotEnvDefined() {
  const env = loadDotEnv();

  return Object.keys(env).reduce((prev, cur) => {
    if (!cur.startsWith("APP_")) return prev;
    prev[`process.env.${[cur]}`] = JSON.stringify(env[cur]);
    return prev;
  }, {});
}

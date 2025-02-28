import builder from "electron-builder";
import { readFileSync } from "node:fs";
import semver from "semver";
import { mainResolve, loadDotEnvRuntime } from "./utils.mjs";

const packageJson = JSON.parse(readFileSync(mainResolve("./package.json")));
loadDotEnvRuntime();

if (semver.neq(process.env.APP_VERSION, packageJson.version)) {
  console.log("请先同步构建版本和发布版本");
  process.exit(0);
}

// Let's get that intellisense working
/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
const options = {
  productName: process.env.APP_NAME,
  buildVersion: process.env.APP_VERSION,
  appId: process.env.APP_ID,
  copyright: process.env.APP_COPYRIGHT,
  artifactName: "${productName}-setup-${buildVersion}.${ext}",
  directories: {
    output: "./dist",
  },
  files: [
    {
      from: "./build",
      to: "./",
      filter: ["**/*"],
    },
    "./package.json",
    {
      from: "./node_modules/better-sqlite3/build/Release",
      to: "./build/Release",
    },
  ],
  extraResources: ["bin/**/*"],
  win: {
    icon: "../assets/icon.ico",
    target: [
      {
        target: "nsis",
      },
    ],
  },
  dmg: {
    contents: [],
  },
  mac: {
    icon: "../icons/icon.icns",
    target: {
      target: "default",
      arch: ["x64", "arm64"],
    },
  },
  linux: {
    icon: "../build/icons",
  },
  nsis: {
    oneClick: false,
    allowElevation: true,
    allowToChangeInstallationDirectory: true,
    installerIcon: "",
    uninstallerIcon: "",
    installerHeaderIcon: "",
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: "",
    include: "",
    script: "",
  },
  publish: {
    provider: "github",
    repo: "m3u8-downloader",
    owner: "caorushizi",
    releaseType: "prerelease",
  },
};

const target =
  process.env.NODE_ENV === "development"
    ? builder.DIR_TARGET
    : builder.DEFAULT_TARGET;
try {
  const targets =
    process.platform === "win32"
      ? builder.Platform.WINDOWS.createTarget(target)
      : builder.Platform.MAC.createTarget(target);
  await builder.build({
    targets,
    config: options,
  });
} catch (e) {
  console.log(e);
}

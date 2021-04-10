import { spawn, SpawnOptions } from "child_process";
import glob from "glob";
import spawnargs from "spawn-args";
import semver from "semver";
import { workspace } from "main/utils/variables";
import logger from "./logger";

const spawnWrapper = (command: string, args: string, options: SpawnOptions) =>
  new Promise((resolve, reject) => {
    console.log(command, spawnargs(args));
    const spawnCommand = spawn(command, spawnargs(args), {
      cwd: workspace,
      ...options,
    });

    spawnCommand.on("close", (code) => {
      if (code !== 0) reject(new Error(`调用 ${command} 可执行文件执行失败`));
      else resolve(true);
    });
  });

/**
 * 获取文件目录
 */
const globWrapper: (
  pattern: string,
  options: glob.IOptions
) => Promise<string[]> = (pattern, options = {}) =>
  new Promise((resolve, reject) => {
    glob(pattern, { cwd: workspace, ...options }, (err, files) => {
      if (err) reject(err);
      resolve(files);
    });
  });

const exec = async (exeFile: string, ...args: string[]) => {
  const [localPath, name, url, headers, restArgs] = args;

  // 判断使用的可执行程序
  let binName = "";
  let argsStr;

  switch (exeFile) {
    case "mediago":
      binName = "mediago";
      argsStr = `--path "${localPath}" --name "${name}" --url "${url}" --headers "${headers}"`;
      break;
    case "N_m3u8DL-CLI": {
      let binNameList = await globWrapper("N_m3u8DL-CLI*.exe", {
        // @ts-ignore
        cwd: __bin__,
      });
      binNameList = binNameList
        .map((item) => /N_m3u8DL-CLI_v(.*).exe/.exec(item)?.[1] || "0.0.0")
        .filter((item) => semver.valid(item))
        .sort((a, b) => (semver.gt(a, b) ? -1 : 1));
      if (binNameList.length === 0) throw new Error("没有找到 N_m3u8DL-CLI");
      binName = `N_m3u8DL-CLI_v${binNameList[0]}`;

      argsStr = `"${url}" --workDir "${localPath}" --saveName "${name}" --headers "${headers}" ${restArgs}`;
      break;
    }
    default:
      throw new Error("暂不支持该下载方式");
  }

  logger.info("下载参数：", argsStr);
  return spawnWrapper(binName, argsStr, {
    detached: true,
    shell: true,
    // @ts-ignore
    cwd: __bin__,
  });
};

const successFn = (data: any) => ({ code: 0, msg: "", data });
const failFn = (code: number, msg: string) => ({ code, msg, data: null });

export { exec, successFn, failFn, globWrapper, spawnWrapper };

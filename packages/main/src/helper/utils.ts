import EventEmitter from "events";

export async function sleep(second = 1): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, second * 1000));
}

export function stripColors(str: string) {
  // 匹配控制台颜色字符的正则表达式
  // eslint-disable-next-line no-control-regex
  const colorRegex = /\x1b\[(\d+)(;\d+)*m/g;
  // 将所有颜色字符替换为空字符串
  return str.replace(colorRegex, "");
}

export const event = new EventEmitter();

import { DevToolsService, LoggerService } from "../interfaces";
import { inject, injectable } from "inversify";
import { TYPES } from "../types";
import isDev from "electron-is-dev";
import installExtension, {
  REDUX_DEVTOOLS,
  REACT_DEVELOPER_TOOLS,
} from "electron-devtools-installer";

@injectable()
export default class DevToolsServiceImpl implements DevToolsService {
  constructor(
    @inject(TYPES.LoggerService)
    private readonly logger: LoggerService
  ) {}

  async init(): Promise<void> {
    if (!isDev) {
      return;
    }

    try {
      this.logger.debug("当前环境为开发环境，开始加载开发者工具");
      await installExtension([REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS]);
      this.logger.debug("加载开发者工具成功");
    } catch (err: any) {
      this.logger.error("加载开发者工具失败", err);
    }
  }
}

import { BrowserWindow } from "electron";
import windowList from "./windowList";
import { IWindowListItem, IWindowManager } from "../../types/main";
import { WindowName } from "./variables";

class WindowManager implements IWindowManager {
  private windowMap: Map<WindowName | string, BrowserWindow> = new Map();
  private windowIdMap: Map<number, WindowName | string> = new Map();

  async create(name: WindowName) {
    const windowConfig: IWindowListItem = windowList.get(name)!;
    const window = new BrowserWindow(windowConfig.options());
    const id = window.id;
    this.windowMap.set(name, window);
    this.windowIdMap.set(window.id, name);
    await window.loadURL(windowConfig.url);
    await windowConfig.callback(window, this);
    window.on("close", () => {
      this.deleteById(id);
    });
    return window;
  }

  get(name: WindowName) {
    return this.windowMap.get(name)!;
  }

  has(name: WindowName) {
    return this.windowMap.has(name);
  }

  deleteById = (id: number) => {
    const name = this.windowIdMap.get(id);
    if (name) {
      this.windowMap.delete(name);
      this.windowIdMap.delete(id);
    }
  };
}

export default new WindowManager();

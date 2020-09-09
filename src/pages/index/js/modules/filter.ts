import { Stage } from "../stage";
import { StageModule } from "../module";
import { delay } from "@/js/utility";


export interface Filter extends StageModule {
}

export abstract class AbstractFilter implements Filter {
  async addTo({ imgs }: Stage, processCallback: (process: number) => void = () => { }) {
    for (let index = 0; index < imgs.length; index++) {
      let img = imgs[index];

      img = this.applyFilter(img);
      img.applyFilters();

      // 插入一个延时 避免阻塞用户操作
      await delay(28);

      processCallback((index + 1) / imgs.length);
    }
  }

  abstract applyFilter(img: fabric.Image): fabric.Image;
}
import { Stage } from "../stage";
import { StageModule } from "../module";


export interface Filter extends StageModule {
}

export abstract class AbstractFilter implements Filter {
  addTo({ imgs }: Stage, processCallback: (process: number) => void = () => { }) {
    imgs.forEach((img, index) => {
      img = this.applyFilter(img);

      img.applyFilters();

      processCallback((index + 1) / imgs.length);
    });
  }

  abstract applyFilter(img: fabric.Image): fabric.Image;
}
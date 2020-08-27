import { GifModule, Stage } from "./module";
import { fabric } from 'fabric';

export class Filter implements GifModule {
  public apply(stage: Stage) {
    stage.imgs.forEach(img => {
      img.filters.push(new fabric.Image.filters.Noise({noise: 128}));
      img.applyFilters();
    });
  }
}
import { GifModule, Stage } from "./module";
import { fabric } from 'fabric';

export class Filter implements GifModule {
  public apply(stage: Stage) {
    console.log(stage);
    stage.imgs.forEach(img => {
      img.filters.push(new fabric.Image.filters.Noise({noise: 128}));
      img.applyFilters();
    });
  }
}
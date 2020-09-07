import { Stage } from '../../stage';
import { Filter } from '../Filter';
import { fabric } from 'fabric';

export class BlackWhite implements Filter {
  addTo(stage: Stage) {
    stage.imgs.forEach(img => {
      // @ts-ignore
      img.filters.push(new fabric.Image.filters.BlackWhite());
      img.applyFilters();
    });
  }
}
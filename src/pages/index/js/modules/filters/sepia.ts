import { Stage } from '../../stage';
import { Filter } from '../Filter';
import { fabric } from 'fabric';

export class Sepia implements Filter {
  addTo(stage: Stage) {
    stage.imgs.forEach(img => {
      img.filters.push(new fabric.Image.filters.Sepia());
      img.applyFilters();
    });
  }
}
import { Stage } from '../../stage';
import { Filter } from '../filter';
import { fabric } from 'fabric';

export class Tint implements Filter {
  addTo(stage: Stage) {
    stage.imgs.forEach(img => {
      img.filters.push(new fabric.Image.filters.Tint({color: '#000'}));
      img.applyFilters();
    });
  }
}
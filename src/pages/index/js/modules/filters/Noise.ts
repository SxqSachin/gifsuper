import { StageModule } from '../../module';
import { Stage } from '../../stage';
import { Filter } from '../Filter';
import { fabric } from 'fabric';

export class Noise implements Filter {
  addTo(stage: Stage) {
    stage.imgs.forEach(img => {
      img.applyFilters([new fabric.Image.filters.Noise({noise: 128})]);
    });
  }
}
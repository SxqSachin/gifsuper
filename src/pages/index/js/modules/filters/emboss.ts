import { AbstractFilter } from '../filter';
import { fabric } from 'fabric';

export class Emboss extends AbstractFilter {
  applyFilter(img: fabric.Image): fabric.Image {
    img.filters.push(new fabric.Image.filters.Convolute({
      matrix: [1, 1, 1,
        1, 0.7, -1,
        -1, -1, -1]
    }));
    return img;
  }
}
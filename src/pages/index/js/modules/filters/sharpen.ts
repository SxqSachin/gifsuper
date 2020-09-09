import { AbstractFilter } from '../filter';
import { fabric } from 'fabric';

export class Sharpen extends AbstractFilter {
  applyFilter(img: fabric.Image): fabric.Image {
    img.filters.push(new fabric.Image.filters.Convolute({
      matrix: [0, -1, 0,
        -1, 5, -1,
        0, -1, 0]
    }));
    return img;
  }
}
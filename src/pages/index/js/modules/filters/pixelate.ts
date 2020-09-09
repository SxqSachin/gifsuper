import { AbstractFilter } from '../filter';
import { fabric } from 'fabric';

export class Pixelate extends AbstractFilter {
  applyFilter(img: fabric.Image): fabric.Image {
    img.filters.push(new fabric.Image.filters.Pixelate({blocksize: 8}));
    return img;
  }
}
import { AbstractFilter } from '../filter';
import { fabric } from 'fabric';

export class Invert extends AbstractFilter {
  applyFilter(img: fabric.Image): fabric.Image {
    img.filters.push(new fabric.Image.filters.Invert());
    return img;
  }
}
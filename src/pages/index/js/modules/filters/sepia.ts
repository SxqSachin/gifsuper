import { AbstractFilter } from '../filter';
import { fabric } from 'fabric';

export class Sepia extends AbstractFilter {
  applyFilter(img: fabric.Image): fabric.Image {
    img.filters.push(new fabric.Image.filters.Sepia());
    return img;
  }
}
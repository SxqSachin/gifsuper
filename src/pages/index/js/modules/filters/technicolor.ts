import { AbstractFilter } from '../filter';
import { fabric } from 'fabric';

export class Technicolor extends AbstractFilter {
  applyFilter(img: fabric.Image): fabric.Image {
    // @ts-ignore
    img.filters.push(new fabric.Image.filters.Technicolor());
    return img;
  }
}
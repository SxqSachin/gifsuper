import { AbstractFilter } from '../filter';
import { fabric } from 'fabric';

export class Polaroid extends AbstractFilter {
  applyFilter(img: fabric.Image): fabric.Image {
    // @ts-ignore
    img.filters.push(new fabric.Image.filters.Polaroid());
    return img;
  }
}
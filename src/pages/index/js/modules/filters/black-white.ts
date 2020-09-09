import { AbstractFilter } from '../filter';
import { fabric } from 'fabric';

export class BlackWhite extends AbstractFilter {
  applyFilter(img: fabric.Image): fabric.Image {
    // @ts-ignore
    img.filters.push(new fabric.Image.filters.BlackWhite());
    return img;
  }
}
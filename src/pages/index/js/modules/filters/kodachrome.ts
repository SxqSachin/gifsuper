import { AbstractFilter } from '../filter';
import { fabric } from 'fabric';

export class Kodachrome extends AbstractFilter {
  applyFilter(img: fabric.Image): fabric.Image {
    // @ts-ignore
    img.filters.push(new fabric.Image.filters.Kodachrome());
    return img;
  }
}
import { AbstractFilter } from '../filter';
import { fabric } from 'fabric';

export class Blur extends AbstractFilter {
  applyFilter(img: fabric.Image): fabric.Image {
    // @ts-ignore
    img.filters.push(new fabric.Image.filters.Blur({value: 10}));
    return img;
  }
}
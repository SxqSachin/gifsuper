import { AbstractFilter } from '../filter';
import { fabric } from 'fabric';

export class Noise extends AbstractFilter {
  applyFilter(img: fabric.Image): fabric.Image {
    img.filters.push(new fabric.Image.filters.Noise({noise: 128}));
    return img;
  }
}
import { Stage } from '../../stage';
import { Filter } from '../filter';
import { fabric } from 'fabric';

export class BlackWhite implements Filter {
  async addTo(stage: Stage, processCallback: (process: number) => void = () => { }) {
    const allDonePromiseArr = [];
    stage.imgs.forEach((img, index) => {
      const curPromise = new Promise(resolve => {
        // @ts-ignore
        img.filters.push(new fabric.Image.filters.BlackWhite());
        img.applyFilters();

        (typeof processCallback === 'function') && processCallback((index + 1) / stage.imgs.length);

        resolve();
      });

      allDonePromiseArr.push(curPromise);
    });

    const res = await Promise.all(allDonePromiseArr);
  }
}
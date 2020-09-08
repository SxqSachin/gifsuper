import { Noise } from "./filters/noise";
import { Grayscale } from "./filters/gray-scale";
import { Invert } from "./filters/invert";
import { Sepia } from "./filters/sepia";
import { Pixelate } from "./filters/pixelate";
import { BlackWhite } from "./filters/black-white";
import { Filter } from "./filter";

const FilterMap = {
  Noise,
  Grayscale,
  Invert,
  Sepia,
  Pixelate,
  BlackWhite
};

export type FilterType = 'Noise' | 'Grayscale' | 'BlackWhite' | 'Invert' | 'Sepia' | 'Pixelate';

export class Filters {
  public static get(type: FilterType): Filter | null {
    if (!FilterMap[type]) {
      return null;
    }

    return new FilterMap[type]();
  }
}
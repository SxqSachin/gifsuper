import { Noise } from "./filters/noise";
import { Grayscale } from "./filters/gray-scale";
import { Invert } from "./filters/invert";
import { Sepia } from "./filters/sepia";
import { Pixelate } from "./filters/pixelate";
import { BlackWhite } from "./filters/black-white";
// import { Blur } from "./filters/blur";
import { Kodachrome } from "./filters/kodachrome";
import { Polaroid } from "./filters/polaroid";
import { Technicolor } from "./filters/technicolor";
import { Sharpen } from "./filters/sharpen";
import { Emboss } from "./filters/emboss";
import { Vintage } from "./filters/vintage";
import { Filter } from "./filter";

const FilterMap = {
  Noise,
  Grayscale,
  Invert,
  Sepia,
  Pixelate,
  BlackWhite,
  // Blur,
  Kodachrome,
  Polaroid,
  Technicolor,
  Sharpen,
  Emboss,
  Vintage,
};

export type FilterType = 'Noise' | 'Grayscale' | 'BlackWhite' | 'Invert' | 'Sepia' | 'Pixelate' | 'Kodachrome' | 'Polaroid' | 'Technicolor' | 'Sharpen' | 'Emboss' | 'Vintage';

export class Filters {
  public static get(type: FilterType): Filter | null {
    if (!FilterMap[type]) {
      return null;
    }

    return new FilterMap[type]();
  }
}
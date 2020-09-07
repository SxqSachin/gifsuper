import { Noise } from "./filters/noise";
import { StageModule } from "../module";
import { GrayScale } from "./filters/gray-scale";
import { Invert } from "./filters/Invert";
import { Sepia } from "./filters/Sepia";
import { Pixelate } from "./filters/pixelate";
import { BlackWhite } from "./filters/black-white";
import { Stage } from "../stage";

export type FilterType = 'Noise' | 'GrayScale' | 'BlackWhite' | 'Invert' | 'Sepia' | 'Pixelate';

const FilterMap = {
  Noise,
  GrayScale,
  Invert,
  Sepia,
  Pixelate,
  BlackWhite
};

export interface Filter extends StageModule {
}

export class Filters {
  public static get(type: FilterType): Filter | null {
    if (!FilterMap[type]) {
      return null;
    }
    
    return new FilterMap[type]();
  }
}

import { Noise } from "./filters/Noise";
import { StageModule } from "../module";

export interface Filter extends StageModule {
}

export class Filters {
  public static Noise(): Filter {
    return new Noise();
  }
}

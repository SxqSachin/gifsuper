import { Stage } from "./stage";

export interface StageModule {
  addTo(stage: Stage)
  addTo(stage: Stage, processCallback?: (process: number) => void)
}
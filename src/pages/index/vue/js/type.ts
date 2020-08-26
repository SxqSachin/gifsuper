export interface Stage {

}

export type RangedFrameObject = fabric.Object & { inFrame: number[] };

export interface Toasted {
  toast(text: string, type?: string, duration?: number);
}

export type TextOption = {
  size?: number,
  color?: string,
  enableStroke?: boolean,
  strokeWidth?: number,
  strokeColor?: string,
  fontWeight?: 400 | 600,
}

export type GIFInfo = {
  
}
export interface Stage {
  addModule(module: GifModule);

  canvas: fabric.Canvas;

  imgs?: fabric.Image[];
}

export interface GifModule {
  apply(stage: Stage);
}
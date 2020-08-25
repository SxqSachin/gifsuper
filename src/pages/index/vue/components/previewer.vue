<template>
  <div>

    <canvas id="previewer"></canvas>

  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, } from 'vue-property-decorator';

import { GifPreview, PreviewOption } from '../js/preview';
import { Toasted } from '../js/type';
import { GifFrameList } from '@/js/gif';

@Component({ })
export default class Previewer extends Vue implements Toasted {
  private _preview!: GifPreview;

  public mounted() {
    this._preview = new GifPreview('previewer', this);
  }

  public toast(msg: string, type: string = 'info', duration: number = 3000) {
    // @ts-ignore
    this.$message(msg, { type, duration})
  }

  public async initGIF(frameList: GifFrameList, width: number, height: number) {
    await this._preview.initPreviewCanvas(frameList, width, height);
  }

  public render(usefulFrame, curFrame, interval, previewOption: PreviewOption) {
    const {
      revert,
      repeat,
      resize: showResize,
      flipX,
      flipY,
    } = previewOption;

    let curFrameSlider = Math.min(usefulFrame[curFrame], usefulFrame[usefulFrame.length - 1]);

    this._preview.updateOptions({
      revert,
      repeat,
      showResize,
      flipX,
      flipY,
    });

    this._preview.renderPreview(usefulFrame, interval, index => {
      curFrameSlider = index;
    });
  }

  public hideResizeRect() {
    this._preview.hideResizeRect();
  }
  public showResizeRect() {
    this._preview.showResizeRect();
  }

  get resizeRect(): fabric.Rect {
    return this._preview.resizeRect;
  }

  get preview() {
    return this._preview;
  }
}
</script>

<style lang="scss" scoped>

</style>
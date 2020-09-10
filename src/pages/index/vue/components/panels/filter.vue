<template>
  <div class="flex flex-col justify-center items-start mb-4 w-full">
    <div class="img-container flex flex-wrap w-full">
      <div class="img-wrapper relative p-2 mb-2 flex-0 bg-assets shadow hover:shadow-xl transition-shadow transition-time-func rounded-md cursor-pointer" 
        v-for="(previewImg, key) in previewImgs"
        :key="key"
        @click="applyFilter(previewImg.name)"
        >
        <img class="w-full" :src="previewImg.url" :alt="previewImg.title"/>
        <div class="filter-info absolute flex justify-center items-center opacity-0 hover:opacity-100 transition-opacity duration-300">
          <span class="text-gray-400"> {{ previewImg.title }} </span>
        </div>

        <div v-show="filterState[key] && filterState[key].show" class="filter-state absolute flex flex-col justify-center items-center">
          <p v-show="filterState[key] && filterState[key].title" class="text-gray-400 mb-2"> {{ filterState[key] ? filterState[key].title : '' }} </p>
          <p v-show="filterState[key] && filterState[key].subtitle" class="text-gray-400"> {{ filterState[key] ? filterState[key].subtitle : '' }} </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, } from 'vue-property-decorator';

import sBtn from '@/components/widget/s-btn.vue';
import { Filter } from '@/pages/index/js/modules/filter';
import { Filters, FilterType } from '@/pages/index/js/modules/filters';

import { fabric } from 'fabric';
import { GifFrame, GifFrameList } from '@/js/gif';
import { Toasted } from '../../../js/type';

@Component({
  components: {
    's-btn': sBtn,
  }
})
export default class extends Vue implements Toasted {
  public previewFrame!: GifFrame;

  public previewImgs: {[type: string]: string} = {};

  public filterState: {[type: string]: { show: boolean, title: string, subtitle: string }} = {};

  get filters() {
    const filterList = [
      { name: 'Noise', type: 'Noise', title: '噪声', options: { noise: 128, }, },
      { name: 'Grayscale', type: 'Grayscale', title: '灰阶', },
      { name: 'Invert', type: 'Invert', title: '负片', },
      { name: 'BlackWhite', type: 'BlackWhite', title: '黑白', },
      { name: 'Sepia', type: 'Sepia', title: '复古', },
      { name: 'Pixelate', type: 'Pixelate', title: '像素', options: { blocksize: 8, }, },
      { name: 'Kodachrome', type: 'Kodachrome', title: '艳丽', },
      { name: 'Vintage', type: 'Vintage', title: '陈旧', },
      { name: 'Polaroid', type: 'Polaroid', title: '拍立得画风', },
      { name: 'Technicolor', type: 'Technicolor', title: '科幻', },
      { name: 'Sharpen', type: 'Convolute', title: '锐利', options: { matrix: [0, -1, 0, -1, 5, -1, 0, -1, 0], }, },
      { name: 'Emboss', type: 'Convolute', title: '浮雕', options: { matrix: [1, 1, 1, 1, 0.7, -1, -1, -1, -1], }, },
    ];

    return filterList
  }

  public mounted() {
    console.log('filter panel loaded');
  }

  public applyFilter(type: FilterType) {
    if (this.filterState[type] && this.filterState[type].show) {
      this.toast('滤镜应用中，请稍候');
      return;
    }

    let filter: Filter = Filters.get(type);

    this.$emit('filter', { filter, type });
  }

  public setFilterState(type: FilterType, title: string, subtitle?: string) {
    this.$set(this.filterState, type, { show: true, title, subtitle, });
  }
  public clearFilterState(type: FilterType) {
    this.$set(this.filterState, type, { show: false, title: '', subtitle: '', });
  }

  public clearFilter() {
    this.$emit('clear');
  }

  public setPreviewFrame(frame: GifFrame) {
    this.previewFrame = frame;

    this.renderPreview();
  }

  private async renderPreview() {
    const parseImgPromise: Promise<fabric.Image> = new Promise(resolve => {
      fabric.Image.fromURL(this.previewFrame.imgFileSrc, img => {
        resolve(img);
      });
    })

    const img = await parseImgPromise;

    this.filters.forEach(({ type, name, options, title }) => {
      const filter = new fabric.Image.filters[type](options);
      img.applyFilters([filter]);
      this.$set(this.previewImgs, name, { url: img.toDataURL({format: 'png'}), title, type, name })
    });
  }

  public toast(msg: string, type: string = 'info', duration: number = 3000) {
    // @ts-ignore
    this.$message(msg, { type, duration });
  }
}
</script>

<style lang="scss" scoped>
.img-container  .img-wrapper {
  width: calc(50% - 0.25rem);
}

.img-container .img-wrapper:nth-child(even) {
  margin-left: 0.5rem;
}

.img-wrapper .filter-info,
.img-wrapper .filter-state {
  top: 0.5rem;
  left: 0.5rem;
  width: calc(100% - 1rem);
  height: calc(100% - 1rem);
  background-color: #333333cc;
}

</style>
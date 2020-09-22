<template>
  <div class="flex flex-col justify-center items-start mb-0 w-full">
    <div class="img-container flex flex-wrap w-full">
      <div class="img-wrapper p-2 mb-2 flex-0 bg-assets shadow hover:shadow-xl transition-shadow transition-time-func rounded-md cursor-pointer" 
        v-for="(previewImg, key) in previewImgs"
        :key="key"
        >
        <div class="w-full relative" @click="applyFilter(previewImg.name)" title="点击已应用该滤镜">
          <img class="w-full" :src="previewImg.url" :alt="previewImg.title"/>

          <div class="filter-info absolute flex justify-center items-center opacity-0 transition-opacity duration-300">
            <span class="text-gray-400"> {{ previewImg.title }} </span>
          </div>

          <div v-show="filterState[key] && filterState[key].show" class="filter-state absolute flex flex-col justify-center items-center">
            <p v-show="filterState[key] && filterState[key].title" class="text-gray-400 mb-2"> {{ filterState[key] ? filterState[key].title : '' }} </p>
            <p v-show="filterState[key] && filterState[key].subtitle" class="text-gray-400"> {{ filterState[key] ? filterState[key].subtitle : '' }} </p>
          </div>
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
import { delay } from '@/js/utility';
import { AbstractPanel } from '@/pages/index/js/panel'; 

@Component({
  components: {
    's-btn': sBtn,
  }
})
export default class extends AbstractPanel  {
  public previewFrame!: GifFrame;

  public previewImgs: {[type: string]: string} = {};

  public filterState: {[type: string]: { show: boolean, title: string, subtitle: string }} = {};

  get tabInfo() {
    return { name: 'filter', title: '滤镜', icon: '/static/icons/wand.svg', new: true, };
  }

  get panelName() {
    return 'filter-panel';
  }

  get filters() {
    const filterList = {
      'Noise': { name: 'Noise', type: 'Noise', title: '噪声', options: { noise: 128, }, },
      'Grayscale': { name: 'Grayscale', type: 'Grayscale', title: '灰阶', },
      'Invert': { name: 'Invert', type: 'Invert', title: '负片', },
      'BlackWhite': { name: 'BlackWhite', type: 'BlackWhite', title: '黑白', },
      'Sepia': { name: 'Sepia', type: 'Sepia', title: '复古', },
      'Pixelate': { name: 'Pixelate', type: 'Pixelate', title: '像素', options: { blocksize: 8, }, },
      'Kodachrome': { name: 'Kodachrome', type: 'Kodachrome', title: '艳丽', },
      'Vintage': { name: 'Vintage', type: 'Vintage', title: '陈旧', },
      'Polaroid': { name: 'Polaroid', type: 'Polaroid', title: '拍立得画风', },
      'Technicolor': { name: 'Technicolor', type: 'Technicolor', title: '科幻', },
      'Sharpen': { name: 'Sharpen', type: 'Convolute', title: '锐利', options: { matrix: [0, -1, 0, -1, 5, -1, 0, -1, 0], }, },
      'Emboss': { name: 'Emboss', type: 'Convolute', title: '浮雕', options: { matrix: [1, 1, 1, 1, 0.7, -1, -1, -1, -1], }, },
    };

    return filterList
  }

  public mounted() {
    console.log('filter panel loaded');
    // this.addToDesk();
  }

  public applyFilter(type: FilterType) {
    if (this.filterState[type] && this.filterState[type].show) {
      this.toast('滤镜应用中，请稍候');
      return;
    }

    let filter: Filter = Filters.get(type);

    this.$emit('event', { event: 'filter', filter, type });
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

  private async renderSingleFilter(img: fabric.Image, filterType: string, filterOptions: any, options: any) {
    const { name } = options;
    const filter = new fabric.Image.filters[filterType](filterOptions);

    img.applyFilters([filter]);
    this.$set(this.previewImgs, name, { url: img.toDataURL({format: 'png'}), ...options })

    await delay(10);

    return Promise.resolve();
  }

  private async renderPreview() {
    const parseImgPromise: Promise<fabric.Image> = new Promise(resolve => {
      fabric.Image.fromURL(this.previewFrame.imgFileSrc, img => {
        resolve(img);
      });
    })

    const img = await parseImgPromise;

    for(let i = 0; i < Object.values(this.filters).length; i++) {
      const { type, name, options, title } = this.filters[Object.keys(this.filters)[i]];

      await this.renderSingleFilter(img, type, options, { title, type, name, options });
    }
  }

  public toast(msg: string, type: string = 'info', duration: number = 3000) {
    // @ts-ignore
    this.$message(msg, { type, duration });
  }
}
</script>

<style lang="scss" scoped>
.img-container .img-wrapper {
  width: calc(50% - 0.25rem);
}

.img-wrapper:hover .filter-info {
  opacity: 1;
}

.img-container .img-wrapper:nth-child(even) {
  margin-left: 0.5rem;
}

.img-wrapper .filter-info,
.img-wrapper .filter-state {
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #333333cc;
}

</style>
<template>
  <div class="flex flex-col justify-center items-start mb-4 w-full">
    <div class="img-container flex flex-wrap w-full">
      <div class="img-wrapper relative p-4 mb-4 flex-0 bg-assets shadow hover:shadow-xl transition-shadow transition-time-func rounded-md cursor-pointer" 
        v-for="(previewImg, key) in previewImgs"
        :key="key"
        @click="applyFilter(key)"
        >
        <img class="w-full" :src="previewImg.url" :alt="previewImg.title"/>
        <div class="filter-info absolute flex justify-center items-center opacity-0 hover:opacity-100 transition-opacity duration-300">
          <span class="text-gray-400"> {{ previewImg.title }} </span>
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

@Component({
  components: {
    's-btn': sBtn,
  }
})
export default class extends Vue {
  public previewFrame!: GifFrame;

  public previewImgs: {[type: string]: string} = {};

  get filters() {
    const filterList = [
      { name: 'Noise', title: '噪声', options: { noise: 128, }, },
      { name: 'Grayscale', title: '灰阶', },
      { name: 'Invert', title: '负片', },
      { name: 'BlackWhite', title: '黑白', },
      { name: 'Sepia', title: '复古', },
      { name: 'Pixelate', title: '像素', options: { blocksize: 16, }, },
    ];

    return filterList
  }

  public mounted() {
    console.log('filter panel loaded');
  }

  public applyFilter(type: FilterType) {
    let filter: Filter = Filters.get(type);

    this.$emit('filter', filter);
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

    this.filters.forEach(({ name, options, title }) => {
      const filter = new fabric.Image.filters[name](options);
      img.applyFilters([filter]);
      this.$set(this.previewImgs, name, {url: img.toDataURL({format: 'png'}), title, })
    });
  }
}
</script>

<style lang="scss" scoped>
.img-container  .img-wrapper {
  width: calc(50% - 0.5rem);
}

.img-container .img-wrapper:nth-child(even) {
  margin-left: 1rem;
}

.img-wrapper .filter-info {
  top: 1rem;
  left: 1rem;
  width: calc(100% - 2rem);
  height: calc(100% - 2rem);
  background-color: #333333cc;
}

</style>
<template>
  <div>
    <div>
      {{ title }}
    </div>

    <div>
      {{ process }}
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, } from 'vue-property-decorator';

import { Filter } from '@/pages/index/js/modules/filter';
import { Filters, FilterType } from '@/pages/index/js/modules/filters';

import { fabric } from 'fabric';
import { GifFrame, GifFrameList } from '@/js/gif';

@Component({ })
export default class extends Vue {
  @Prop({type: String, default: ''})
  public title!: string;

  @Prop({type: Number, default: 1})
  public process!: string;
}
</script>

<style lang="scss" scoped>

</style>
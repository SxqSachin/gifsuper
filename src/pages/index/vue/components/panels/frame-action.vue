
<template>
  <div>
    123
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
import { delay } from '@/js/utility';
import { AbstractPanel } from './abstract-panel';
  
@Component({
  components: {
    's-btn': sBtn,
  }
})
export default class extends AbstractPanel {
}
</script>

<style lang="scss" scoped>

</style>
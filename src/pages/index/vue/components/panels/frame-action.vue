
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
import { AbstractPanel } from '@/pages/index/js/panel'; 
  
@Component({
  components: {
    's-btn': sBtn,
  }
})
export default class extends AbstractPanel {
  public mounted() {
    console.log('frame action panel loaded');
    // this.addToDesk();
  }

  get tabInfo() {
    return { name: 'frame', title: '帧处理', icon: '/static/icons/hammer.svg', };
  }

  get panelName() {
    return 'frame-action-panel';
  }
}
</script>

<style lang="scss" scoped>

</style>
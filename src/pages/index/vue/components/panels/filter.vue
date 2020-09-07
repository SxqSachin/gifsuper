<template>
  <div class="flex">
    <s-btn @click="applyFilter('Noise')"> 噪声 </s-btn>
    <s-btn @click="applyFilter('GrayScale')"> 灰阶 </s-btn>
    <s-btn @click="applyFilter('Invert')"> 负片 </s-btn>
    <s-btn @click="applyFilter('BlackWhite')"> 纯黑白 </s-btn>
    <s-btn @click="applyFilter('Sepia')"> 复古 </s-btn>
    <s-btn @click="applyFilter('Tint')"> 着色 </s-btn>
    <s-btn @click="applyFilter('Pixelate')"> 像素化 </s-btn>

    <s-btn :full="true" @click="clearFilter"> 重置所有滤镜 </s-btn>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, } from 'vue-property-decorator';

import sBtn from '@/components/widget/s-btn.vue';
import { Filter, Filters, FilterType } from '@/pages/index/js/modules/Filter';

@Component({ 
  components: {
    's-btn': sBtn,
  }
})
export default class extends Vue {
  @Prop({type: String, default: 'ttt'})
  public test: string;

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
  
}
</script>

<style lang="scss" scoped>

</style>
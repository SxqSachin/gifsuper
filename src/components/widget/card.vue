<template>
  <div class="card-wrapper bg-no-repeat bg-center cursor-pointer bg-primary" :style="getWrapperStyle" @click="onClick">
    <slot></slot>
    <!-- <div class="card-content" :style="getContentStyle"> -->
    <!-- </div> -->
  </div>
</template>

<script lang="ts">
import {Vue, Component, Prop} from 'vue-property-decorator';

@Component({ })
export default class extends Vue {
  @Prop({ type: String, default: ''})
  public img?: string;

  public onClick(): void {
    this.$emit('click');
  }

  get getWrapperStyle(): object {
    const style: {[data: string]: string} = {};

    if (this.img) {
      style['background-image'] = `url(${this.img})`;
    }

    return style;
  }
  get getContentStyle(): object {
    const style: {[data: string]: string} = {};

    return style;
  }
}
</script>

<style lang="scss" scoped>
  .card-wrapper {
    box-shadow: 0px 8px 16px -8px rgba(0, 0, 0, 0.1);
    border-radius: 4px;

    transition: box-shadow 0.3s;

    &:hover {
      box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.1);
    }

    .card-content {
      width: 100%;
      height: 100%;
    }
  }

</style>
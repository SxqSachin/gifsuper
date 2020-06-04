<template>
  <div class="s-select_wrapper">
    <select
      class="s-select"
      :placeholder="placeholder"
      :value="value"
      @change="emitChange($event.target.value)"
    >
    <slot></slot>
    </select>
  </div>
</template>

<script lang="ts">
import { Prop, Vue, Component } from 'vue-property-decorator';

@Component({})
export default class SSelect extends Vue {
  @Prop({ default: true })
  public full!: boolean;

  @Prop({ default: '请输入' })
  public placeholder!: boolean;

  @Prop({ default: '' })
  public value!: string;

  public val: string = '';

  public mounted() {
    this.val = this.value;
  }

  public emitChange(value: string) {
    this.val = value;
    this.$emit('change', value);
  }
}
</script>

<style lang="scss" scoped>
.s-select_wrapper {
  display: inline-block;

  vertical-align: top;

  border-bottom: 1px solid $divide-color;

  width: 100%;

  .s-select {
    display: inline-block;

    height: 2rem;
    width: 100%;

    line-height: 2rem;
    size: 20rem;

    background: white;
    color: var(--content-text-color);

    border: 0;

    &::placeholder {
      color: $secondary-text-color;
    }

    &:focus {
      border: 0;
    }
  }
}
</style>
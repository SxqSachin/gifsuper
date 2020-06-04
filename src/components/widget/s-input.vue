<template>
  <div class="s-input-wrapper" :class="{full: full, 'no-divide-line': ((noDivideLine && noBorder))}">
    <input
      class="s-input"
      title="title"
      :type="type"
      :placeholder="placeholder"
      :value="value"
      :autofocus="autofocus"
      @input="emitChange($event.target.value)"
    />
  </div>
</template>

<script lang="ts">
import { Prop, Vue, Component } from 'vue-property-decorator';

@Component({})
export default class SInput extends Vue {
  @Prop({ default: true })
  public full!: boolean;

  @Prop({ default: '请输入' })
  public placeholder!: boolean;

  @Prop({ default: false })
  public noBorder!: boolean;

  @Prop({ default: false })
  public autofocus!: boolean;

  @Prop({ default: '' })
  public value!: string | number;

  @Prop({ default: 'text' })
  public type!: string | number;

  public noDivideLine: boolean = false;
  public val: string | number = '';

  public mounted() {
    this.val = this.value;
  }

  public emitChange(value: string) {
    this.noDivideLine = !!value;
    this.val = value;
    this.$emit('input', value);
  }
}
</script>

<style lang="scss" scoped>
$divide-color: red;
$secondary-text-color: red;
.s-input-wrapper {
  display: inline-block;

  vertical-align: top;

  border-bottom: 1px solid $divide-color;

  color: var(--content-text-color);

  &.full {
    display: block;

    .s-input {
      width: 100%;
    }
  }

  &.no-divide-line {
    border-bottom: 0;
  }

  .s-input {
    display: inline-block;

    height: 2rem;

    line-height: 2rem;
    size: 20rem;

    background: transparent;

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
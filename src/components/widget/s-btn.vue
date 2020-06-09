<template>
  <div class="whitespace-no-wrap s-btn-wrapper px-4 py-1" :class="getWrapperClass">
    <button :class="getBtnClass" @click="onClick" :disabled="disabled || loading">
      <slot v-if="!loading"></slot>
    </button>
  </div>
</template>

<script lang="ts">
import { Prop, Vue, Component } from 'vue-property-decorator';

export type BTN_TYPE = 'info' | 'success' | 'warn' | 'error' | 'disabled' | 'ghost';

@Component({
  components: {
  },
})
export default class SBtn extends Vue {
  @Prop({ type: Boolean, default: false })
  public full!: boolean;

  @Prop({ type: Boolean, default: false })
  public disabled!: boolean;

  @Prop({ type: String, default: 'info' })
  public type!: BTN_TYPE;

  @Prop({ type: Boolean, default: false })
  public loading!: false;

  public onClick() {
    if (this.disabled) {
      return;
    }

    this.$emit('click');
  }

  get getWrapperClass(): { [key: string]: boolean } {
    const res = {
      's-btn-wrapper': true,
      'full': this.full,
      'disabled': this.disabled,
      ['type--' + this.type]: true,
    };

    return res;
  }

  get getBtnClass(): { [key: string]: boolean } {
    const res = {
      's-btn': true,
    };

    return res;
  }
}
</script>

<style lang="scss" scoped>
.s-btn-wrapper {
  height: 2.18rem;
  // width: 12em;

  border: 0;
  border-radius: 2pt;

  color: white;
  background-color: red;

  .s-btn {
    width: 100%;
    height: 100%;

    border: 0;
    background-color: transparent;
  }

  &.full {
    width: 100%;
  }

  &.disabled, & [disabled] {
    cursor: not-allowed;

    .s-btn {
      color: var(--r-seconday-text-color);
    }
  }

  &.type--info {
    background-color: var(--color-info);
    &.disabled{
      background-color: var(--color-info--disabled);
    }
    .s-btn {
      color: var(--r-primary-text-color);
    }
  }
  &.type--success {
    background-color: var(--color-success);
    &.disabled{
      background-color: var(--color-success--disabled);
    }
    .s-btn {
      color: var(--r-primary-text-color);
    }
  }
  &.type--warn {
    background-color: var(--color-warn);
    &.disabled{
      background-color: var(--color-warn--disabled);
    }
    .s-btn {
      color: var(--r-primary-text-color);
    }
  }
  &.type--error {
    background-color: var(--color-error);
    &.disabled{
      background-color: var(--color-error--disabled);
    }
    .s-btn {
      color: var(--r-primary-text-color);
    }
  }
  &.type--disabled {
    background-color: var(--color-disabled);
    &.disabled{
      background-color: var(--color-disabled--disabled);
    }
    .s-btn {
      color: var(--r-primary-text-color);
    }
  }
  &.type--ghost {
    background-color: var(--color-ghost);
    border: 1px solid var(--border-color-mid);

    .s-btn {
      color: var(--primary-text-color);
    }
  }
}
</style>
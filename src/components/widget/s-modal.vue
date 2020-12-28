<template>
  <div class="s-modal" :class="{'s-modal--show': show}">
    <div class="s-modal__wrapper" @click="onClick">
      <div class="s-modal__shade" ref="shade"></div>
      <div class="s-modal__content">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Prop, Vue, Component } from 'vue-property-decorator';

@Component({})
export default class SModal extends Vue {
  @Prop({ default: false })
  public show!: boolean;

  private innerShow: boolean = false;

  public onClick(e: MouseEvent) {
    // if (e.target === this.$refs.shade) {
    // }
  }
}
</script>

<style lang="scss" scoped>
.s-modal {
  pointer-events: none;
  position: fixed;
  overflow: hidden;

  top: 0;

  width: 100vw;
  height: 100vh;

  &.s-modal--show {
    pointer-events: initial;

    .s-modal__wrapper {
      transition: transform 250ms, opacity 350ms;

      opacity: 1;
      transform: scale(1);
    }
  }
  .s-modal__wrapper {
    z-index: 10000;

    position: absolute;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;

    transition: transform 1000ms, opacity 250ms;
    opacity: 0;
    transform: scale(1.2);

    @media screen and (max-width: 767px) {
    }

    .s-modal__shade {
      position: absolute;

      z-index: 1;

      left: 0;
      top: 0;

      width: 100vw;
      height: 100vh;

      background: rgba(0, 0, 0, 0.38);

      // filter: blur(8px);
    }

    .s-modal__content {
      z-index: 2;
      position: absolute;

      top: 12vh;
      right: 10vw;
      left: 10vw;

      border-radius: 4px;

      max-height: 100vh - 12vh * 2;

      @media screen and (max-width: 767px) {
        // background: white;
      }
    }
  }
}
</style>
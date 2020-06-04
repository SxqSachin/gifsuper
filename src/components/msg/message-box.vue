<template>
  <div :class="getAnimClass" :style="getStyle" v-if="!destroy">
    <div class="content">
      <!-- <info-icon v-if="type === 'info'" class="icon"></info-icon> -->
      <!-- <success-icon v-if="type === 'success'" class="icon"></success-icon> -->
      <!-- <warn-icon v-if="type === 'warn'" class="icon"></warn-icon> -->
      <!-- <error-icon v-if="type === 'error'" class="icon"></error-icon> -->
      <span class="msg">{{ msg }}</span>
    </div>
  </div>
</template>

<script lang="ts">

import { Vue, Prop, Component } from 'vue-property-decorator';

// import IosInformationCircleOutlineIcon from 'vue-ionicons/dist/ios-information-circle-outline.vue';
// import IosCheckmarkCircleOutlineIcon from 'vue-ionicons/dist/ios-checkmark-circle-outline.vue';
// import IosWarningIcon from 'vue-ionicons/dist/ios-warning.vue';
// import IosCloseCircleOutlineIcon from 'vue-ionicons/dist/ios-close-circle-outline.vue';

let count = 0;

import { delay } from '@/js/utility';

@Component({
  components: {
    // 'info-icon': IosInformationCircleOutlineIcon,
    // 'success-icon': IosCheckmarkCircleOutlineIcon,
    // 'warn-icon': IosWarningIcon,
    // 'error-icon': IosCloseCircleOutlineIcon,
  },
})
export default class extends Vue {
  public msg?: string = '';
  public duration?: number = 3000;
  public type?: string = 'INFO';

  public destroy?: boolean = false;


  public isEnter?: boolean = false;

  public count: number = 0;

  public async mounted() {
    await delay(100);
    this.isEnter = true;

    this.count = count++;

    // @ts-ignore
    await delay(this.duration);
    this.isEnter = false;

    // @ts-ignore
    await delay(1000);

    this.destroy = true;
    await this.$nextTick();
    this.$destroy();
  }

  get getAnimClass(): object {
    const cls: any = {
      'msgbox-wrapper': true,
      'msgbox-type--info': this.type === 'info',
      'msgbox-type--success': this.type === 'success',
      'msgbox-type--warn': this.type === 'warn',
      'msgbox-type--error': this.type === 'error',
     };

    if (this.isEnter) {
      cls.enter = true;
    }

    return cls;
  }

  get getStyle(): object {
    const style: any = {
      'z-index': (10000 + this.count),
    };

    return style;
  }
}

</script>

<style lang="scss" scoped>
$box-width: 24em;
$mobile-box-width: 80vw;

$box-height: 3.5em;

.msgbox-wrapper {
  position: fixed;
  top: 0;
  left: calc(50% - #{$box-width / 2});

  width: $box-width;
  height: $box-height;

  padding: 1em;

  font-size: 18px;

  background: var(--assets-bg);
  border-radius: 4px;

  transform: translateY(calc(#{-$box-height} - 1em));
  transition: 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);

  border: 1px solid transparent;
  box-shadow: var(--shadow);

  opacity: 0;

  .content {
    display: flex;
    align-items: center;

    height: 100%;

    .icon {
      font-size: 1.5em;
    }

    .msg {
      margin-left: 0.62em;
      color: var(--secondary-text-color);
    }
  }

  &.enter {
    transform: translateY(calc(1.5em)) scale(0.9) !important;
    z-index: 9999 !important;

    box-shadow: none;

    opacity: 1;
  }

  &:last-of-type {
    &.enter {
      transform: translateY(calc(1.5em)) scale(1) !important;

      box-shadow: var(--shadow);
    }

    z-index: 100000 !important;
  }

  &.msgbox-type--info {
    border-color: var(--color-info);

    .icon {
      color: var(--color-info)
    }
  }
  &.msgbox-type--success {
    border-color: var(--color-success);

    .icon {
      color: var(--color-success);
    }
  }
  &.msgbox-type--warn {
    border-color: var(--color-warn);

    .icon {
      color: var(--color-warn);
    }
  }
  &.msgbox-type--error {
    border-color: var(--color-error);

    .icon {
      color: var(--color-error);
    }
  }

  @media screen and (max-width: 767px) {
    left: calc(50% - #{$mobile-box-width / 2});
    width: $mobile-box-width;
  }
}

</style>

<template>
  <div class="upload-wrapper flex flex-col items-center justify-center" :style="style">

    <input class="hidden" ref="file" :multiple="multiple" type="file" :accept="accept" @change="onUpload"/>

    <div v-if="drag" class="drop-box"
      @click="onChooseFile"
      @drop.stop.prevent="onDropFile"
      @dragenter.prevent
      @dragover.prevent
      >
      <div class="icon">
      </div>
      <div class="text">
        {{ placeholderDrop }}
      </div>
    </div>

    <s-btn v-if="!drag" full @click="onChooseFile"><slot>{{ placeholder }}</slot></s-btn>

  </div>

</template>

<script lang="ts">
import {Component, Vue, Prop} from 'vue-property-decorator';

import sBtn from './s-btn.vue';

@Component({
  components: {
    's-btn': sBtn,
  },
})
export default class SUpload extends Vue {
  @Prop({
    type: Boolean,
    default: false,
  })
  public multiple?: boolean;

  @Prop({
    type: String,
    default: false,
  })
  public accept?: boolean;

  @Prop({
    type: String,
    default: '上传文件',
  })
  public placeholder?: string;

  @Prop({
    type: String,
    default: '点击或拖动上传文件',
  })
  public placeholderDrop?: string;

  @Prop({
    type: Boolean,
    default: false,
  })
  public drag?: boolean;

  @Prop({
    type: String,
    default: '#454545',
  })
  public hoverColor?: string;

  @Prop({
    type: Function,
    default: () => Number,
  })
  public beforeUpload?: (files: FileList) => boolean;

  public onChooseFile(e: MouseEvent) {
    const fileInput: HTMLElement = this.$refs.file as HTMLElement;

    fileInput.click();
  }

  public onDropFile(e: DragEvent) {
    e.preventDefault();

    const dataTransfer: DataTransfer = e.dataTransfer as DataTransfer;

    const files: FileList = dataTransfer.files;

    this.upload(files);
  }

  // 注意这是附加在change事件上的 也就是说 如果前后两次上传的文件一样的话，那么第二次上传将不会触发这个事件
  public onUpload(e: Event) {
    const fileInput: HTMLInputElement = this.$refs.file as HTMLInputElement;

    const files: FileList | null = fileInput.files;

    if (!files) {
      return;
    }

    this.upload(files);
  }

  public upload(files: FileList) {
    if (this.beforeUpload && typeof this.beforeUpload === 'function') {
      this.beforeUpload(files);
    }
  }

  public get style(): object {
    return {
      '--color': '#909090',
      '--color-hover': this.hoverColor,
    };
  }
}
</script>

<style lang="scss" scoped>

.upload-wrapper {

  .drop-box {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;

    width: 100%;
    height: 100%;

    border: 2px dashed var(--color);
    border-radius: 8px;

    transition: 0.25s ease-in;

    cursor: pointer;

    .icon,
    .text {
      color: var(--color);

      transition: 0.2s ease-in;
    }
    .icon {
      color: var(--color);
    }
    .text {
      color: var(--color);
      font-size: 20px;
    }
  }

  &:hover {
    .drop-box {
      border-color: var(--color-hover);

      .icon,
      .text {
        color: var(--color-hover);
      }
    }
  }
}

</style>
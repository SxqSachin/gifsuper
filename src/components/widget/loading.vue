<template>
  <div class="loading" v-show="show">
    <div></div>
    <div></div>
    <div></div>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator';

@Component({ })
export default class Loading extends Vue {
  @Prop({type: Boolean, default: true})
  public show!: boolean;
}

</script>

<style lang="scss" scoped>
.loading {
  display: inline-block;
  height: 80px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
.loading div {
  margin-left: 6px;
  left: 8px;
  width: 16px;
  height: 32px;
  background: var(--r-third-bg);
  animation: loading 1.2s cubic-bezier(0, 1.22, 0.89, 1.18) infinite;

  &:first-child {
    margin-left: 0;
  }
}
.loading div:nth-child(1) {
  left: 8px;
  animation-delay: -0.24s;
}
.loading div:nth-child(2) {
  left: 32px;
  animation-delay: -0.12s;
}
.loading div:nth-child(3) {
  left: 56px;
  animation-delay: 0;
}
@keyframes loading {
  0% {
    height: 64px;
  }
  50%, 100% {
    height: 32px;
  }
}
</style>

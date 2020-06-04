<template>
  <div class="comment-wrapper p-4 sm:p-4 md:pb-12 lg:pb-12">
    <h1 id="pinglun" class="inline-block text-lg mb-4 border-t w-full pt-8">评论</h1>
    <div id="comment" class="comment  v"></div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({})
export default class Comment extends Vue {
  @Prop({ default: '' })
  public id!: string;

  @Prop({ default: '' })
  public appId!: string;

  @Prop({ default: '' })
  public appKey!: string;

  public async mounted() {
    // @ts-ignore
    const valine = new Valine();
    valine.init({
      el: '#comment',
      appId: this.appId,
      appKey: this.appKey,
      placeholder: '评论内容...',
      recordIP: true,
      requiredFields: ['nick', 'mail'],
      enableQQ: true,
      avatar: 'retro',
      path: `/article/detail/${this.id}`,
      // path: window.location.pathname, // **请确保必须写该属性,
    });
  }
}
</script>

<style lang="scss" scoped>
.comment-wrapper {
  margin: 0 auto;
  // padding: 3.5rem 0;

  width: 42vw;
  min-width: $xs;

  color: var(--content-text-color);
  font-size: 16px;

  @media (max-width: $xs) {
    // padding: 1.25rem;
    margin: 0;

    width: 100%;
    min-width: 100%;
  }

  /deep/ {
    a {
      color: var(--link-color);
    }

    .vwrap .vheader .vinput:focus {
      border-bottom-color: var(--color-info);
    }

    .vinput, .vbtn {
      color: var(--secondary-text-color);
    }

    .vpanel .vwrap > .vrow {
      border-top: 1px solid var(--border-color-light);
    }

    .vcards .vcard .vh .vmeta .vat {
      color: var(--link-color);
    }

    svg {
      fill: var(--secondary-text-color);
    }
  }
}
</style>
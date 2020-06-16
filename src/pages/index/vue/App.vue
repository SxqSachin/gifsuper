<template>
  <div class="wrapper p-4 sm:p-4 md:p-8 lg:p-8 max:w-screen w-full">

    <div v-if="!getNotification(1)" data-n-ver="1" class="w-full py-2 px-4 mb-8 rounded-md border border-color-info flex justify-between items-center">
      <div> 新功能：现在可以实时预览各项编辑操作啦！ </div>
      <div class="color-link transform rotate-45 text-2xl cursor-pointer" @click="clearNotification(1);"> + </div>
    </div>

    <!-- todo 严重bug 长度过大的gif上传后存在内存爆栈 导致标签页假死 -->
    <div class="top mb-6">
      <upload class="uploader mx-auto" :before-upload="upload" accept=".gif">上传GIF</upload>
    </div>

    <div v-show="!!oriImageSrc" class="w-full flex items-center p-4 pb-0 bg-assets shadow hover:shadow-lg transition-shadow transition-time-func rounded-md rounded-bl-none rounded-br-none">
      <div class="w-full">
        <div class="flex">
          <div class="flex-auto">
            <label v-show="canEdit || isGenerating" for="srcgif" class="inline-block block">预览：</label>
            <label v-show="canEdit || isGenerating" for="srcgif" class="hidden md:block w-full">点击添加的文字/图片来进行缩放/旋转操作。可用鼠标框选元素。</label>
            <label v-show="canEdit || isGenerating" for="srcgif" class="block md:hidden w-full">点击添加的文字/图片来进行缩放/旋转操作。（长按+拖动）可框选元素。</label>
          </div>
          <div class="flex-0 w-6">
          </div>
        </div>

        <div id="srcgif" class="flex justify-center items-center hidden"> </div>

        <div v-show="!!oriImageSrc && oriGifLoadProgress < 1" class="flex flex-col justify-center items-center">
          <img ref="oriImageDom" :src="oriImageSrc" alt="" srcset=""/>
          <div v-show="!!oriImageSrc && oriGifLoadProgress < 1" class="mask w-full h-full float-left absolute flex justify-center items-center bg-opacity-75 bg-gray-800 text-white text-lg text-center" :style="{width: `${showWidth}px`, height: `${showHeight}px`}"> 
            读取数据中： {{ Math.max(0, (oriGifLoadProgress * 100 - 1).toFixed(0)) }} %
          </div>
        </div>
      </div>

    </div>
    <div v-show="!!oriImageSrc" :class="{'sticky top-0': stickyPreviewCanvas}" class="z-50 w-full flex mb-4 items-center p-4 pt-0 bg-assets shadow hover:shadow-lg transition-shadow transition-time-func rounded-md rounded-tl-none rounded-tr-none">
      <div class="src w-full">
        <div ref="edit-canvas" v-show="!!oriImageSrc && oriGifLoadProgress === 1" class="mt-4">
          <div class="flex justify-center items-center w-full">
            <canvas id="edit-canvas"> </canvas>
          </div>

          <div class="w-full h-full flex justify-center items-center text-white text-lg text-center pointer-events-none">
            <img class="float-left absolute transform -translate-y-1/2" :style="{width: `${showWidth}px`, height: `${showHeight}px`}" v-show="!!curPreviewImg" :src="curPreviewImg" alt="当前预览帧"/>
          </div>

          <div class="mt-2 flex justify-between flex-wrap" v-show="!!oriImageSrc && oriGifLoadProgress === 1">

            <div class="flex justify-center items-center mb-2 w-full">
              <slider class="flex-auto"
                v-model="curFrameSlider"
                :min="Math.max(1, getUsefulFrame()[0])"
                :max="getUsefulFrame().length"
                :disabled="!canEdit"
                :drag-on-click="true"
                :duration="0"
                @change="onCurFrameChange"
               ></slider>
            </div>
            <div class="flex justify-between w-full">
              <div class="flex flex-wrap">
                <sbtn title="删除当前选中元素" @click="preview.removeActiveObjects()" type="error" style="padding-left: 0.45rem; padding-right: 0.45rem;">
                  <img class="w-6 h-6 flex-shrink-0 cursor-pointer" src="/static/icons/trash.svg"/>
                </sbtn>
              </div>
              <div class="flex flex-no-wrap">
                <sbtn class="rounded-tr-none rounded-br-none" title="第一帧" type="ghost" @click="preview.setPreviewFrame(0)" style="padding-left: 0.25rem; padding-right: 0.25rem;">
                  <img class="w-6 h-6 flex-shrink-0 cursor-pointer" src="/static/icons/play-skip-back.svg"/>
                </sbtn>
                <sbtn class="rounded-none border-l-0" title="上一帧" type="ghost" @click="preview.setPreviewFrame(preview.curFramePointer - 1)" style="padding-left: 0.25rem; padding-right: 0.25rem;">
                  <img class="w-6 h-6 flex-shrink-0 cursor-pointer" src="/static/icons/play-back.svg"/>
                </sbtn>
                <sbtn class="rounded-none border-l-0" title="播放/暂停" type="ghost" @click="togglePause" style="padding-left: 0.25rem; padding-right: 0.25rem;">
                  <img v-show="!!aaa" class="w-6 h-6 flex-shrink-0 cursor-pointer" src="/static/icons/play.svg"/>
                  <img v-show="!aaa" class="w-6 h-6 flex-shrink-0 cursor-pointer" src="/static/icons/pause.svg"/>
                </sbtn>
                <sbtn class="rounded-none border-l-0" title="下一帧" type="ghost" @click="preview.setPreviewFrame(preview.curFramePointer + 1)" style="padding-left: 0.25rem; padding-right: 0.25rem;">
                  <img class="w-6 h-6 flex-shrink-0 cursor-pointer" src="/static/icons/play-forward.svg"/>
                </sbtn>
                <sbtn class="rounded-tl-none rounded-bl-none" title="最后一帧" type="ghost" @click="preview.setPreviewFrame(preview.frameArray.length - 1)" style="padding-left: 0.25rem; padding-right: 0.25rem;">
                  <img class="w-6 h-6 flex-shrink-0 cursor-pointer" src="/static/icons/play-skip-forward.svg"/>
                </sbtn>
              </div>
              <div class="flex flex-wrap">
                <sbtn class="ml-2" title="开启/关闭 固定" type="ghost" @click="stickyPreviewCanvas = !stickyPreviewCanvas" style="padding-left: 0.25rem; padding-right: 0.25rem;">
                  <img v-show="stickyPreviewCanvas" style="width: 1.7rem;" class="h-6 flex-shrink-0 cursor-pointer" src="/static/icons/pin.png"/>
                  <img v-show="!stickyPreviewCanvas" style="width: 1.6rem; height: 1.6rem;" class="flex-shrink-0 cursor-pointer" src="/static/icons/pin-1.png"/>
                </sbtn>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <fieldset v-if="!canEdit && !oriImageSrc" class="pb-4">
      <h2 class="font-normal text-lg color-info"> 提示： 上传Gif后可在下方进行编辑 </h2>
    </fieldset>

    <div class="edit-panel w-full px-1 py-1 md:px-6 md:py-3 rounded-md border-color-2 flex flex-col">

      <div class="flex flex-row">
        <ul class="flex flex-row">
          <li
            class="flex items-center py-2 px-3 bg-body cursor-pointer rounded-md rounded-bl-none rounded-br-none"
            :class="{'bg-assets shadow': curTab === 'base'}"
            @click="switchTab('base')"
          >
            <img class="w-4 h-4 flex-shrink-0" src="/static/icons/hammer.svg"/>
            <span class="ml-2 md:inline" :class="{inline: curTab === 'base', 'hidden': curTab !== 'base'}">基础设置</span>
          </li>
          <li
            class="flex items-center py-2 px-3 bg-body cursor-pointer rounded-md rounded-bl-none rounded-br-none"
            :class="{'bg-assets shadow': curTab === 'addText'}"
            @click="switchTab('addText')"
          >
            <img class="w-4 h-4 flex-shrink-0" src="/static/icons/text.svg"/>
            <span class="ml-2 md:inline" :class="{inline: curTab === 'addText', 'hidden': curTab !== 'addText'}">添加文字</span>
          </li>
          <li
            class="flex items-center py-2 px-3 bg-body cursor-pointer rounded-md rounded-bl-none rounded-br-none"
            :class="{'bg-assets shadow': curTab === 'addPic'}"
            @click="switchTab('addPic')"
          >
            <img class="w-4 h-4 flex-shrink-0" src="/static/icons/image.svg"/>
            <span class="ml-2 md:inline" :class="{inline: curTab === 'addPic', 'hidden': curTab !== 'addPic'}">添加图片</span>
          </li>
          <li
            class="flex items-center py-2 px-3 bg-body cursor-pointer rounded-md rounded-bl-none rounded-br-none"
            :class="{'bg-assets shadow': curTab === 'cut'}"
            @click="switchTab('cut')"
          >
            <img class="w-4 h-4 flex-shrink-0" src="/static/icons/cut.svg"/>
            <span class="ml-2 md:inline" :class="{inline: curTab === 'cut', 'hidden': curTab !== 'cut'}">帧裁剪</span>
          </li>
        </ul>
      </div>

      <div class="flex-auto flex flex-col mr-0 mb-4 w-full">

        <fieldset class="flex items-start flex-col p-4 w-full bg-assets shadow hover:shadow-lg transition-shadow transition-time-func rounded-md rounded-tl-none"
          v-show="curTab === 'base'"
          >
          <section class="flex flex-col flex-auto w-full">
            <h2 class="mb-4 text-lg"> 图片信息 </h2>

            <div class="flex w-full">
              <div class="flex items-center mb-4 mr-0 md:mr-4 w-full md:w-auto">
                <label for="interval" class="whitespace-no-wrap flex-0 inline-block">总帧数：</label>
                <div>{{ this.frameList.length }}</div>
              </div>
              <div class="flex items-center mb-4 mr-0 md:mr-4 w-full md:w-auto">
                <label for="interval" class="whitespace-no-wrap flex-0 inline-block">大小：</label>
                <div>{{ this.rawFile ? +(this.rawFile.size / (1024 * 1024)).toFixed(2) : 0 }}MB</div>
              </div>
            </div>
          </section>

          <section class="flex flex-col flex-auto mt-4 w-full">
            <h2 class="mb-4 text-lg"> 基础调整 </h2>

            <div class="flex flex-col justify-center items-start mb-4 pb-8 w-full">
              <label for="">
                <span>帧间隔：</span>
                <span class="inline-block pb-2 text-color-neutral text-sm border-gray-400">毫秒单位，帧间隔越小，生成后的Gif就越流畅，同时总时长变短</span>
              </label>

              <slider class="flex-auto"
                v-model="interval"
                :min="15"
                :max="300"
                :marks="[15, 300]"
                :lazy="true"
                :disabled="!canEdit"
                :drag-on-click="true"
                :contained="true"
                @change="renderPreview"
                tooltip="always"
                tooltip-placement="bottom"
                style="width: calc(100% - 14px);"
               ></slider>
            </div>

            <div class="flex flex-col">
              <sbtn class="mr-0 w-full mb-1" title="开启后生成的Gif将会是原Gif的倒放版" :disabled="!canEdit" type="info" @click="toggleRevert">倒放：{{ revert ? '开' : '关' }}</sbtn>
              <sbtn class="mr-0 w-full mb-1" title="开启后生成的Gif将会循环播放，关闭后则只会进行1次播放循环" :disabled="!canEdit" @click="toggleRepeat">循环：{{ repeat ? '开' : '关' }}</sbtn>
              <!-- <sbtn class="mr-0 w-full md:w-auto md:mr-4 mb-1" title="开启后将会抽去原Gif中一般的帧数，可以减小文件大小，代价是Gif流畅程度将会下降" :disabled="!canEdit" @click="toggleRs">抽帧：{{ rs ? '开' : '关' }}</sbtn> -->
              <!-- <sbtn class="mr-0 w-full md:w-auto md:mr-4 mb-1" title="重置时间轴" :disabled="!canEdit" type="error" @click="makeTimeline">重置</sbtn> -->
            </div>
          </section>

        </fieldset>

        <fieldset class="flex items-start flex-col p-4 w-full bg-assets shadow hover:shadow-lg transition-shadow transition-time-func rounded-md"
          v-show="curTab === 'addText'"
          >

          <section class="flex flex-col w-full">
            <div class="flex justify-center items-center mb-4 w-full">
              <label for="" class="whitespace-no-wrap">文字内容：</label>
              <s-input class="w-full" v-model="textContent" placeholder="请输入内容，支持Emoji等表情符号"></s-input>
            </div>

            <div class="flex items-center mb-4">
              <label for="" class="whitespace-no-wrap">文字颜色：</label>
              <color-picker class="z-40 ml-0 border border-gray-500" v-model="textColorObj"></color-picker>
            </div>

            <div class="flex justify-center items-center mb-4 pb-8 w-full">
              <label for="" class="whitespace-no-wrap">文字大小：</label>
              <slider class="flex-auto"
                v-model="textSize"
                :marks="[10, 128]"
                :min="10"
                :max="128"
                :lazy="true"
                :disabled="!canEdit"
                :drag-on-click="true"
                tooltip="always"
                tooltip-placement="bottom"
               ></slider>
            </div>

            <section class="flex flex-col w-full mb-4">
              <div class="flex flex-row items-center mb-4">
                <span>文字边线：</span><sbtn :disabled="!canEdit" @click="enableTextStroke = !enableTextStroke">{{ !enableTextStroke ? '开启' : '关闭' }}</sbtn>
              </div>

              <div class="flex flex-col justify-start w-full" v-show="enableTextStroke">
                <div class="flex items-center mb-4">
                  <label for="" class="whitespace-no-wrap">字边线色：</label>
                  <color-picker class="z-40 ml-0 border border-gray-500" v-model="textStrokeObj"></color-picker>
                </div>

                <div class="flex justify-center items-center pb-8 w-full">
                  <label for="" class="whitespace-no-wrap">边线粗细：</label>
                  <slider class="flex-auto"
                    v-model="textStrokeWidth"
                    :marks="[1, 12]"
                    :min="1"
                    :max="12"
                    :lazy="true"
                    :disabled="!canEdit"
                    :drag-on-click="true"
                    tooltip="always"
                    tooltip-placement="bottom"
                   ></slider>
                </div>

              </div>
            </section>

            <div class="flex flex-col justify-center items-start mb-4 pb-8 w-full">
              <label for="">
                <span>范围添加文字</span>
                <sup class="text-red-400"> new </sup>
                <span>：</span>
                <span class="inline-block pb-2 text-color-neutral text-sm border-gray-400">只在指定范围内添加文字</span>
              </label>

              <slider class="flex-auto pt-0"
                v-model="addTextRange"
                :disabled="!canEdit"
                :min="1"
                :max="!!this.frameList.length ? this.frameList.length : 10"
                :marks="[1, (!!this.frameList.length ? this.frameList.length : 10)]"
                :contained="true"
                tooltip="always"
                tooltip-placement="bottom"
                style="width: calc(100% - 14px);"
                @dragging="renderPreviewImage"
                @drag-end="curPreviewImg = ''"
               ></slider>
            </div>

            <div class="flex w-full justify-around items-center mb-4">
              <sbtn class="w-full" @click="addText" :disabled="!canEdit">添加文字</sbtn>
            </div>

            <p class="flex flex-col text-lg">
              <span class="inline-block pb-2 text-color-neutral text-sm font-normal border-gray-400">添加文字后，可于上方“预览”处，对文字进行位置、缩放、旋转等调整。</span>
              <span class="inline-block pb-2 text-color-neutral text-sm font-normal border-gray-400">也可于下方“时间轴”处进行更细粒度的调整。</span>
            </p>

          </section>

        </fieldset>

        <fieldset class="flex items-start flex-col p-4 w-full bg-assets shadow hover:shadow-lg transition-shadow transition-time-func rounded-md"
          v-show="curTab === 'addPic'"
          >
          <div class="flex flex-col justify-center items-start w-full">
            <label for="" class="whitespace-no-wrap mb-1">
              <span> 添加图片 </span>
              <sup class="text-red-300"> Beta! </sup>
              <span>：</span>
            </label>
            <span class="inline-block pb-2 text-color-neutral text-sm border-gray-400">若上传的图片尺寸过大，请至“预览”处拖动并调整大小。</span>
          </div>

          <div class="flex flex-col justify-center items-start mb-4 pb-8 w-full">
            <label for="">
              <span>范围添加图片</span>
              <sup class="text-red-400"> new </sup>
              <span>：</span>
              <span class="inline-block pb-2 text-color-neutral text-sm border-gray-400">只在指定范围内添加图片</span>
            </label>

            <slider class="flex-auto pt-0"
              v-model="addImgRange"
              :disabled="!canEdit"
              :min="1"
              :max="!!this.frameList.length ? this.frameList.length : 10"
              :marks="[1, (!!this.frameList.length ? this.frameList.length : 10)]"
              :contained="true"
              tooltip="always"
              tooltip-placement="bottom"
              @dragging="renderPreviewImage"
              @drag-end="curPreviewImg = ''"
              style="width: calc(100% - 14px);"
             ></slider>
          </div>

          <upload class="mt-4 uploader w-full" :before-upload="addImage" :disabled="!canEdit">添加图片</upload>

        </fieldset>

        <fieldset class="flex items-start flex-col p-4 w-full bg-assets shadow hover:shadow-lg transition-shadow transition-time-func rounded-md"
          v-show="curTab === 'cut'"
          >
          <section class="flex flex-col justify-center items-start mb-4 w-full">
            <label for="">
              <span>区间裁剪：</span>
              <span class="inline-block pb-2 text-color-neutral text-sm border-gray-400">保留你感兴趣的片段</span>
            </label>

            <div class="pb-8 w-full">
              <slider class="flex-auto py-0"
                v-model="frameSplitRange"
                :disabled="!canEdit"
                :min="1"
                :max="!!this.frameList.length ? this.frameList.length : 10"
                :marks="[1, (!!this.frameList.length ? this.frameList.length : 10)]"
                :contained="true"
                tooltip="always"
                tooltip-placement="bottom"
                :lazy="true"
                @change="renderPreview"
                @dragging="renderPreviewImage"
                @drag-end="curPreviewImg = ''"
                style="width: calc(100% - 14px);"
               ></slider>
            </div>
          </section>

          <section class="flex flex-col justify-center items-start w-full">
            <label for="">
              <span>区间去除：</span>
              <!-- <span class="inline-block pb-2 text-color-neutral text-sm border-gray-400">删除指定区间内的帧，受制于区间裁剪数值</span> -->
              <span class="inline-block pb-2 text-color-neutral text-sm border-gray-400">删除你不感兴趣的片段</span>
            </label>

            <div class="flex flex-row items-center">
              <sbtn :disabled="!canEdit" @click="enableFrameRangeRemove = !enableFrameRangeRemove; renderPreview()">{{ !enableFrameRangeRemove ? '开启' : '关闭' }}</sbtn>
            </div>

            <div class="pb-8 w-full mt-4"
              v-show="enableFrameRangeRemove"
            >
              <slider class="flex-auto w-full"
                :disabled="!canEdit"
                ref="frameRemoveRange"
                v-model="frameRemoveRange"
                :min="frameSplitRange[0]"
                :max="frameSplitRange[1]"
                :marks="[frameSplitRange[0], frameSplitRange[1]]"
                :contained="true"
                tooltip="always"
                tooltip-placement="bottom"
                :lazy="true"
                @change="renderPreview"
                @dragging="renderPreviewImage"
                @drag-end="curPreviewImg = ''"
                style="width: calc(100% - 14px);"
               ></slider>
            </div>
          </section>
        </fieldset>

        <fieldset class="pt-8 ">
          <sbtn title="应用修改" @click="applyPreview2Timeline" type="success" :disabled="!canEdit">将修改应用到时间轴</sbtn>
          <span class="inline-block py-2 mb-4 text-color-neutral text-sm border-gray-400">若进行过“添加文字/图片”操作，则在生成最终结果前，需要先将修改应用到时间轴，等到提示“应用成功”后方可生成GIF。</span>
          <sbtn type="success" @click="generate" :disabled="isGenerating || !canEdit">生成</sbtn>
          <span class="inline-block py-2 text-color-neutral text-sm border-gray-400">tips: 受原Gif大小影响，点击“生成”按钮后可能会有短暂卡顿，此时耐心等候即可。</span>
        </fieldset>
      </div>

      <div v-show="isGenerating || generateDone" class="flex-0 w-full p-4 bg-assets shadow hover:shadow-lg transition-shadow transition-time-func rounded-md">
        <label for="" class="hidden md:inline" v-show="generateDone">新图像：（保存图片：右击图片->图片另存为）</label>
        <label for="" class="inline md:hidden" v-show="generateDone">新图像：（长按图片->保存图片）</label>

        <div class="flex justify-center h-full items-center mt-4">
          <div class="my-12 md:my-0" v-show="isGenerating">
            <div class="mb-12 text-center">生成中： {{progress}}%</div>

            <div class="loading-calm-cat"></div>
          </div>

          <div v-show="!isGenerating">
            <div id="dtsgif" class="mt-4 md:mt-0 flex justify-center items-center"> </div>
          </div>
        </div>
      </div>

    </div>

    <div class="timeline p-2 bg-assets shadow hover:shadow-lg transition-shadow transition-time-func rounded-md">
      <label class="inline-block pb-4">
        <span> 时间轴</span>
        <sup class="text-red-300"> alpha </sup>
        <span class="hidden md:inline">：（delete键：删除当前选中文字/图片）</span>
      </label>
      <div class="mb-4">
        <p class="mb-2 text-color-neutral text-sm font-normal">在这里你可以对添加的文字/图片进行逐帧调整。</p>
        <p class="text-color-neutral text-sm font-normal">
          在这里进行修改后直接点击“生成”按钮生成GIF即可，切勿点击“将修改应用到时间轴”按钮，否则您在时间轴中的修改将会被还原。
        </p>
      </div>
      <div class="md:hidden my-2 flex justify-start flex-wrap">
        <sbtn class="mb-1" title="删除当前选中元素" @click="deleteActivedObject" type="error">删除当前选中文字/图片</sbtn>
      </div>
      <div ref="timeline-wrapper" class="canvas-wrapper border rounded-sm border-gray-300">
        <canvas id="stage"></canvas>
        <canvas id="dragbar"></canvas>
      </div>
    </div>

  </div>
</template>

<script lang="ts">

import { Vue, Component, Prop } from 'vue-property-decorator';

import Upload from '@/components/widget/s-upload.vue';
import sbtn from '@/components/widget/s-btn.vue';
import sInput from '@/components/widget/s-input.vue';

import VueSlider from 'vue-slider-component';
import 'vue-slider-component/theme/default.css';

import { Chrome as ColorPicker } from 'vue-color';

import { parseSrcGif, dataUrlToFile, GifGenerator, GifFrameList, GifFrame } from '@/js/gif';

import { fabric } from 'fabric';

const FrameIndex = 1;
const TextZIndex = 10;

interface GenerateOption {
  baseInterval: number;

  generateRange: [number, number];
  removeRange?: [number, number];
}

import { RangedFrameObject } from './js/type';
import { GifPreview } from './js/preview';
import { Toasted } from './js/type';

@Component({
  components: {
    'upload': Upload,
    sbtn,
    's-input': sInput,
    slider: VueSlider,
    'color-picker': ColorPicker,
  },
})
export default class extends Vue implements Toasted {
  // fabric canvas对象
  public canvas!: fabric.Canvas;
  public dragBarCanvas!: fabric.Canvas;
  public dragBar!: fabric.Object;

  // 添加图片裁剪用canvas
  // public previewCanvas!: fabric.Canvas;
  public stickyPreviewCanvas: boolean = false;
  public curPreviewImg: string = '';
  public pausePreview: boolean = false;

  public curFrameSlider: number = 1;

  public previewFramePointer: number = 0;

  // 上传的Gif
  public rawFile: File = null;
  public oriImageSrc: string = '';

  // 原图片宽高
  public oriWidth: number = 0;
  public oriHeight: number = 0;

  // 表面显示图片宽高
  public showWidth: number = 0;
  public showHeight: number = 0;


  // 帧列表
  public frameList: GifFrameList = [];
  public oriFrameList: any[] = [];

  public generateOption: {[key: string]: any};

  public oriGifLoadProgress: number = 0;

  // 默认帧间隔
  public interval: number = 60;

  public isGenerating: boolean = false;
  public generateDone: boolean = false;


  // 文字操作 start
  public textContent: string = '';
  public textColorObj: {[key: string]: string} = { hex: '#fff' };
  public textStrokeObj: {[key: string]: string} = { hex: '#000' };
  public textSize: string = '42';
  public textStrokeWidth: number = 1;

  public addTextRange: [number, number] = [1, 1]; // 添加文字起始值

  public enableTextStroke: boolean = false;
  // 文字操作 end


  // 图片操作 start
  public addImgRange: [number, number] = [1, 1]; // 添加图片起始值
  // 图片操作 end


  // 帧区间裁剪 start
  public frameSplitRange: [number, number] = [1, 10]; // 区间裁剪起始值
  // 帧区间裁剪 end


  // 帧区间去除 start
  public enableFrameRangeRemove: boolean = false;
  public frameRemoveRange: [number, number] = [1, 1]; // 区间去除起始值
  // 帧区间去除 end


  // 倒放
  public revert: boolean = false;

  // 单帧宽/高度
  public frameWidth: number = 0;
  public frameHeight: number = 0;

  // 生成进度
  public progress: number = 0;

  // 是否循环
  public repeat: boolean = true;

  // 是否抽帧
  public rs: boolean = false;

  // timeline偏移值
  public timelineLeft: number = 0;

  public clipboard: any[] = [];


  public preview!: GifPreview;

  get canEdit(): boolean {
    return !!this.frameList?.length;
  }

  get textColor(): string {
    return this.textColorObj?.hex8 ?? '#fff';
  }

  get textStrokeColor(): string {
    return this.textStrokeObj?.hex8 ?? '#000';
  }

  get totalFrameCount(): number {
    return this.frameList.length;
  }

  get enabledFrame(): number[] {
    return Array.from(new Array(this.frameList.length).keys());
  }

  public mounted() {
    document.getElementById('loading-ph')?.remove();

    fabric.Object.prototype.objectCaching = false;

    this.canvas = new fabric.Canvas('stage');

    this.dragBarCanvas = new fabric.Canvas('dragbar');

    // this.previewCanvas = new fabric.Canvas();
    this.preview = new GifPreview('edit-canvas', this);

    this.initKeyPressEvent();
  }

  /**
   * 返回一个图片文件的blob url路径，以及它的宽高
   */
  public async getImageData(file: File): Promise<GifFrame> {
    return new Promise(resolve => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const data = {
          imgFileSrc: img.src,
          width: img.width,
          height: img.height,
        };
        img.remove();
        resolve(data);
      }
      img.src = url;
    });
  }

  public async upload(e: FileList) {
    const gifFile = e[0];

    if (gifFile.type !== 'image/gif') {
      this.toast('只支持上传Gif文件', 'error');
      return;
    }

    if (!gifFile || !this.canvas) {
      return;
    }

    this.rawFile = gifFile;

    const { width, height, imgFileSrc } = await this.getImageData(gifFile);
    const imgDOM = this.$refs.oriImageDom as HTMLImageElement;

    this.oriWidth = width;
    this.oriHeight = height;

    // 监听图片加载完成事件 如果不等待图片显示完成 获取到的showWidth/Height将会是异常值
    const oriImageOnLoadPromise = new Promise(resolve => {
      imgDOM.onload = () => {
        resolve();
      }
    });
    this.oriImageSrc = imgFileSrc;
    await oriImageOnLoadPromise;

    const {width: showWidth, height: showHeight} = imgDOM;
    this.showWidth = showWidth;
    this.showHeight = showHeight;

    this.resetStage();

    const frameList = await parseSrcGif(gifFile, (cur, total) => {
      this.oriGifLoadProgress = cur / total;
    });
    this.oriGifLoadProgress = 1;

    this.frameList = frameList;
    this.oriFrameList = frameList;

    this.updateEditData();

    await this.makeTimeline(frameList);
    await this.preview.initPreviewCanvas(frameList, showWidth, showHeight);

    await this.renderPreview();
  }

  public toggleRevert() {
    this.revert = !this.revert;

    this.renderPreview();
    this.toast(`已${this.revert ? '开启' : '关闭'}倒放`, 'info')
  }

  public toggleRepeat() {
    this.repeat = !this.repeat;

    this.renderPreview();

    this.toast(`已${this.repeat? '开启' : '关闭'}循环播放`, 'info')
  }

  public toggleRs() {
    this.rs = !this.rs;

    this.renderPreview();

    this.toast(`已${this.rs? '开启' : '关闭'}抽帧${this.rs? '，将抽去原Gif一半的帧数' : ''}`, 'info')
  }

  public resetStage() {
    const srcgifDOM = document.querySelector('#srcgif');

    if (srcgifDOM) {
      srcgifDOM.innerHTML = '';
    }

    if (!!this.canvas) {
      this.canvas.clear();
    }
  }

  public async makeTimeline(frameList: GifFrameList) {
    if (!this.canvas) {
      console.error('makrTimeline: canvas not ready');
      return;
    }

    if (!frameList) {
      frameList = this.oriFrameList;
    }

    this.canvas.getObjects().forEach(obj => {
      // @ts-ignore
      if (obj.frameData) {
        this.canvas.remove(obj);
      }
    })

    const firstImg = frameList[0];

    const frameWidth = this.frameWidth = this.oriWidth; // firstImg.width as number;
    const frameHeight = this.frameHeight = this.oriHeight; // firstImg.height as number;

    const canvasTotalWidth = (frameWidth + 1) * this.totalFrameCount;
    const canvasHeight = frameHeight as number;

    const timelineWrapperWidth = (this.$refs['timeline-wrapper'] as HTMLElement).offsetWidth - 2;

    const scale = 1;
    const divideWidth = 1;

    this.canvas.setWidth(timelineWrapperWidth);
    this.canvas.setHeight(canvasHeight);

    this.frameList = frameList.map((frame, index) => {
      const percent = (index + 1) / frameList.length;
      fabric.Image.fromURL(frame.imgFileSrc, img => {
        if (!img.width || !img.height) {
          return;
        }

        const curWidth = img.width * scale;
        const curHeight = img.height * scale;

        const nimg = img.set({
          left: index * (curWidth + divideWidth),
          top: 0,
          width: img.width,
          name: 'frame' + index,
          type: 'timeline-frame',
          lockMovementX: true,
          lockMovementY: true,
          hasControls: false,
          selectable: false,
        }).scale(scale);

        // @ts-ignore
        nimg.frameIndex = index;
        // @ts-ignore
        nimg.frameData = frame;

        this.canvas.add(nimg);
      });

      return frame;
    });

    this.resetDragBar(timelineWrapperWidth, canvasTotalWidth);
  }

  public resetDragBar(containerWidth: number, totalFrameWidth: number) {
    this.dragBarCanvas.clear();

    if (containerWidth >= totalFrameWidth) {
      return;
    }

    this.dragBarCanvas.setWidth(containerWidth);
    this.dragBarCanvas.setHeight(30);

    const percent = (containerWidth / totalFrameWidth);

    const dragBarWidth =  percent * containerWidth;
    const dragBar = new fabric.Rect({
      name: 'dragbar',
      width: Math.max(dragBarWidth, 25),
      height: 25,

      top: 0,
      left: 0,

      fill: '#777777',
      lockMovementY: true,
      hasControls: false,
    }).on('moving', ({target}) => {
      let left = target.left as number;

      if (left + dragBarWidth >= containerWidth) {
        left = containerWidth - dragBarWidth;
      }
      if (left < 0) {
        left = 0;
      }

      this.timelineLeft = left;

      dragBar.set({
        left,
      });

      this.canvas.absolutePan(new fabric.Point(left / percent, 0));
    });


    this.dragBarCanvas.add(dragBar);

    this.dragBar = dragBar;

    dragBar.set({
      left: this.timelineLeft,
    });
    dragBar.fire('move');
    // this.dragBarCanvas.renderAll();
  }

  // 将#时间轴#中的每一帧合并为GIF
  public async generate() {
    if (!this.canvas) {
      console.error('generate: canvas not ready');
      return;
    }

    this.generateDone = false;

    this.progress = 0;
    this.isGenerating = true;

    const { width, height } = { width: this.oriWidth, height: this.oriHeight };
    const totalWidth = (width + 1) * this.totalFrameCount;

    const gif = new GifGenerator({
      repeat: this.repeat ? 0 : -1,
      width: this.oriWidth,
      height: this.oriHeight,
    });

    this.canvas.absolutePan(new fabric.Point(0, 0));

    const dataUrlArr: string[] = [];

    // 处理帧裁剪数据
    const startFrameIndex = (this.frameSplitRange[0] - 1);
    const endFrameIndex = (this.frameSplitRange[1]);

    const removeRangeStartIndex = this.frameRemoveRange[0] - 1;
    const removeRangeEndIndex = this.frameRemoveRange[1] - 1;

    for (let i = startFrameIndex; i < endFrameIndex; (this.rs ? i+=2 : i++))  {
      if (this.enableFrameRangeRemove && i >= removeRangeStartIndex && i <= removeRangeEndIndex) {
        continue;
      }

      const durl = this.canvas.toDataURL({
        width,
        height,
        left: !this.revert ? (width + 1) * i : totalWidth - (width + 1) * (i + 1),
        top: 0,
        format: 'png',
      });

      dataUrlArr.push(durl);
    }

    if (!dataUrlArr.length) {
      this.isGenerating = false;
      this.generateDone = true;

      this.toast('帧数据为空，取消生成', 'info');
      return;
    }

    gif.addDataUrl(dataUrlArr, {delay: this.interval});

    await gif.renderToElem('#dtsgif', (progress: number) => {
      this.progress = Math.ceil(progress * 100);
    });

    this.isGenerating = false;
    this.generateDone = true;
  }

  public initKeyPressEvent() {
    window.onkeypress = (e: KeyboardEvent) => {
      const keycode = e.keyCode;

      if (keycode === 127) { // Delete
        this.deleteActivedObject();
        return;
      }
    };

    window.onkeydown = (e: KeyboardEvent) => {
      const activedObjects = this.canvas.getActiveObjects();

      // @ts-ignore
      const allFrames = activedObjects.every(item => !!item.frameData);
      // @ts-ignore
      const objs = activedObjects.filter(item => !item.frameData);

      const keycode = e.keyCode;


      if (keycode === 67 && e.ctrlKey) { // ctrl + c
        this.onCopy();
        return;
      }

      if (keycode === 86 && e.ctrlKey) { // ctrl + v
        this.onPaste();
        return;
      }
    };
  }

  public onCopy() {
    let activedObjects = this.canvas.getActiveObjects();

    const frameList = this.frameList;

    if (!frameList || !frameList.length || !activedObjects.length) {
      return;
    }

    let frameCount = 0;
    let objCount = 0;

    activedObjects.forEach(item => {
      // @ts-ignore
      if (item.frameData) {
        frameCount++;
      } else {
        objCount++;
      }
    });

    this.clipboard.length = 0;
    this.clipboard.push(...activedObjects);

    this.toast(`已复制${frameCount}帧、${objCount}个对象`, 'success');
  }

  public onPaste() {
    const activedObjects = this.canvas.getActiveObjects();

    const frameList = this.frameList;

    if (!frameList || !frameList.length || !activedObjects.length) {
      return;
    }

    const copiedFrame = this.clipboard.filter(item => item.frameData);

    const copiedObj = this.clipboard.filter(item => !item.frameData);

    let activeFrame = null;

    activedObjects.forEach(item => {
      // @ts-ignore
      if (item.frameData) {
        activeFrame = item;
      }
    });

    if (activeFrame && copiedFrame.length) {
      // @ts-ignore
      const index = activeFrame.frameIndex;

      frameList.splice(index + 1, 0, ...copiedFrame.map(item => item.frameData));

      this.toast(`已粘贴${copiedFrame.length}帧`, 'success');

      this.makeTimeline(frameList);
    }

    if (copiedObj.length) {

      copiedObj.forEach(obj => {
        obj.clone((cloneObj: fabric.Object) => {
          cloneObj.set({
            left: ((obj.left || 0) + 16),
            top: ((obj.top || 0) + 16),
          })
          this.canvas.add(cloneObj);
          this.canvas.setActiveObject(cloneObj);
        })
      });

      this.canvas.renderAll();

      // @ts-ignore
      this.toast(`已粘贴${this.copiedObj.length}个对象`, 'success');
    }

  }

  public deleteActivedObject() {
    const activedObjects = this.canvas.getActiveObjects();

    if (!activedObjects.length) {
      this.toast('当前没有选中元素', 'error');
      return;
    }

    this.canvas.remove(...activedObjects);

    this.toast('删除成功', 'success');
  }

  // 更新可编辑内容
  public updateEditData() {
    this.frameSplitRange = [1, this.frameList.length];
    this.addTextRange = [1, this.frameList.length];
    this.addImgRange = [1, this.frameList.length];
    this.frameRemoveRange = [1, 1];
  }

  public toast(msg: string, type: string = 'info', duration: number = 3000) {
    // @ts-ignore
    this.$message(msg, { type, duration})
  }

  public curTab: string = 'base';
  public switchTab(tab: string) {
    this.curTab = tab;
  }

  public addImage(imgList: FileList) {
    this.preview.addImage(imgList, this.expandRange2Array(this.addImgRange))
  }
  public addText() {
    const { textContent, textSize, textColor, textStrokeColor, textStrokeWidth, addTextRange } = this;

    this.preview.addText(textContent, {
      size: parseInt(textSize),
      color: textColor,
      enableStroke: this.enableTextStroke,
      strokeWidth: textStrokeWidth,
      strokeColor: textStrokeColor,
    }, this.expandRange2Array(this.addTextRange))
  }

  public renderPreview() {
    const usefulFrame= this.getUsefulFrame();
    const curFrame = this.curFrameSlider;

    this.curFrameSlider = Math.min(usefulFrame[curFrame], usefulFrame[usefulFrame.length - 1]);

    this.preview.updateOptions({
      revert: this.revert,
      repeat: this.repeat,
    });
    
    this.preview.renderPreview(this.getUsefulFrame(), this.interval, index => {
      this.curFrameSlider = index;
    });
  }

  public onCurFrameChange(curFrame) {
    if (isNaN(curFrame)) {
      curFrame = 0;
    }

    this.preview.setPreviewFrame(curFrame);
  }

  public setPreviewFrame(pointer: number) {
    this.preview.setPreviewFrame(pointer);
  }

  public getUsefulFrame(): number[] {
    const {
      frameList,
      frameSplitRange,
      enableFrameRangeRemove,
      frameRemoveRange,
    } = this;

    let usefulFrame: number[] = Array.from(new Array(this.frameList.length).keys());

    const startFrameIndex = frameSplitRange[0] - 1;
    const endFrameIndex = frameSplitRange[1] - 1;
    const startRemoveFrameIndex = frameRemoveRange[0] - 1;
    const endRemoveFrameIndex = frameRemoveRange[1] - 1;

    usefulFrame = usefulFrame.filter(index => {
      return index >= startFrameIndex && index <= endFrameIndex;
    });

    if (enableFrameRangeRemove) {
      usefulFrame = usefulFrame.filter(index => {
        return !(index >= startRemoveFrameIndex && index <= endRemoveFrameIndex);
      });
    }

    return usefulFrame;
  }

  public async applyPreview2Timeline() {
    const {
      canvas: timelineCanvas,
      preview,
    } = this;

    timelineCanvas.getObjects().filter(obj => !obj.isType('timeline-frame')).forEach(obj => {
      timelineCanvas.remove(obj);
    });
    timelineCanvas.renderAll();

    // todo 给每次添加的object设置唯一group id 并将他们添加至组中
    const allObject = preview.getObjects();

    for (let i = 0; i < allObject.length; i++) {
      const obj = allObject[i];

      await this.applyObjectToTimeline(obj);
    }

    this.toast('应用成功', 'success');
  }

  public async applyObjectToTimeline(obj: fabric.Object): Promise<void> {
    const {
      showWidth: width,
      showHeight: height,
      canvas: timelineCanvas,
      oriImageSrc,
    } = this;

    const scaleX = width / this.frameWidth;
    const scaleY = height / this.frameHeight;

    const allDonePromise: Promise<void>[] = [];

    this.frameList.forEach((frame, index) => {
      allDonePromise.push(new Promise(resolve => {
        obj.clone((cloneObj: RangedFrameObject) => {

          const {left: oriLeft, top: oriTop, scaleX: oriScaleX, scaleY: oriScaleY, inFrame} = cloneObj;

          if (inFrame.includes(index)) {
            const newObj = cloneObj.set({
              left: oriLeft / scaleX + ((this.frameWidth + 1) * index),
              top: oriTop / scaleY,
              scaleX: oriScaleX / scaleX,
              scaleY: oriScaleY / scaleY,
              opacity: 1,
            });

            timelineCanvas.add(newObj).renderAll();
          }

          resolve();

        }, ['inFrame']);
      }))
    });

    await Promise.all(allDonePromise);

    return Promise.resolve();
  }

  public expandRange2Array(rangeArr: [number, number]): number[] {
    const start = Math.max(rangeArr[0] - 1, 0); // 因为slider都是从1开始的 所以这里要-1
    const end = rangeArr[1];

    const res: number[] = [];

    for (let i = start; i < end; i++) {
      res.push(i);
    }

    return res;
  }

  public clearNotification(ver: number) {
    localStorage.setItem(`notification-update-${ver}`, '1');

    const notificationDOM = document.querySelector(`[data-n-ver="${ver}"]`);

    if (notificationDOM) {
      notificationDOM.remove();
    }
  }
  public getNotification(ver: number): boolean {
    return !!localStorage.getItem(`notification-update-${ver}`);
  }

  public renderPreviewImage(range: [number, number], index: number) {
    this.curPreviewImg = this.frameList[range[index] - 1].imgFileSrc;
  }

  private aaa: boolean = false;

  public togglePause() {
    if (!this.preview) {
      return;
    }
    if (this.preview.isPause) {
      this.preview.play();
    } else {
      this.preview.pause();
    }

    this.aaa = this.preview.isPause;
  }
}
</script>

<style lang="scss" scoped>
  .wrapper {
    .uploader {
      max-width: calc(100vw - 2rem);
    }

    & /deep/ .canvas-container {
      margin: 0 auto;
    }
  }

  .vc-chrome {
    box-shadow: none;
    & /deep/ .vc-chrome-fields-wrap {
      display: none;
    }
  }
</style>
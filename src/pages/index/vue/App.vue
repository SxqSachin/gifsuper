<template>
  <div class="wrapper p-4 sm:p-4 md:py-8 lg:py-8 max:w-screen w-full">

    <!-- <div v-if="false && !getNotification(1)" data-n-ver="1" class="w-full py-2 px-4 mb-8 rounded-md border border-color-info flex justify-between items-center">
      <div> 新功能：现在可以实时预览各项编辑操作啦！ </div>
      <div class="color-link transform rotate-45 text-2xl cursor-pointer" @click="clearNotification(1);"> + </div>
    </div>

    <div v-if="!getNotification(2)" data-n-ver="2" class="w-full py-2 px-4 mb-8 rounded-md border border-color-info flex justify-between items-center">
      <div> 新功能：更新了滤镜功能！ </div>
      <div class="color-link transform rotate-45 text-2xl cursor-pointer" @click="clearNotification(2);"> + </div>
    </div> -->

    <!-- <div v-if="!getNotification(3)" data-n-ver="3" class="w-full py-2 px-4 mb-8 rounded-md border border-color-info flex justify-between items-center">
      <div> 新功能：现在添加文字可选字体啦！字体库会慢慢补充哦！ </div>
      <div class="color-link transform rotate-45 text-2xl cursor-pointer" @click="clearNotification(3);"> + </div>
    </div> -->

    <!-- <div v-if="!getNotification(4)" data-n-ver="4" class="w-full py-2 px-4 mb-8 rounded-md border border-color-info flex justify-between items-center">
      <div> 新功能：GIF图片压缩功能上线啦！ </div>
      <div class="color-link transform rotate-45 text-2xl cursor-pointer" @click="clearNotification(4);"> + </div>
    </div> -->

    <div v-if="!getNotification(5)" data-n-ver="5" class="w-full py-2 px-4 mb-8 rounded-md border border-color-info flex justify-between items-center">
      <div> 新功能：<strong>在线录屏</strong>功能上线啦！ </div>
      <div class="color-link transform rotate-45 text-2xl cursor-pointer" @click="clearNotification(5);"> + </div>
    </div>

    <!-- todo 严重bug 长度过大的gif上传后存在内存爆栈 导致标签页假死 -->
    <div class="top mb-6" v-if="!canEdit && !oriImageSrc">
      <upload class="uploader mx-auto" :before-upload="upload" accept=".gif">上传GIF</upload>
    </div>

    <fieldset v-if="!canEdit && !oriImageSrc" class="pb-4">
      <h2 class="font-normal text-lg color-info"> 提示： 上传Gif后可在下方进行编辑 </h2>
    </fieldset>

    <div class="flex flex-col md:flex-row-reverse" :class="{'md:flex-col': !isPreviewUseable}">

      <div class="flex flex-col w-full md:w-2/5 md-auto-sticky" :class="{'md:w-full': !isPreviewUseable, 'md-preview-sticky z-50': stickyPreviewCanvas}" >
        <div v-show="!!oriImageSrc" class="w-full flex items-center p-4 pb-0 bg-assets shadow hover:shadow-lg transition-shadow transition-time-func rounded-md rounded-bl-none rounded-br-none">
          <div class="w-full">
            <div class="flex">
              <div class="flex-auto">
                <label v-show="canEdit || isGenerating" for="srcgif" class="inline-block block">预览：</label>
                <label v-show="canEdit || isGenerating" for="srcgif" class="hidden md:block w-full whitespace-no-wrap truncate">点击添加的文字/图片来进行缩放/旋转操作。</label>
                <label v-show="canEdit || isGenerating" for="srcgif" class="hidden md:block w-full">可用鼠标框选元素。</label>
                <label v-show="canEdit || isGenerating" for="srcgif" class="block md:hidden w-full whitespace-no-wrap truncate">点击添加的文字/图片来进行缩放/旋转操作。</label>
                <label v-show="canEdit || isGenerating" for="srcgif" class="block md:hidden w-full">（长按+拖动）可框选元素。</label>
              </div>
            </div>

            <div id="srcgif" class="flex justify-center items-center hidden"> </div>

            <div v-show="!!oriImageSrc && oriGifLoadProgress < 1" class="flex flex-col justify-center items-center">
              <img ref="oriImageDom" :src="oriImageSrc" alt="" srcset=""/>
              <div v-show="!!oriImageSrc && oriGifLoadProgress < 1" class="mask w-full h-full float-left absolute flex justify-center items-center bg-opacity-75 bg-gray-800 text-white text-lg text-center" :style="{width: `${showWidth}px`, height: `${showHeight}px`}"> 
                读取数据中： {{ Math.max(0, +(oriGifLoadProgress * 100 - 1).toFixed(0)) }} %
              </div>
            </div>
          </div>

        </div>
        <div v-show="!!oriImageSrc" :class="{'sticky top-0': stickyPreviewCanvas}" class="z-50 w-full flex mb-4 items-center p-4 pt-0 bg-assets shadow hover:shadow-lg transition-shadow transition-time-func rounded-md rounded-tl-none rounded-tr-none md-auto-sticky md:top-0">
          <div class="src w-full">
            <div ref="edit-canvas" v-show="!!oriImageSrc && oriGifLoadProgress === 1" class="mt-4">
              <div class="flex justify-center items-center w-full">
                <previewer ref="previewer"></previewer>
              </div>

              <div class="w-full h-full flex justify-center items-center text-white text-lg text-center pointer-events-none">
                <img class="float-left absolute transform -translate-y-1/2" :style="{width: `${showWidth}px`, height: `${showHeight}px`}" v-show="!!curPreviewImg" :src="curPreviewImg" alt="当前预览帧"/>
              </div>

              <div class="mt-2 flex justify-between flex-wrap" v-show="!!oriImageSrc && oriGifLoadProgress === 1">

                <div class="flex justify-center items-center mb-2 w-full">
                  <slider class="flex-auto"
                    v-model="curFrameSlider"
                    :min="1"
                    :max="usefulFrame.length || 2"
                    :disabled="!canEdit"
                    :drag-on-click="true"
                    :duration="0"
                    @change="onCurFrameChange"
                   ></slider>
                </div>
                <div class="flex justify-between w-full">
                  <div class="flex flex-wrap">
                    <sbtn title="删除当前选中元素" @click="previewer.preview.removeActiveObjects()" type="error" style="padding-left: 0.45rem; padding-right: 0.45rem;">
                      <img class="w-6 h-6 flex-shrink-0 cursor-pointer" src="/static/icons/trash.svg"/>
                    </sbtn>
                  </div>
                  <div class="flex flex-no-wrap">
                    <sbtn class="rounded-tr-none rounded-br-none" title="第一帧" type="ghost" @click="previewer.preview.setPreviewFrame(0)" style="padding-left: 0.25rem; padding-right: 0.25rem;">
                      <img class="w-6 h-6 flex-shrink-0 cursor-pointer" src="/static/icons/play-skip-back.svg"/>
                    </sbtn>
                    <sbtn class="rounded-none border-l-0" title="上一帧" type="ghost" @click="previewer.preview.setPreviewFrame(previewer.preview.curFramePointer - 1)" style="padding-left: 0.25rem; padding-right: 0.25rem;">
                      <img class="w-6 h-6 flex-shrink-0 cursor-pointer" src="/static/icons/play-back.svg"/>
                    </sbtn>
                    <sbtn class="rounded-none border-l-0" title="播放/暂停" type="ghost" @click="togglePause" style="padding-left: 0.25rem; padding-right: 0.25rem;">
                      <img v-show="!!aaa" class="w-6 h-6 flex-shrink-0 cursor-pointer" src="/static/icons/play.svg"/>
                      <img v-show="!aaa" class="w-6 h-6 flex-shrink-0 cursor-pointer" src="/static/icons/pause.svg"/>
                    </sbtn>
                    <sbtn class="rounded-none border-l-0" title="下一帧" type="ghost" @click="previewer.preview.setPreviewFrame(previewer.preview.curFramePointer + 1)" style="padding-left: 0.25rem; padding-right: 0.25rem;">
                      <img class="w-6 h-6 flex-shrink-0 cursor-pointer" src="/static/icons/play-forward.svg"/>
                    </sbtn>
                    <sbtn class="rounded-tl-none rounded-bl-none" title="最后一帧" type="ghost" @click="previewer.preview.setPreviewFrame(previewer.preview.frameArray.length - 1)" style="padding-left: 0.25rem; padding-right: 0.25rem;">
                      <img class="w-6 h-6 flex-shrink-0 cursor-pointer" src="/static/icons/play-skip-forward.svg"/>
                    </sbtn>
                  </div>
                  <div class="flex flex-wrap">
                    <sbtn class="ml-2 visible md:invisible" title="开启/关闭 固定" type="ghost" @click="stickyPreviewCanvas = !stickyPreviewCanvas" style="padding-left: 0.25rem; padding-right: 0.25rem;">
                      <img v-show="stickyPreviewCanvas" style="width: 1.7rem;" class="h-6 flex-shrink-0 cursor-pointer" src="/static/icons/pin.png"/>
                      <img v-show="!stickyPreviewCanvas" style="width: 1.6rem; height: 1.6rem;" class="flex-shrink-0 cursor-pointer" src="/static/icons/pin-1.png"/>
                    </sbtn>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="w-full md:w-3/5 p-1 md:pb-3 md:pr-3 rounded-md border-color-2 flex flex-col" :class="{'md:w-full': !isPreviewUseable}">

        <div class="flex flex-row">
          <ul class="flex flex-row">
            <li v-for="tab in tabs" :key="tab.name"
              class="flex items-center py-2 px-3 bg-body cursor-pointer rounded-md rounded-bl-none rounded-br-none"
              :class="{'bg-assets shadow': curTab === tab.name}"
              @click="switchTab(tab.name)"
            >
              <img class="w-4 h-4 flex-shrink-0" :src="tab.icon"/>
              <span class="ml-2 md:inline" :class="{inline: curTab === tab.name, 'hidden': curTab !== tab.name}">{{tab.title}}</span>
              <sup v-show="tab.new" class="text-red-400"> new </sup>
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
                  <div>{{ frameList.length }}</div>
                </div>
                <div class="flex items-center mb-4 mr-0 md:mr-4 w-full md:w-auto">
                  <label for="interval" class="whitespace-no-wrap flex-0 inline-block">大小：</label>
                  <div>{{ rawFile ? +(rawFile.size / (1024 * 1024)).toFixed(2) : 0 }}MB</div>
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

              <div class="flex flex-col md:flex-row flex-wrap">
                <sbtn class="mr-0 md:mr-4 w-full md:w-auto mb-1" title="开启后生成的Gif将会是原Gif的倒放版" :disabled="!canEdit" type="info" @click="toggleState('revert', '倒放')">倒放：{{ gifState.revert ? '开' : '关' }}</sbtn>
                <sbtn class="mr-0 md:mr-4 w-full md:w-auto mb-1" title="开启后生成的Gif将会循环播放，关闭后则只会进行1次播放循环" :disabled="!canEdit" @click="toggleState('repeat', '循环')">循环：{{ gifState.repeat ? '开' : '关' }}</sbtn>
                <sbtn class="mr-0 md:mr-4 w-full md:w-auto mb-1" title="开启后生成的Gif将会左右颠倒" :disabled="!canEdit" @click="toggleState('flipX', '左右翻转', true)">左右翻转：{{ gifState.flipX ? '开' : '关' }}</sbtn>
                <sbtn class="mr-0 md:mr-4 w-full md:w-auto mb-1" title="开启后生成的Gif将会上下颠倒" :disabled="!canEdit" @click="toggleState('flipY', '上下翻转', true)">上下翻转：{{ gifState.flipY ? '开' : '关' }}</sbtn>
                <sbtn class="mr-0 md:mr-4 w-full md:w-auto mb-1" title="将图片向左旋转90度" :disabled="!canEdit" @click="rotate(-90)"> 左旋转 </sbtn>
                <sbtn class="mr-0 md:mr-4 w-full md:w-auto mb-1" title="将图片向右旋转90度" :disabled="!canEdit" @click="rotate(90)"> 右旋转 </sbtn>
                <!-- <sbtn class="mr-0 md:mr-4 w-full md:w-auto mb-1" title="开启后可实现首尾相接重复的特效" :disabled="!canEdit" @click="toggleRLoop">
                  <span>反复</span>
                  <span>:{{ rloop ? '开' : '关' }} </span>
                </sbtn> -->
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
                <div class="flex items-center">
                  <div 
                    class="w-20 md:w-32 h-8 border border-gray-400 rounded-sm"
                    :style="{backgroundColor: textColor}"
                    @click="showTextColorPicker = true"
                    >
                  </div>
                  <span class="ml-3 text-color-neutral text-xs"> 点击左侧方框取色 </span>
                </div>
                <s-modal :show="showTextColorPicker" class="absolute top-0 left-0 z-50">
                  <div class="flex justify-center mx-auto max-w-full" style="width: 400px;">
                    <div class="bg-primary flex flex-col justify-center rounded-sm p-6 w-full">
                      <h1 class="text-xl">请选择文字颜色</h1>
                      <hr class="my-4"/>
                      <color-picker class="z-40 border border-gray-500 mx-auto" v-model="tmpTextColorObj"></color-picker>
                      <hr class="my-4"/>

                      <div class="w-full text-center" :style="textContentPreviewStyle"> {{textContent || '示例文字'}} </div>

                      <hr class="my-4"/>
                      <div class="flex justify-between">
                        <sbtn class="px-8 text-primary flex-1" @click="textColorObj = tmpTextColorObj; showTextColorPicker = false;" type="info">确定</sbtn>
                        <sbtn class="px-8 text-primary flex-1 ml-4" @click="showTextColorPicker = false;">取消</sbtn>
                      </div>
                    </div>
                  </div>
                </s-modal>
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

              <div class="flex items-center mb-4">
                <label for="" class="whitespace-no-wrap">字体<sup class="text-red-400"> new </sup>：</label>
                <v-select
                  v-model="fontFamily"
                  class="w-full text-color-primary border border-gray-400 rounded-sm"
                  :options="fontList"
                  :style="`font-family:${fontFamily};`"
                  :reduce="font => font.font">
                  <template #option="{ font, label }">
                    <p class="text-2xl" :style="`font-family:${font};`" >{{ label }}</p>
                  </template>
                </v-select>
              </div>

              <section class="flex flex-col w-full mb-4">
                <div class="flex flex-row items-center mb-4">
                  <span>文字轮廓：</span><sbtn :disabled="!canEdit" @click="enableTextStroke = !enableTextStroke">{{ !enableTextStroke ? '开启' : '关闭' }}</sbtn>
                </div>

                <div class="flex flex-col justify-start w-full" v-show="enableTextStroke">
                  <div class="flex items-center mb-4">
                    <label for="" class="whitespace-no-wrap">轮廓颜色：</label>
                    <div class="flex items-center">
                      <div 
                        class="w-20 md:w-32 h-8 border border-gray-400 rounded-sm"
                        :style="{backgroundColor: textStrokeColor}"
                        @click="showTextStrokeColorPicker = true"
                        >
                      </div>
                      <span class="ml-3 text-color-neutral text-xs"> 点击左侧方框取色 </span>
                    </div>
                    <s-modal :show="showTextStrokeColorPicker" class="absolute top-0 left-0 z-50">
                      <div class="flex justify-center mx-auto max-w-full" style="width: 400px;">
                        <div class="bg-primary flex flex-col justify-center rounded-sm p-6 w-full">
                          <h1 class="text-xl">请选择轮廓颜色</h1>
                          <hr class="my-4"/>
                          <color-picker class="z-40 border border-gray-500 mx-auto" v-model="tmpTextStrokeObj"></color-picker>
                          <hr class="my-4"/>
                          <div class="w-full text-center" :style="textContentPreviewStyle"> {{textContent || '示例文字'}} </div>
                          <hr class="my-4"/>
                          <div class="flex justify-between">
                            <sbtn class="px-8 text-primary flex-1" @click="textStrokeObj = tmpTextStrokeObj; showTextStrokeColorPicker = false;" type="info">确定</sbtn>
                            <sbtn class="px-8 text-primary flex-1 ml-4" @click="showTextStrokeColorPicker = false;">取消</sbtn>
                          </div>
                        </div>
                      </div>
                    </s-modal>
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
                  <span>：</span>
                  <span class="inline-block pb-2 text-color-neutral text-sm border-gray-400">只在指定范围内添加文字</span>
                </label>

                <slider class="flex-auto pt-0"
                  v-model="addTextRange"
                  :disabled="!canEdit"
                  :min="1"
                  :max="!!frameList.length ? frameList.length : 10"
                  :marks="[1, (!!frameList.length ? frameList.length : 10)]"
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
                <span>：</span>
                <span class="inline-block pb-2 text-color-neutral text-sm border-gray-400">只在指定范围内添加图片</span>
              </label>

              <slider class="flex-auto pt-0"
                v-model="addImgRange"
                :disabled="!canEdit"
                :min="1"
                :max="!!frameList.length ? frameList.length : 10"
                :marks="[1, (!!frameList.length ? frameList.length : 10)]"
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
                  :max="!!frameList.length ? frameList.length : 10"
                  :marks="[1, (!!frameList.length ? frameList.length : 10)]"
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

          <fieldset class="flex items-start flex-col p-4 w-full bg-assets shadow hover:shadow-lg transition-shadow transition-time-func rounded-md"
            v-show="curTab === 'resize'"
            >
            <section class="flex flex-col justify-center items-start mb-4 w-full">
              <label for="" class="mb-4">
                <span>图片裁剪：</span>
                <span class="inline-block pb-2 text-color-neutral text-sm border-gray-400">裁剪出原图中你感兴趣的部分</span>
              </label>

              <div v-show="isRotated()">
                <span class="text-red-300"> 注意：</span>
                <span> 注意：您当前无法在旋转状态下使用该功能（会导致使用上的问题，待该Bug修复后开放） </span>
              </div>

              <div v-show="!isRotated()" class="flex flex-row items-center">
                <span>裁剪：</span><sbtn :disabled="!canEdit || isRotated()" @click="toggleResize">{{ !gifState.resize ? '开启' : '关闭' }}</sbtn>
              </div>
            </section>
          </fieldset>

          <fieldset class="flex items-start flex-col p-4 w-full bg-assets shadow hover:shadow-lg transition-shadow transition-time-func rounded-md"
            v-show="curTab === 'filter'"
            >

            <filter-panel :desk="this" ref="filter-panel" @filter="onFilterChange"></filter-panel>

          </fieldset>

          <fieldset class="flex items-start flex-col p-4 w-full bg-assets shadow hover:shadow-lg transition-shadow transition-time-func rounded-md"
            v-show="curTab === 'capture'"
            >

            <capture-panel :desk="this" ref="capture-panel"></capture-panel>

          </fieldset>

          <!-- <fieldset
            v-for="panel in panels" :key="panel.panelName"
            class="flex items-start flex-col p-4 w-full bg-assets shadow hover:shadow-lg transition-shadow transition-time-func rounded-md"
            v-show="curTab === panel.tabInfo.name"
            >
            <component :is="panel.panelName" :desk="this" :ref="panel.panelName" @panel-event="panel.panelEvent">
            </component>
          </fieldset> -->

          <fieldset id="action-panel" class="pt-8 ">
            <sbtn title="应用修改" @click="applyPreview2Timeline" type="success" :disabled="!canEdit">将修改应用到时间轴</sbtn>
            <div class="py-2 mb-4 text-sm">
              <span class="text-red-300"> 注意：</span>
              <span class="text-color-neutral">若进行过“添加文字/图片”、“应用滤镜”操作，则在生成最终结果前，需要先将修改应用到时间轴，等到提示“应用成功”后方可生成GIF。</span>
            </div>
            <sbtn type="success" @click="generate" :disabled="isGenerating || !canEdit">生成</sbtn>
            <div class="py-2 text-color-neutral text-sm">
              <p class="">tips: 受原Gif大小影响，点击“生成”按钮后可能会有短暂卡顿，此时耐心等候即可。</p>
              <p class=""> 生成后的GIF文件体积可能增加，可前往“<a href="https://yasuo.gifsuper.com?from=gifsuper.com" target="_blank">GifSuper图片压缩</a>”进行图片压缩。</p>
            </div>
          </fieldset>
        </div>

      </div>

    </div>

    <div id="gif-res" v-show="isGenerating || generateDone" class="flex flex-col justify-center w-full p-4 mb-4 bg-assets shadow hover:shadow-lg transition-shadow transition-time-func rounded-md">
      <label for="" class="hidden md:inline" v-show="generateDone">新图像：（保存图片：右击图片->图片另存为 或 点击下方按钮下载）</label>
      <label for="" class="inline md:hidden" v-show="generateDone">新图像：（长按图片->保存图片 或 点击下方按钮下载）</label>

      <div class="flex justify-center h-full items-center mt-4">
        <div class="my-12 md:my-0" v-show="isGenerating">
          <div class="mb-12 text-center">生成中： {{progress}}%</div>

          <div class="loading-calm-cat"></div>
        </div>

        <div v-show="!isGenerating">
          <div id="dtsgif" class="mt-4 md:mt-0 flex justify-center items-center"> </div>
          <sbtn class="mt-2 md:mt-4" type="success" @click="downloadNewImage">下载新图像</sbtn>
        </div>
      </div>
    </div>

    <!-- 支付宝红包 -->
    <!-- <div class="alipay-red-packet-layer animate-fade-in" v-if="showAliPayRedPacketLayer">
      <div class="bg-white p-4 rounded-md w-4/5 md:w-auto">
        <div class="flex justify-between items-center mb-2 p-2 pt-0 flex-no-wrap">
          <p> <span>等待时间，领个红包！</span><br class="inline-block md:hidden"/><span>(生成进度：{{progress}}%)</span></p>
          <div class="text-color-neutral transform rotate-45 text-2xl cursor-pointer" @click="showAliPayRedPacketLayer = false"> + </div>
        </div>
        <img src="/static/imgs/alipay-red-packet-2021.jpg" alt="支付宝红包">
      </div>
    </div> -->

    <!-- 底部广告 -->
    <ins class="adsbygoogle mb-4"
         style="display:block"
         data-ad-client="ca-pub-1451575114945845"
         data-ad-slot="6511949176"
         data-ad-format="auto"
         data-full-width-responsive="true"></ins>
    <div is="script">
      (adsbygoogle = window.adsbygoogle || []).push({});
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

      <timeline v-show="canEdit" ref="timeline" :frame-list="frameList" :gif-state="gifState"></timeline>

    </div>

    <!-- 这里预载入字体 -->
    <div class="absolute top-0 left-0 w-0 h-0 overflow-hidden" style="visibility: hidden;">
      <span
        v-for="fontItem in fontList"
        :key="fontItem.font"
        class="w-full text-color-primary"
        :style="`font-family:${fontItem.font};`">
          <p class="text-2xl" :style="`font-family:${fontItem.font};`" >1</p>
      </span>
    </div>

    <a ref="compress-link" class="absolute top-0 left-0 w-0 h-0 overflow-hidden" style="visibility: hidden" href="https://yasuo.gifsuper.com?from=gifsuper.com" target="_blank">gifsuper压缩</a>

  </div>
</template>

<script lang="ts">

import { Vue, Component, Prop, } from 'vue-property-decorator';

import Upload from '@/components/widget/s-upload.vue';
import sbtn from '@/components/widget/s-btn.vue';
import sInput from '@/components/widget/s-input.vue';
import sModal from '@/components/widget/s-modal.vue';

import Previewer from './components/previewer.vue';

import Timeline from './components/timeline.vue';

import VueSlider from 'vue-slider-component';
import 'vue-slider-component/theme/default.css';

import { Chrome as ColorPicker } from 'vue-color';

import { parseSrcGif, dataUrlToFile, GifGenerator, GifFrameList, GifFrame, getFileInfo } from '@/js/gif';

import { fabric } from 'fabric';

const FrameIndex = 1;
const TextZIndex = 10;

interface GenerateOption {
  baseInterval: number;

  generateRange: [number, number];
  removeRange?: [number, number];
}

import { RangedFrameObject } from '../js/type';
// import { GifPreview } from './js/preview';
import { Toasted } from '../js/type';
import { GifState } from './js/GifState';

import { Text } from '../js/modules/Text';
import { Image } from '../js/modules/Image';
import { Filter } from '../js/modules/filter';
import { Filters, FilterType } from '../js/modules/filters';
import { Stage } from '../js/stage';
// import { Timeline } from './js/timeline';

import FilterPanel from './components/panels/filter.vue';
import CapturePanel from './components/panels/capture.vue';
import { Desk } from '../js/desk';
import { Panel } from '../js/panel';

import vSelect from 'vue-select';
import 'vue-select/dist/vue-select.css'

import { checkOrigin } from '../../../js/auth'
import { delay } from '@/js/utility';

@Component({
  components: {
    'v-select': vSelect,
    'upload': Upload,
    sbtn,
    's-input': sInput,
    's-modal': sModal,
    slider: VueSlider,
    'color-picker': ColorPicker,
    previewer: Previewer,
    timeline: Timeline,
    'filter-panel': FilterPanel,
    'capture-panel': CapturePanel,
  },
})
export default class extends Vue implements Toasted, Desk {
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
  public tmpTextColorObj: {[key: string]: string} = { hex: '#fff' };
  public tmpTextStrokeObj: {[key: string]: string} = { hex: '#000' };
  public textColorObj: {[key: string]: string} = { hex: '#fff' };
  public textStrokeObj: {[key: string]: string} = { hex: '#000' };
  public textSize: string = '42';
  public textStrokeWidth: number = 1;

  public fontFamily: string = '';
  public fontList: {font: string, label: string}[] = [
    {font: '', label:'默认'},
    {font: 'zhankukuaileti', label: '站酷快乐体'},
    {font: 'zhankuwenyiti', label: '站酷文艺体'},
    {font: 'zhankugaoduanheiti', label: '站酷高端黑体'},
    {font: 'fangzhengfangsong', label: '方正仿宋'},
    {font: 'fangzhengkaiti', label: '方正楷体'},
    {font: 'yangrengdongzhushiti', label: '杨任东竹石体'},
    {font: 'xianerti', label: '贤二体'},
    {font: 'qiantuxiaotuti', label:' 千图小兔体'},
    {font: 'qingsongshouxieti2', label: '清松手写体2'},
    {font: 'youshebiaotihei', label: '优设标题黑'},
  ];

  public addTextRange: [number, number] = [1, 1]; // 添加文字起始值

  public enableTextStroke: boolean = false;

  public showTextColorPicker: boolean = false;
  public showTextStrokeColorPicker: boolean = false;
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

  // 单帧宽/高度
  // public frameWidth: number = 0;
  // public frameHeight: number = 0;

  // 生成进度
  public progress: number = 0;

  // timeline偏移值
  public timelineLeft: number = 0;

  public clipboard: any[] = [];

  public previewer!: Previewer;

  public gifState!: GifState;

  public timeline!: Timeline;

  public filterPanel!: FilterPanel;

  public showAliPayRedPacketLayer: boolean = false;

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

  get isPreviewUseable(): boolean {
    return this.canEdit || this.isGenerating || !!this.rawFile;
  }

  get textContentPreviewStyle(): {[key: string]: string} {
    const style = {
      color: this.tmpTextColorObj?.hex8 ?? '#fff',
      'font-size': `${this.textSize}px`,
      'font-family': this.fontFamily,
    }

    if (this.enableTextStroke) {
      style['-webkit-text-stroke'] = `${this.textStrokeWidth}px ${this.tmpTextStrokeObj?.hex8 ?? '#000'}`;
    }

    return style;
  }

  public isRotated(): boolean {
    return Math.abs(+this.gifState.rotate) === 90 || Math.abs(+this.gifState.rotate) === 270;
  }

  public created() {
    this.gifState = new GifState();

    window.fabric = fabric;

    window['app'] = this;

    checkOrigin();
  }

  public mounted() {
    document.getElementById('loading-ph')?.remove();

    fabric.Object.prototype.objectCaching = false;

    this.previewer = this.$refs['previewer'] as Previewer;

    this.timeline = this.$refs['timeline'] as Timeline;

    this.filterPanel = this.$refs['filter-panel'] as FilterPanel;
    // this.frameActionPanel = this.$refs['frame-action-panel'][0] as FrameActionPanel;

    // debugger;
    // this.filterPanel.addToDesk(this); 
    // this.frameActionPanel.addToDesk(this); 

    this.initKeyPressEvent();
  }

  public async upload(e: FileList) {
    const gifFile = e[0];

    if (gifFile.type !== 'image/gif') {
      this.toast('只支持上传Gif文件', 'error');
      return;
    }

    this.rawFile = gifFile;

    const { width, height, imgFileSrc } = await getFileInfo(gifFile);
    const imgDOM = this.$refs.oriImageDom as HTMLImageElement;

    this.oriWidth = width;
    this.oriHeight = height;

    // 监听图片加载完成事件 如果不等待图片显示完成 获取到的showWidth/Height将会是异常值
    const oriImageOnLoadPromise = new Promise<void>(resolve => {
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

    this.filterPanel.setPreviewFrame(this.frameList[0]);

    await this.updateEditData();

    // await this.makeTimeline(frameList);
    await this.timeline.refreshFrameImg();
    this.timeline.refresh();
    await this.previewer.initGIF(frameList, showWidth, showHeight);

    await this.renderPreview();
  }

  public toggleResize() {
    const resize = this.gifState.toggleState('resize');

    if (resize) {
      this.previewer.showResizeRect();
    } else {
      this.previewer.hideResizeRect();
    }
  }

  public async toggleState(key: keyof GifState, name?: string, resetTimeline: boolean = false) {
    this.gifState.toggleState(key, name, resetTimeline);

    this.renderPreview();

    if (name) {
      this.toast(`已${this[key]? '开启' : '关闭'}${name}`, 'info')
    }

    if (resetTimeline) {
      await this.timeline.refreshFrameImg();
      this.timeline.refresh();
    }
  }

  public async rotate(deg: number) {
    this.gifState.rotate += deg;

    if (this.gifState.rotate === 360 || this.gifState.rotate === -360) {
      this.gifState.rotate = 0;
    }

    await this.renderPreview();
    await this.timeline.refreshFrameImg();
    this.timeline.refresh();
  }

  public resetStage() {
    const srcgifDOM = document.querySelector('#srcgif');

    if (srcgifDOM) {
      srcgifDOM.innerHTML = '';
    }

    if (!!this.timeline.canvas) {
      this.timeline.canvas.clear();
    }
  }

  // 将#时间轴#中的每一帧合并为GIF
  public async generate() {
    this.showAliPayRedPacketLayer = true;

    this.generateDone = false;

    this.progress = 0;
    this.isGenerating = true;

    await delay(1000);

    const rotated = Math.abs(+this.gifState.rotate) === 90 || Math.abs(+this.gifState.rotate) === 270;

    let { width, height } = { width: this.oriWidth, height: this.oriHeight };
    if (rotated) {
      [width, height] = [height, width];
    }

    const totalWidth = (width + 1) * this.totalFrameCount;

    this.timeline.canvas.absolutePan(new fabric.Point(0, 0));

    const dataUrlArr: string[] = [];

    // 处理帧裁剪数据
    const startFrameIndex = (this.frameSplitRange[0] - 1);
    const endFrameIndex = (this.frameSplitRange[1]);

    const removeRangeStartIndex = this.frameRemoveRange[0] - 1;
    const removeRangeEndIndex = this.frameRemoveRange[1] - 1;

    const isResizeRect = this.gifState.resize;

    const gScaleX = this.showWidth / width;
    const gScaleY = this.showHeight / height;

    const resizeRect = this.previewer.resizeRect;
    const resizeWidth = Math.round((resizeRect.width * resizeRect.scaleX) / gScaleX);
    const resizeHeight = Math.round((resizeRect.height * resizeRect.scaleY) / gScaleY);

    let generatorWidth = isResizeRect ? resizeWidth : this.oriWidth;
    let generatorHeight = isResizeRect ? resizeHeight : this.oriHeight;

    if (rotated) {
      [generatorWidth, generatorHeight] = [generatorHeight, generatorWidth];
    }

    const gif = new GifGenerator({
      repeat: this.gifState.repeat ? 0 : -1,
      width: generatorWidth,
      height: generatorHeight,
    });

    for (let i = startFrameIndex; i < endFrameIndex; i++)  {
      if (this.enableFrameRangeRemove && i >= removeRangeStartIndex && i <= removeRangeEndIndex) {
        continue;
      }

      let _width = width;
      let _height = height;
      let left = !this.gifState.revert ? (width + 1) * i : totalWidth - (width + 1) * (i + 1);
      let top = 0;

      if (isResizeRect) {
        _width = resizeWidth;
        _height = resizeHeight;
        left += resizeRect.left / gScaleX;
        top += resizeRect.top / gScaleY;
      }

      const durl = this.timeline.canvas.toDataURL({
        width: _width,
        height: _height,
        left,
        top,
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
      const activedObjects = this.timeline.canvas.getActiveObjects();

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
    let activedObjects = this.timeline.canvas.getActiveObjects();

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
    const activedObjects = this.timeline.canvas.getActiveObjects();

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

      // this.makeTimeline(frameList);
    }

    if (copiedObj.length) {

      copiedObj.forEach(obj => {
        obj.clone((cloneObj: fabric.Object) => {
          cloneObj.set({
            left: ((obj.left || 0) + 16),
            top: ((obj.top || 0) + 16),
          })
          this.timeline.canvas.add(cloneObj);
          this.timeline.canvas.setActiveObject(cloneObj);
        })
      });

      this.timeline.canvas.renderAll();

      // @ts-ignore
      this.toast(`已粘贴${this.copiedObj.length}个对象`, 'success');
    }

  }

  public deleteActivedObject() {
    const activedObjects = this.timeline.canvas.getActiveObjects();

    if (!activedObjects.length) {
      this.toast('当前没有选中元素', 'error');
      return;
    }

    this.timeline.canvas.remove(...activedObjects);

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
    if (tab === 'compress') {
      (this.$refs['compress-link'] as HTMLElement).click();

      return;
    }

    this.curTab = tab;

    if (tab === 'resize') {
      if (this.gifState.resize) {
        this.previewer.preview.showResizeRect();
      }
    } else {
      // this.preview.hideResizeRect();
    }
  }

  public addImage(imgList: FileList) {
    const image = new Image(imgList, this.addImgRange);
    image.addTo(this.previewer);

    this.toast('添加成功', 'success', 1000);
  }

  public addText() {
    const { textContent, textSize, textColor, enableTextStroke, textStrokeColor, textStrokeWidth, addTextRange } = this;
    const { fontFamily } = this;

    if (!textContent || !textContent.length) {
      this.toast('请先输入需要添加的文字', 'warn');
      return;
    }

    const text = new Text(textContent, {
      color: textColor,
      fontSize: +textSize,

      fontWeight: 600,
      fontFamily,

      enableStroke: enableTextStroke,
      strokeWidth: textStrokeWidth,
      strokeColor: textStrokeColor,
      frameRange: addTextRange,
    });
    text.addTo(this.previewer);

    this.toast('添加成功', 'success', 1000);
  }

  public async renderPreview() {
    const usefulFrame= this.usefulFrame;
    const curFrame = this.curFrameSlider;

    this.curFrameSlider = Math.min(usefulFrame[curFrame], usefulFrame[usefulFrame.length - 1]);

    await this.previewer.preview.updateOptions(this.gifState);
    
    this.previewer.preview.renderPreview(this.usefulFrame, this.interval, index => {
      this.curFrameSlider = index;
    });
  }

  public onCurFrameChange(curFrame) {
    if (isNaN(curFrame)) {
      curFrame = 0;
    }

    this.previewer.preview.setPreviewFrame(curFrame);
  }

  public setPreviewFrame(pointer: number) {
    this.previewer.preview.setPreviewFrame(pointer);
  }

  get usefulFrame(): number[] {
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
      previewer,
    } = this;

    const timelineCanvas = this.timeline.canvas;

    const preview = previewer.preview;

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
      oriWidth,
      oriHeight,
      // canvas: timelineCanvas,
      oriImageSrc,
    } = this;
    const timelineCanvas = this.timeline.canvas;

    const scaleX = width / oriWidth;
    const scaleY = height / oriHeight;

    const allDonePromise: Promise<void>[] = [];

    const curWidth = this.isRotated() ? this.oriHeight : this.oriWidth;

    this.frameList.forEach((frame, index) => {
      allDonePromise.push(new Promise(resolve => {
        obj.clone((cloneObj: RangedFrameObject) => {

          const {left: oriLeft, top: oriTop, scaleX: oriScaleX, scaleY: oriScaleY, inFrame} = cloneObj;

          if (inFrame.includes(index)) {
            const newObj = cloneObj.set({
              left: oriLeft / scaleX + ((curWidth + 1) * index),
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

  aaa: boolean = false;

  public togglePause() {
    if (!this.previewer.preview) {
      return;
    }
    if (this.previewer.preview.isPause) {
      this.previewer.preview.play();
    } else {
      this.previewer.preview.pause();
    }

    this.aaa = this.previewer.preview.isPause;
  }

  async onFilterChange({ event, filter, type }:{event: string, filter: Filter, type: FilterType}) {
    console.log(event);
    if (!filter) {
      this.toast('滤镜不可用');
      return;
    }

    await filter.addTo(this.previewer, process => {
      this.filterPanel.setFilterState(type, '渲染预览...', `${(process * 100).toFixed(2)}%`);
    });

    await filter.addTo(this.timeline, process => {
      this.filterPanel.setFilterState(type, '渲染时间轴...', `${(process * 100).toFixed(2)}%`);
    });
    this.filterPanel.clearFilterState(type);

    this.timeline.refresh();

    this.toast('滤镜应用成功', 'success');
  }

  public downloadNewImage() {
    const linkSource = document.querySelector('#dtsgif img').getAttribute('src');
    const downloadLink = document.createElement("a");
    downloadLink.setAttribute('href', linkSource);
    downloadLink.setAttribute('download', 'new.gif');
    downloadLink.click();
    downloadLink.remove();
  }

  get tabs() {
    return [
      { name: 'base', title: '基础设置', icon: '/static/icons/hammer.svg', },
      { name: 'addText', title: '添加文字', icon: '/static/icons/text.svg', },
      { name: 'addPic', title: '添加图片', icon: '/static/icons/image.svg', },
      { name: 'cut', title: '帧裁剪', icon: '/static/icons/cut.svg', },
      { name: 'resize', title: '裁剪', icon: '/static/icons/contract.svg', },
      { name: 'filter', title: '滤镜', icon: '/static/icons/wand.svg', },
      { name: 'compress', title: '压缩', icon: '/static/icons/compress.svg', },
      { name: 'capture', title: '录屏', icon: '/static/icons/capture.svg', new: true, beta: true, },
    ];
  }

  public panels: Panel[] = [];

}
</script>


<style>
.vs__selected {
  color: var(--primary-text-color);
}
.vs__dropdown-toggle {
  border: 0;
}
</style>

<style>
@font-face {
    font-family: zhankukuaileti;
    src: url('https://gifsuper.sxqsachin.com/static/fonts/ZhanKuKuaiLeTi2016XiuDingBan.ttf') format('truetype');
}
@font-face {
    font-family: zhankuwenyiti;
    src: url('https://gifsuper.sxqsachin.com/static/fonts/ZhanKuWenYiTi.ttf') format('truetype');
}
@font-face {
    font-family: zhankugaoduanheiti;
    src: url('https://gifsuper.sxqsachin.com/static/fonts/GaoDuanHeiXiuDing151105.ttf') format('truetype');
}
@font-face {
    font-family: fangzhengfangsong;
    src: url('https://gifsuper.sxqsachin.com/static/fonts/FangZhengFangSongJianTi.ttf') format('truetype');
}
@font-face {
    font-family: fangzhengkaiti;
    src: url('https://gifsuper.sxqsachin.com/static/fonts/FangZhengKaiTiJianTi.ttf') format('truetype');
}
@font-face {
    font-family: yangrengdongzhushiti;
    src: url('https://gifsuper.sxqsachin.com/static/fonts/YangRenDongZhuShiTi.ttf') format('truetype');
}
@font-face {
    font-family: xianerti;
    src: url('https://gifsuper.sxqsachin.com/static/fonts/XianErTi.ttf') format('truetype');
}
@font-face {
    font-family: qiantuxiaotuti;
    src: url('https://gifsuper.sxqsachin.com/static/fonts/QianTuXiaoTuTi.ttf') format('truetype');
}
@font-face {
    font-family: qingsongshouxieti2;
    src: url('https://gifsuper.sxqsachin.com/static/fonts/QingSongShouXieTi2.ttf') format('truetype');
}
@font-face {
    font-family: youshebiaotihei;
    src: url('https://gifsuper.sxqsachin.com/static/fonts/YouSheBiaoTiHei.ttf') format('truetype');
}
</style>

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

  div.alipay-red-packet-layer {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 9999;
    display: flex;
    justify-content: center;
    align-items: center;
    /* background-image: url('/static/imgs/alipay-red-packet-2021.jpg'); */

    img {
      width: 400px;
    }

    @media screen and (max-width: 767px) {
      img {
        width: 100%;
      }
    }
  }

  @media screen and (min-width: 768px) {
    .md-auto-sticky {
      position: sticky;
      top: -90px;
    }
    .md-auto-sticky.md\:top-0 {
      top: 0;
    }
  }
  @media screen and (max-width: 767px) {
    .md-preview-sticky {
      position: sticky;
      top: -90px;
    }
  }
</style>
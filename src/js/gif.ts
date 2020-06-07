/*
  stackoverflow: questions/35940290/how-to-convert-base64-string-to-javascript-file-object-like-as-from-file-input-f
*/

export interface GifFrame {
  imgFileSrc: string;
  width: number;
  height: number;
}
export type GifFrameList = GifFrame[];

async function urlToFile(url: string, filename: string, mimeType: string) {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();

  return new File([arrayBuffer], filename, { type: mimeType });
}

function dataUrlToFile(dataurl: string, filename: string) {
  const arr = dataurl.split(',');
  const mime = (arr[0].match(/:(.*?);/) as RegExpMatchArray)[1];
  const bstr = atob(arr[1]);

  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
}

function canvasToBlob(canvas: HTMLCanvasElement) {
  const promise: Promise<Blob> = new Promise(resolve => {
    canvas.toBlob(blob => {
      resolve(blob as Blob);
    });
  });

  return promise;
}

async function convertCanvasToImage(canvas: HTMLCanvasElement, filename: string) {
  // const arrayBuffer = await canvasToBlob(canvas);
  // return new File([arrayBuffer], filename, {type: 'image/jpeg'});

  return await dataUrlToFile(canvas.toDataURL('image/png'), filename);
  // return await urlToFile(canvas.toDataURL('image/jpeg', 0.9), filename, 'image/jpeg');
}

async function parseSrcGif(gifFile: File, onLoad?: (cur?: number, total?: number) => void): Promise<GifFrameList> {
  const srcgifDOM = document.querySelector('#srcgif') as HTMLCanvasElement;

  const gifImg = document.createElement('img');
  gifImg.setAttribute('rel:animated_src', URL.createObjectURL(gifFile));
  gifImg.setAttribute('rel:auto_play', '0');
  srcgifDOM.appendChild(gifImg);

  // @ts-ignore
  const superGif = new SuperGif({ 
    gif: gifImg,
    on_load: onLoad,
  });

  // @ts-ignore
  const frameList: GifFrameList = [];

  const promiseList: Promise<GifFrame>[] = [];

  const promise: Promise<GifFrameList> = new Promise((resolve, reject) => {
    superGif.load(async () => {
      for (let frame = 1; frame <= superGif.get_length(); frame++) {
        // 遍历gif实例的每一帧
        superGif.move_to(frame);

        // 将每一帧的canvas转换成file对象
        const curFile = await convertCanvasToImage(superGif.get_canvas(), gifFile.name.replace('.gif', `-${frame}`));
        const curFileUrl = URL.createObjectURL(curFile);

        const imgFile = new Image();
        imgFile.src = curFileUrl;

        promiseList.push(new Promise(resolve => {
          imgFile.onload = () => {
            const gifFrame: GifFrame = {
              imgFileSrc: imgFile.src,
              width: imgFile.width,
              height: imgFile.height,
            };
            resolve(gifFrame);
          };
        }));
      }

      const gifFrameList = await Promise.all(promiseList);

      gifFrameList.forEach(item => {
        frameList.push(item);
      })

      // superGif2.play();

      resolve(frameList);
    });
  });

  return promise;
}

class GifGenerator {
  private gif: any;

  private bodyDOM: HTMLElement;

  private df: DocumentFragment;

  private pall: Array<Promise<HTMLImageElement>>;

  constructor(options?: {[key: string]: any}) {

    const opts = {
      worker: 2,
      quality: 10,
      workerScript: '/static/js/gif.worker.js',
      ...options,
    };

    // @ts-ignore
    this.gif = new GIF(opts);

    this.bodyDOM = document.body;

    this.df = document.createDocumentFragment();

    this.pall = [];
  }

  public init() {
    // @ts-ignore
    this.gif = new GIF({
      worker: 2,
      quality: 10,
      workerScript: '/static/js/gif.worker.js',
    });

    this.bodyDOM = document.body;

    this.df = document.createDocumentFragment();

    this.pall = [];
  }

  public async render(progressCallBack?: (progress: number) => void): Promise<Blob> {
    this.bodyDOM.append(this.df);

    await Promise.all(this.pall);

    this.gif.render();

    if (typeof progressCallBack === 'function') {
      this.gif.on('progress', progressCallBack);
    }

    const promise: Promise<Blob> = new Promise(resolve => {
      this.gif.on('finished', (blob: Blob) => {
        resolve(blob);

        this.init();
      });
    });

    return promise;
  }

  public async renderToElem(selector: string, progressCallBack?: (progress: number) => void): Promise<void>;
  public async renderToElem(elem: HTMLElement | string, progressCallBack?: (progress: number) => void): Promise<void> {
    const dtsDOM = (elem instanceof HTMLElement) ? elem : document.querySelector(elem);

    if (!dtsDOM) {
      console.error('Gif.js: renderToElem dtsElement not found');
      return;
    }

    const blob = await this.render(progressCallBack);
    const reader = new FileReader();

    dtsDOM.innerHTML = '';

    reader.onload = (e: any) => {
      const dataUrl = e!.target!.result;

      const dtsGif = new Image();
      dtsGif.src = dataUrl;

      dtsDOM.appendChild(dtsGif);
    };

    reader.readAsDataURL(blob);

    return Promise.resolve();
  }

  public addDataUrl(dataUrls: string[] | string, options?: any): GifGenerator {
    if (Array.isArray(dataUrls)) {
      dataUrls.forEach(dataUrl => {
        this._addDataUrl(dataUrl, options);
      });
    } else {
      this._addDataUrl(dataUrls, options);
    }

    return this;
  }

  public addImgElems(imgElems: HTMLImageElement, options?: any): GifGenerator;
  public addImgElems(imgElems: HTMLImageElement[] | HTMLImageElement, options?: any): GifGenerator {
    if (Array.isArray(imgElems)) {
      imgElems.forEach(imgElem => {
        this._addImgElem(imgElem, options);
      });
    } else {
      this._addImgElem(imgElems, options);
    }

    return this;
  }

  private _addDataUrl(dataUrl: string, options?: any) {
    const img = new Image();
    img.src = dataUrl;

    this._addImgElem(img, options);
  }

  private _addImgElem(imgElem: HTMLImageElement, options?: any) {
    imgElem.style.position = 'fixed';
    imgElem.style.opacity = '0';

    this.df.append(imgElem);

    const promise: Promise<HTMLImageElement> = new Promise(resolve => {
      // 直到_df被挂载到页面上时，onload才会被触发
      imgElem.onload = () => {
        this.gif.addFrame(imgElem, options);

        imgElem.remove();

        resolve(imgElem);
      };
    });

    this.pall.push(promise);
  }
}

export { dataUrlToFile, parseSrcGif, GifGenerator, }

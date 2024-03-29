const minus2 = (str: string) => {
  return str.substr(-2);
};

export function timestampToYMD(timestamp: number) {
  const dateObj = new Date(timestamp - 0);

  const year = dateObj.getFullYear();
  const month = '0' + (dateObj.getMonth() + 1);
  const date = '0' + dateObj.getDate();

  return `${year}-${month.substr(-2)}-${date.substr(-2)}`;
}

export function normalizeNumber(val: number): string {
  let valStr = val.toString();

  if (valStr.indexOf('.') < 0) {
    valStr += '.00';
  }

  const valPart = valStr.split('.');

  const integerPart = valPart[0];
  const decimalPart = valPart[1];

  const res = integerPart.replace(/(\d)(?=(?:\d{3})+$)/g, '$1,') + '.' + decimalPart;
  console.log(valPart, res);

  return res;
}

export function timestampToString(timestamp: number) {
  const dateObj = new Date(timestamp - 0);

  const year = dateObj.getFullYear();
  const month = minus2('0' + (dateObj.getMonth() + 1));
  const date = minus2('0' + dateObj.getDate());
  const hours = minus2('0' + dateObj.getHours());
  const minutes = minus2('0' + dateObj.getMinutes());
  const seconds = minus2('0' + dateObj.getSeconds());

  return `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;
}

export function parseJSON(jsonString: string, def: any = {}): any {
  let json: any = {};
  try {
    json = JSON.parse(jsonString);
  } catch {
    json = def;
  }

  return json;
}

export function throttle(func: () => void, delay: number) {
  let timer: NodeJS.Timeout | null = null;

  let startTime: number = Date.now();

  return function() {
    const curTime: number = Date.now();
    const remaining = delay - (curTime - startTime);

    // @ts-ignore
    const context: any = this;
    const args = arguments;

    if (timer) {
      clearTimeout(timer);
    }

    if (remaining <= 0) {
      // @ts-ignore
      func.apply(context, args);
      startTime = Date.now();
    } else {
      timer = setTimeout(func, remaining);
    }
  };
}

export function delay(wait = 0) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, wait);
  });
}
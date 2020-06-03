import '@babel/polyfill'

import './style/index.css';
import './style/index.scss';

var a = async function()  {

  const a = {};

  const b = a?.c ?? '12';

  console.log(b);

}

a();
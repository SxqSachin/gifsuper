import '@babel/polyfill'

var a = async function()  {

  const a = {};

  const b = a?.c ?? '12';

  console.log(b);

}

a();
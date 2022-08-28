let VIDEO = null;
let CANVAS = null;
let CTX = null;
let W = 620;
let H = Math.ceil(W*(9/16));
let PROCESS = false;

function main() { 
  CANVAS = document.createElement("canvas");
  CANVAS_OVERLAY = document.createElement("canvas");
  CANVAS.width = W;
  CANVAS.height = H;
  CANVAS_OVERLAY.width = W;
  CANVAS_OVERLAY.height = H;
  CTX = CANVAS.getContext("2d");
  OVERLAY = CANVAS_OVERLAY.getContext("2d");
  document.body.appendChild(CANVAS);
  document.body.appendChild(CANVAS_OVERLAY);

  

  let promise = navigator.mediaDevices.getUserMedia({video: 
    {
      width: {exact: W}, 
      height: {exact: H}
    }});
  promise.then((signal)=>{
    VIDEO = document.createElement("video");
    VIDEO.srcObject = signal;
    VIDEO.play();
    VIDEO.onloadeddata = function() {
      updateCanvas();
    }
  }).catch((err)=>{
    alert("camera error: "+err)
  })

}

function updateCanvas() {
  CTX.drawImage(VIDEO, 0, 0, W, H);
  if(PROCESS) processCanvas();
  window.requestAnimationFrame(updateCanvas);
}

function processCanvas(){
  let chunk = null;
  
  let block = 10;

  let nx = Math.round(W/block);
  let ny = Math.round(H/block);
  
  for(x=0;x<nx;x++){
    for(y=0;y<ny;y++){
      let index = y + x * nx;
      
      chunk = CTX.getImageData(x*block, y*block, block, block);
      let luminance = averageLuminance(chunk.data);

      //chunk.data.fill(luminance);
      //CTX.putImageData(chunk, x*block, y*block);

      dado(OVERLAY, Math.round(map(luminance,0,255,1,6)), x*block, y*block, block);
    }
  }
}

function dado(ctx, n,x,y,size){
  let mx = x + size/2;
  let my = y + size/2;
  let r = size*0.1;
  let color = '#fff';
  
  drawRect(ctx,x+1, y+1, x+size-1, y+size-1, '#000');
  
  drawLine(ctx,x+1,y+1,x+size-1,y+1,'#555'); //TOP
  drawLine(ctx,x+1,y+1,x+1,y+size-1,'#555'); //LEFT
  drawLine(ctx,x+size-1,y+1,x+size-1,y+size-1,'#222'); //RIGHT
  drawLine(ctx,x+1,y+size-1,x+size-1,y+size-1,'#222'); //BOTOTN

  switch(n){
    case 1: 
      drawCircle(ctx,mx, my, r, color);
      break;
    case 2: 
      drawCircle(ctx,mx-size/4, my-size/4, r, color);
      drawCircle(ctx,mx+size/4, my+size/4, r, color);
      break;
    case 3:
      drawCircle(ctx,mx, my, r, color);
      drawCircle(ctx,mx-size/4, my-size/4, r, color);
      drawCircle(ctx,mx+size/4, my+size/4, r, color);
      break;
    case 4: 
      drawCircle(ctx,mx-size/4, my-size/4, r, color);
      drawCircle(ctx,mx+size/4, my+size/4, r, color);
      drawCircle(ctx,mx-size/4, my+size/4, r, color);
      drawCircle(ctx,mx+size/4, my-size/4, r, color);
      break;
    case 5: 
      drawCircle(ctx,mx, my, r, color);
      drawCircle(ctx,mx-size/4, my-size/4, r, color);
      drawCircle(ctx,x+size/4, my+size/4, r, color);
      drawCircle(ctx,mx-size/4, my+size/4, r, color);
      drawCircle(ctx,mx+size/4, my-size/4, r, color);
      break;
    default:
      drawCircle(ctx,mx-size/4, my, r, color);
      drawCircle(ctx,mx+size/4, my, r, color);
      drawCircle(ctx,mx+size/4, my+size/4, r, color);
      drawCircle(ctx,mx-size/4, my-size/4, r, color);
      drawCircle(ctx,mx+size/4, my+size/4, r, color);
      drawCircle(ctx,mx-size/4, my+size/4, r, color);
      drawCircle(ctx,mx+size/4, my-size/4, r, color);
      break;
  }
}

function drawCircle(ctx, x,y,r,color){
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.fill();
}

function drawLine(ctx,x,y,xf,yf,color){
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(x,y);
  ctx.lineTo(xf,yf);
  ctx.closePath();
  ctx.stroke();
}

function drawRect(ctx,x,y,w,h,color){
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.rect(x,y,w,h);
  ctx.closePath();
  ctx.fill();
}

function clearCanvas(ctx){
  PROCESS = false;
  ctx.clearRect(0,0,ctx.canvas.width, ctx.canvas.height);
}

function averageLuminance(data){
  let b = [];
  for(i=0;i<data.length;i=i+4){
    let R = data[i];
    let G = data[i+1];
    let B = data[i+2];
    b.push((R+R+R+B+G+G+G+G)>>3);//FAST LUMINANCE
  }
  return (b.reduce((a, b) => a + b, 0) / b.length);
}

function constrain(n, low, high) {
  p5._validateParameters('constrain', arguments);
  return Math.max(Math.min(n, high), low);
};

function map(n, start1, stop1, start2, stop2, withinBounds) {
  const newval = (n - start1) / (stop1 - start1) * (stop2 - start2) + start2;
  if (!withinBounds) {
    return newval;
  }
  if (start2 < stop2) {
    return constrain(newval, start2, stop2);
  } else {
    return constrain(newval, stop2, start2);
  }
};

document.addEventListener("DOMContentLoaded", main);
document.addEventListener('mousedown',()=>PROCESS = true);
document.addEventListener('mouseup',()=>clearCanvas(OVERLAY));
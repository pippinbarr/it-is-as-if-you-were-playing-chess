// From http://deepliquid.com/projects/blog/arrows.html

var arrow = [
  [ 8, 0 ],
  [ -10, -8 ],
  [ -10, 8]
];

function drawFilledPolygon(ctx,shape) {
  // ctx.lineWidth = 8;
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.moveTo(shape[0][0],shape[0][1]);

  for(p in shape)
  if (p > 0) ctx.lineTo(shape[p][0],shape[p][1]);

  ctx.lineTo(shape[0][0],shape[0][1]);
  ctx.fill();
};

function translateShape(shape,x,y) {
  var rv = [];
  for(p in shape)
  rv.push([ shape[p][0] + x, shape[p][1] + y ]);
  return rv;
};

function rotateShape(shape,ang)
{
  var rv = [];
  for(p in shape)
  rv.push(rotatePoint(ang,shape[p][0],shape[p][1]));
  return rv;
};

function rotatePoint(ang,x,y) {
  return [
    (x * Math.cos(ang)) - (y * Math.sin(ang)),
    (x * Math.sin(ang)) + (y * Math.cos(ang))
  ];
};

function drawLineArrow(ctx,x1,y1,x2,y2) {
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x1,y1);
  ctx.lineTo(x2,y2);
  ctx.stroke();
  var ang = Math.atan2(y2-y1,x2-x1);
  drawFilledPolygon(ctx,translateShape(rotateShape(arrow,ang),x2,y2));
};

function clearArrow(ctx) {
  ctx.clearRect(0, 0, 640, 640);
}

function drawX(ctx,width,height) {
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0,0);
  ctx.lineTo(width,height);
  ctx.moveTo(width,0);
  ctx.lineTo(0,height);
  ctx.stroke();
}

BSP.SONG = (function(SONG = {}) {
Array.prototype.rotate=function(t){return this.slice(t,this.length).concat(this.slice(0,t))}
var w0=new Float32Array([0,1,.5,.3,.5,.1]),
    w1=new Float32Array([0,1,0,0,1,0,.1,.25,.1,.6]),
    w2=new Float32Array([0,.2,.1,.1,.3]);
var A=[w0,w0],B=[w1,w1],C=[w2,w2];
/* ----------------------------- */
SONG.title   = "stormlord 2"
SONG.author  = "bryc"
SONG.date    = "jan-14-2018"
SONG.comment = "pattern variables, rotated patterns, periodic waves.<br>remake of a remake of a remake (https://soundcloud.com/bryc/stormlord-two)"
SONG.bpm     = 81
SONG.divide  = 6
SONG.cVol    = [.25,.19,.08,.045,.06,.05,.05]
SONG.wave    = [A,B,B,B, C,C,C]

var bass=[
['d-3'],       ,       ,       ,       ,['d-3'],
  -1   ,       ,['d-3'],       ,       ,['a#2'],
       ,       ,       ,       ,       ,['a#3'],
  -1   ,       ,['a#2'],       ,       ,['a#2'],
]
var bass2=[
['a-2'],       ,       ,       ,       ,['a-2'],
  -1   ,       ,['a-2'],       ,       ,['d#3'],
       ,       ,       ,       ,       ,['d#4'],
  -1   ,       ,['d#3'],       ,       ,       ,
]
var bass3=[
['a-2'],       ,       ,       ,       ,['a-2'],
  -1   ,       ,['a-2'],       ,       ,['g#2'],
       ,       ,       ,       ,       ,['g#3'],
  -1   ,       ,['g#2'],       ,       ,       ,
]
var pad0_0=[
['c-5'],       ,       ,       ,       ,       ,
       ,       ,       ,       ,  -1   ,['d-5'],
       ,       ,       ,       ,       ,       ,
       ,       ,       ,       ,       ,  -1   ,
]
var pad0_1=[
['c-5'],       ,       ,       ,       ,       ,
       ,       ,       ,       ,  -1   ,['d-5'],
       ,       ,       ,       ,       ,       ,
       ,       ,       ,       ,       ,  -1   ,
]
var pad0_2=[
['c-5'],       ,       ,       ,       ,       ,
       ,       ,       ,       ,  -1   ,['c-5'],
       ,       ,       ,       ,       ,       ,
       ,       ,       ,       ,       ,  -1   ,
]
var pad1_0=[
['f-5'],       ,       ,       ,       ,       ,
       ,       ,       ,       ,  -1   ,['f-5'],
       ,       ,       ,       ,       ,       ,
       ,       ,       ,       ,       ,  -1   ,
]
var pad1_1=[
['e-5'],       ,       ,       ,       ,       ,
       ,       ,       ,       ,  -1   ,['f-5'],
       ,       ,       ,       ,       ,       ,
       ,       ,       ,       ,       ,  -1   ,
]
var pad1_2=[
['e-5'],       ,       ,       ,       ,       ,
       ,       ,       ,       ,  -1   ,['d#5'],
       ,       ,       ,       ,       ,       ,
       ,       ,       ,       ,       ,  -1   ,
]
var pad2_0=[
['a-5'],       ,       ,       ,       ,       ,
       ,       ,       ,       ,  -1   ,['a-5'],
       ,       ,       ,       ,       ,       ,
       ,       ,       ,       ,       ,  -1   ,
]
var pad2_1=[
['g-5'],       ,       ,       ,       ,       ,
       ,       ,       ,       ,  -1   ,['a#5'],
       ,       ,       ,       ,       ,       ,
       ,       ,       ,       ,       ,  -1   ,
]
var pad2_2=[
['g-5'],       ,       ,       ,       ,       ,
       ,       ,       ,       ,  -1   ,['g-5'],
       ,       ,       ,       ,       ,       ,
       ,       ,       ,       ,       ,  -1   ,
]

var melody1=[
       ,       ,       ,['a-5'],  -1   ,['c-6'],
  -1   ,       ,['c-6'],  -1   ,       ,['c-6'],
       ,       ,       ,['d-6'],  -1   ,       ,
       ,       ,       ,['a-5'],       ,       ,
['g-5'],       ,       ,       ,  -1   ,['f-5'],
       ,       ,['e-5'],       ,       ,['f-5'],
       ,       ,       ,       ,       ,       ,
['a#5'],       ,       ,       ,       ,       ,
['c-6'],       ,       ,['a-5'],       ,['g-5'],
['f-5'],       ,['d-5'],  -1   ,       ,['c-5'],
       ,       ,       ,['d-5'],  -1   ,       ,
['c-5'],['d-5'],['f-5'],['g-5'],['a-5'],['c-6'],
['d-6'],       ,       ,       ,       ,       ,
       ,  -1   ,['f-6'],  -1   ,       ,['g-6'],
       ,       ,       ,       ,       ,       ,
       ,       ,       ,       ,       ,       ,
]

SONG.seq = [
bass.concat(bass2,bass,bass3),
melody1, melody1.rotate(-3), melody1.rotate(-6),
pad0_0.concat(pad0_1,pad0_0,pad0_2),
pad1_0.concat(pad1_1,pad1_0,pad1_2),
pad2_0.concat(pad2_1,pad2_0,pad2_2),
]

/* ----------------------------- */
return SONG;
/* ----------------------------- */
})();
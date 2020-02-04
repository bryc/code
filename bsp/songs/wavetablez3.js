BSP.SONG = (function(SONG = {}) {

function bT() {
    for(var i = 0, out = []; i < arguments.length; i++) {
        var item = arguments[i];
        if(typeof item === 'number' && SONG.ptrn[item] !== undefined)
            item = SONG.ptrn[item];
        if(Array.isArray(item)) out = out.concat(item);
    }
    return out;
}
Array.prototype.rot=function(t){return this.slice(t,this.length).concat(this.slice(0,t))}
TSH=s=>{for(var i=0,h=9;i<s.length;)h=Math.imul(h^s.charCodeAt(i++),9**9);return h^h>>>9}
var mb32=s=>t=>(s=s+1831565813|0,t=Math.imul(s^s>>>15,1|s),t=t+Math.imul(t^t>>>7,61|t)^t,(t^t>>>14)>>>0)/2**32;
var rand1 = mb32(3657)
var rand2 = mb32(763)
var rand3 = mb32(246)
var rand4 = mb32(49)
var rand5 = mb32(133)

// Waveform data generators
var tri=Array(32).fill(1).map((a,i)=>i<17?a-.125*i:a+.125*i-4),
    squ=Array(32).fill(1).map((a,i)=>i>15?-1:a),
    saw=Array(32).fill(1).map((a,i)=>a-.0625*i),
    sin=Array(32).fill(1).map((a,i)=>a*Math.sin(i/5)),
    rnd=function(seed) {
        var rand = mb32(TSH(seed));
        return Array(32).fill(1).map(a=>Math.round((rand()*2-1)*1000)/1000);
    }
    
      
    function mix(a, b) {
        var wave = [];
        for(var i = 0; i < 32; i++) {
            wave[i] = a[i] - b[i];
        }
        return wave;
    }
    
    var wave = mix(squ, rnd("abwed"));

function mul(arr) {
    for(var i = 0, newarr = []; i < arr.length; i++) newarr.push(arr[i],arr[i])
        return newarr;
}


function genPWM() {
    var out = [];
    for(var i = 0; i < 32; i++) {
        out = out.concat(squ.rot(i));
    }
    return out;
}
/* ----------------------------- */
SONG.title   = "wavetablez3"
SONG.author  = "bryc"
SONG.date    = "jan-15-2020"
SONG.comment = 
`Same as wavetablez2, but uses custom waveform generators rather than hard-coding them.
These waveforms are longer (64 and 256 for bass) but require higher sample rates for proper tuning.
Need to find a way around this sampling rate fiasco.
Also added a "note-cut" modifier for the bass and drums.`
SONG.bpm     = 84
SONG.divide  = 6
SONG.cVol    = [
0.13, // 0 arp
0.12, // 1 bass
0.18, // 2 noise
0.12, // 3 melo
0.09, // 4 arp2
0.14] // 5 bass2
SONG.wave    = [4, 4, 4, 4, 4, 4]
SONG.delay   = [.2, .13, 0, .4, .2, .3]

SONG.sampleData = []
SONG.sampleData[0] = [11025*2, mul(mix(tri,rnd("wqr")))]
SONG.sampleData[1] = [44100*2, mul(mix(tri,tri)).concat(mul(mix(squ,rnd("das")))).concat(mul(mix(tri,tri)).concat(mul(mix(squ.rot(-16),rnd("das")))))   ]
SONG.sampleData[2] = [44100, [...Array(2048)].map(q=>rand1()*2-1)]
SONG.sampleData[3] = [11025*2, mul(mix(saw,rnd("axf")))]
SONG.sampleData[4] = [11025*2 + 64, mul(mix(squ,rnd("qzu")))]
SONG.sampleData[5] = [44100*2 + 128, mul(mix(tri,tri)).concat(mul(mix(saw,rnd("das")))).concat(mul(mix(tri,tri)).concat(mul(mix(saw.rot(-16),rnd("das")))))   ]

SONG.ptrn = [
[ 
['c-6'],['a#5'],['g-5'],['d-5'],['g-5'],['a#5'],
['c-6'],['a#5'],['g-5'],['d-5'],['g-5'],['a#5'],
['c-6'],['a#5'],['f-5'],['d-5'],['f-5'],['a#5'],
['c-6'],['a#5'],['f-5'],['d-5'],['f-5'],['a#5'],
],
[
['b-5'],['a-5'],['e-5'],['b-4'],['e-5'],['a-5'],
['b-5'],['a-5'],['e-5'],['b-4'],['e-5'],['a-5'],
['b-5'],['g-5'],['d-5'],['b-4'],['d-5'],['g-5'],
['b-5'],['g-5'],['d-5'],['b-4'],['d-5'],['g-5'],
],
[
['b-5'],['g#5'],['e-5'],['b-4'],['e-5'],['g#5'],
['b-5'],['g#5'],['e-5'],['b-4'],['e-5'],['g#5'],
['d-6'],['g-5'],['e-5'],['g-4'],['e-5'],['g-5'],
['d-6'],['g-5'],['e-5'],['g-4'],['e-5'],['g-5'],
],
[
['g-1'],,,,,-1,
,,['g-2'],['g-1'],-1,['g-2'],
['g-1'],,,,,-1,
,,['g-2'],['g-1'],-1,['g-2'],
],
[
['g-1'],,,,-1,['g-1'],
-1,,['g-2'],['g-1'],-1,['g-2'],
['g-1'],,,,-1,['g-1'],
-1,,['g-2'],['g-1'],-1,['g-2'],
],
[
['g-1'],,-1,['g-1'],-1,['g-1'],
-1,,['g-2'],['g-1'],-1,['g-2'],
['g-1'],-1,['g-1'],['g-2'],-1,['g-1A'],
['g-1'],-1,['g-1'],['g-2'],['g-1'],['g-2'],
],
[
['d#1'],-1,['d#1'],['d#2'],-1,['d#1A'],
['d#1'],-1,['d#1'],['d#2'],['a#1'],['d#1'],
['g-1'],-1,['g-1'],['g-2'],-1,['g-1A'],
['g-1'],-1,['g-1'],['g-2'],['d-2'],['g-1'],
],
[
['c-1'],-1,['c-1'],['c-2'],-1,['c-1A'],
['c-1'],-1,['c-1'],['c-2'],['g-1'],['c-1'],
['g-1'],-1,['g-1'],['g-2'],-1,['g-1A'],
['g-1'],-1,['g-1'],['g-2'],['d-2'],['g-1'],
],
[
['e-1'],-1,['e-2'],['e-1'],-1,['e-1'],
['e-2'],-1,['e-1'],['e-2'],['e-1'],['e-3'],
['e-1'],-1,['e-2'],['e-1'],-1,['e-1'],
['e-2'],-1,['e-1'],['e-2'],['e-1'],['d-2'],
],
[
['b-1A'],,['c#1E'],['b-3A'],,,
,,['f#3G'],['b-3A'],,['e-2A'],
['b-1E'],,['c#1E'],['b-3A'],,['b-1D'],
,,['b-1D'],['b-3A'],,['e-2A'],
],
[
['f-2'],,-1,['d-4D'],-1,,
['f-2'],,-1,['d-4D'],-1,['d-4D'],
['f-2'],,['d-4D'],['f-2'],,['d-4D'],
['a-4A'],['a-3A'],['e-3A'],['a-2A'],['f-2A'],['d-2A'],
],
[
['a#4',,,0],['a#4',,,.03 ,,],['a#4',,,.05,,],-1,['d#4',,,0 ,,],['f-4'],
['g-4'],,,['c-5'],,,
['d-5',,,0,,0],['d-5',,,.03,,],['d-5',,,.05,,],-1,,,
['a#4',,,0,,],['a#4',,,.03,,],['a#4',,,.05,,],-1,,,
],
[
['g-4',,,0],['g-4',,,.03,,],['g-4',,,.05,,],-1,['c-4',,,0,,],['d-4'],
['e-4'],,,['a-4'],,,
['b-4',,,0,,0],['b-4',,,.03,,],['b-4',,,.05,,],-1,,,
['g-4',,,0,,],['g-4',,,.03,,],['g-4',,,.05,,],-1,,,
],
[
['g-4',,,0,,0],['g-4',,,.03,,],['g-4',,,.05,,],-1,['c-4',,,0,,],['d-4'],
['e-4',,,0,,0],,,['a-4'],,,
['b-4'],,['a-4'],,-1,,
['e-4'],,,-1,,,
],
[
['e-6'],['e-5'],['g#5'],['b-4'],['g#5'],['e-5'],
['e-6'],['g#5'],['e-5'],['b-4'],['g#5'],['e-5'],
['a-5'],['e-5'],['g-5'],['g-4'],['g-5'],['e-5'],
['a-5'],['e-5'],['g-5'],['g-4'],['g-5'],['e-5'],
],
[
['e-3'],-1,['e-4'],['e-3'],-1,['e-3'],
['e-4'],-1,['e-3'],['e-4'],['e-3'],['e-5'],
['e-3'],-1,['e-4'],['e-3'],-1,['e-3'],
['e-4'],-1,['e-3'],['e-4'],['e-3'],['d-4'],
]
];

SONG.seq = [
// arp
bT(
    0,0,0,0,0,0,
    0,0,1,1,
    0,0,1,1,
    0,0,1,1,
    2,2,2,2,2,2,
    [-1,,,,,,]
),
// bass
bT(
    Array(24*2),3,3,4,5,
    6,6,7,7,
    6,6,7,7,
    6,6,7,7,
    8,8,8,8,8,8,
    [['e-1'],,,,,-1]
),
// noise
bT(
    Array(24*6),
    9,9,9,9,
    9,9,9,9,
    9,9,9,10,
    9,9,9,9,9,9,
    [,,,,,,]
),
// melo
bT(
    Array(24 * 10),
    11,11,12,12,
    11,11,12,13,
    Array(24 * 6),
    [,,,,,,]
),
// arp overlay
bT(
    Array(24*18),
    14,14,14,14,14,14,
    [-1,,,,,,]
),
// bass end high
bT(
    Array(24*22), 15, 15,
    [['e-3'],,,,,-1]
),
]


for(var i = 0; i < SONG.seq.length; i++) {
    //SONG.seq[i] = SONG.seq[i].slice(24*8,24*15)
}

/* ----------------------------- */
return SONG;
/* ----------------------------- */
})();
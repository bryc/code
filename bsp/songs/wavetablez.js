BSP.SONG = (function(SONG = {}) {

/* ----------------------------- */
SONG.title   = "wavetablez"
SONG.author  = "bryc"
SONG.date    = "may-10-2019"
SONG.comment = "messing with single cycle waveforms (not yet actually wavetables)"
SONG.bpm     = 84
SONG.divide  = 6
SONG.cVol    = [
0.12 + .0010, // arp
0.12 + .0030, // bass
0.12 + .0008, // noise
0.15 + .0055, // melo
0.08 + .0002, // arp2
0.12 + .0025] // bass2
SONG.wave    = [5, 1, 4, 3, 5, 1]
SONG.delay   = [.25, .1, 0, .27, .25, .3]

var noiseData = [];
for (var i = 0; i < 2048; i++) noiseData.push(Math.random() * 2);

SONG.sampleData = []
SONG.sampleData[2] = [22050, noiseData]

//
var arp0A = [
['c-7',,0.91,5,7800,.8],['a#6'],['g-6'],['d-6'],['g-6'],['a#6'],
['c-7'],['a#6'],['g-6'],['d-6'],['g-6'],['a#6'],
['c-7'],['a#6'],['f-6'],['d-6'],['f-6'],['a#6'],
['c-7'],['a#6'],['f-6'],['d-6'],['f-6'],['a#6'],
]

var arp0B  = [
['b-6'],['a-6'],['e-6'],['b-5'],['e-6'],['a-6'],
['b-6'],['a-6'],['e-6'],['b-5'],['e-6'],['a-6'],
['b-6'],['g-6'],['d-6'],['b-5'],['d-6'],['g-6'],
['b-6'],['g-6'],['d-6'],['b-5'],['d-6'],['g-6'],
]

var arp0C = [
['b-6'],['g#6'],['e-6'],['b-5'],['e-6'],['g#6'],
['b-6'],['g#6'],['e-6'],['b-5'],['e-6'],['g#6'],
['d-7'],['g-6'],['e-6'],['g-5'],['e-6'],['g-6'],
['d-7'],['g-6'],['e-6'],['g-5'],['e-6'],['g-6'],
]

var arp1  = [
['e-7',,0.43,6,5000,1],['e-6'],['g#6'],['b-5'],['g#6'],['e-6'],
['e-7'],['g#6'],['e-6'],['b-5'],['g#6'],['e-6'],
['a-6'],['e-6'],['g-6'],['g-5'],['g-6'],['e-6'],
['a-6'],['e-6'],['g-6'],['g-5'],['g-6'],['e-6'],
//,,,,,,
]

var melo2A = [
['a#5',,0.5, 0,,0],['a#5',,0.5,25 ,,],['a#5',,0.5,15,,],-1,['d#5',,0.5,0 ,,],['f-5'],
['g-5'],,,['c-6'],,,
['d-6',,0.5, 0,,0],['d-6',,0.5, 5,,],['d-6',,0.5, 15,,],-1,,,
['a#5',,0.5, 0,,],['a#5',,0.5, 5,,],['a#5',,0.5, 15,,],-1,,,
]

var melo2B = [
['g-5',,0.5, 0,,0],['g-5',,0.5, 25,,],['g-5',,0.5, 15,,],-1,['c-5',,0.5, 0,,],['d-5'],
['e-5'],,,['a-5'],,,
['b-5',,0.3, 0,,0],['b-5',,0.5, 5,,],['b-5',,0.5, 15,,],-1,,,
['g-5',,0.5, 0,,],['g-5',,0.5, 5,,],['g-5',,0.5, 15,,],-1,,,
]

var melo2C = [
['g-5',,0.5, 0,,0],['g-5',,0.5, 5,,],['g-5',,0.5, 15,,],-1,['c-5',,0.5, 0,,],['d-5'],
['e-5',,0.5, 0,,0],,,['a-5'],,,
['b-5'],,['a-5'],,-1,,
['e-5'],,,-1,,,
]

var bass3iA = [
['g-2'],,,,,-1,
,,['g-3'],['g-2'],-1,['g-3'],
['g-2'],,,,,-1,
,,['g-3'],['g-2'],-1,['g-3'],
]
var bass3iB = [
['g-2'],,,,-1,['g-2'],
-1,,['g-3'],['g-2'],-1,['g-3'],
['g-2'],,,,-1,['g-2'],
-1,,['g-3'],['g-2'],-1,['g-3'],
]
var bass3iC = [
['g-2'],,-1,['g-2'],-1,['g-2'],
-1,,['g-3'],['g-2'],-1,['g-3'],
['g-2'],-1,['g-2'],['g-3'],-1,['g-2'],
['g-2'],-1,['g-2'],['g-3'],['g-2'],['g-3'],
]

var bass3A = [
['d#2'],-1,['d#2'],['d#3'],-1,['d#2'],
['d#2'],-1,['d#2'],['d#3'],['a#2'],['d#2'],
['g-2'],-1,['g-2'],['g-3'],-1,['g-2'],
['g-2'],-1,['g-2'],['g-3'],['d-3'],['g-2'],
]
var bass3B = [
['c-2'],-1,['c-2'],['c-3'],-1,['c-2'],
['c-2'],-1,['c-2'],['c-3'],['g-2'],['c-2'],
['g-2'],-1,['g-2'],['g-3'],-1,['g-2'],
['g-2'],-1,['g-2'],['g-3'],['d-3'],['g-2'],
]

///////////
var bass3eA = [
['e-2'],-1,['e-3'],['e-2'],-1,['e-2'],
['e-3'],-1,['e-2'],['e-3'],['e-2'],['e-4'],
['e-2'],-1,['e-3'],['e-2'],-1,['e-2'],
['e-3'],-1,['e-2'],['e-3'],['e-2'],['d-3'],
]
var bass3eB = [
['e-4'],-1,['e-5'],['e-4'],-1,['e-4'],
['e-5'],-1,['e-4'],['e-5'],['e-4'],['e-6'],
['e-4'],-1,['e-5'],['e-4'],-1,['e-4'],
['e-5'],-1,['e-4'],['e-5'],['e-4'],['d-5'],
]

//////////
var noise = [
['d-3'],,-1,['b-4'],-1,,
,,-1,['b-4'],-1,['c-4'],
['d-3'],,-1,['b-4'],-1,,
,,-1,['b-4'],-1,,
]
var noise2 = [
['d-3'],,-1,['b-4'],-1,,
['d-3'],,-1,['b-4'],-1,,
['d-3'],,-1,['b-4'],-1,,
['d-3'],,-1,['b-4'],-1,,
]

SONG.seq = [
// arp1
[].concat(
    arp0A,arp0A,arp0A,arp0A,arp0A,arp0A,
    arp0A,arp0A,arp0B,arp0B,
    arp0A,arp0A,arp0B,arp0B,
    arp0A,arp0A,arp0B,arp0B,
    arp0C,arp0C,arp0C,arp0C,arp0C,arp0C,
    [-1,-1,-1,-1,-1,-1]
),
// bass
[].concat(
    Array(24).fill(-1),Array(24),bass3iA,bass3iA,bass3iB,bass3iC,
    bass3A,bass3A,bass3B,bass3B,
    bass3A,bass3A,bass3B,bass3B,
    bass3A,bass3A,bass3B,bass3B,
    bass3eA,bass3eA,bass3eA,bass3eA,bass3eA,bass3eA,
    [['e-2'], , , , , ]
),
// noise
[].concat(
    Array(24),Array(24),Array(24),Array(24),Array(24),Array(24),
    noise,noise,noise,noise,
    noise,noise,noise,noise,
    noise,noise,noise,noise2,
    noise,noise,noise,noise,noise,noise,noise
    [-1,-1,-1,-1,-1,-1]
),
// melo
[].concat(
    Array(24).fill(-1),Array(24),Array(24),Array(24),Array(24),Array(24),
    Array(24),Array(24),Array(24),Array(24),
    melo2A,melo2A,melo2B,melo2B,
    melo2A,melo2A,melo2B,melo2C,
    Array(24),Array(24),Array(24),Array(24),Array(24),Array(24),
    [-1,-1,-1,-1,-1,-1]
),
// arp2
[].concat(
    Array(24).fill(-1),Array(24),Array(24),Array(24),Array(24),Array(24),
    Array(24),Array(24),Array(24),Array(24),
    Array(24),Array(24),Array(24),Array(24),
    Array(24),Array(24),Array(24),Array(24),
    arp1,arp1,arp1,arp1,arp1,arp1,
    [-1,-1,-1,-1,-1,-1]
),
// bass end high
[].concat(
    Array(24).fill(-1),Array(24),Array(24),Array(24),Array(24),Array(24),
    Array(24),Array(24),Array(24),Array(24),
    Array(24),Array(24),Array(24),Array(24),
    Array(24),Array(24),Array(24),Array(24),
    Array(24),Array(24),Array(24),Array(24),bass3eB,bass3eB,
    [['e-4'], , , ,  , ]
),
]

/* ----------------------------- */
return SONG;
/* ----------------------------- */
})();
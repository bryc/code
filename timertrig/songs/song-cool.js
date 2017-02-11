SONG = {}

SONG.title  = "cool"
SONG.author = "bryc"
SONG.comment = "lets see what we can do with funky time signatures!"
SONG.speed  = 85
SONG.wave   = [1,3,0,2]
SONG.divide = 6

SONG.seq = [
[//BASS
    ['b2'], null, null, ['d4'], null, ['a2'],
    -1, null, ['e2'], ['d3'], null, -1,
    ['d3'], -1, ['d3'], ['d3',0.2/1.3], -1, ['g3'],
    -1, null, ['b3'], ['d4'], null, -1,

    ['b2'], null, null, ['d4'], null, ['a2'],
    -1, null, ['e2'], ['d3'], null, -1,
    ['g3'], -1, ['g3'], ['g3',0.2/1.3], -1, ['g2'],
    null, null, ['e3'], null, null, ['d3']
],
[//MELO
    ['b6'], null, -1, ['b6',0.2/2], null, ['d7'],
    ['b6',0.2/3], null, ['g7'], null, -1, ['g7',0.2/2],
    ['f#7'], null, ['d7'], ['e7'], ['d7',0.2/2], ['g7'],
    null, -1, null, ['g7',0.2/3], null, -1,

    ['b6'], null, -1, ['b6',0.2/2], null, ['d7'],
    ['b6',0.2/3], null, ['g7'], null, -1, ['g7',0.2/2],
    ['b7'], null, ['g7'], ['a7'], ['g7',0.2/2], ['f#7'],
    null, -1, ['d7'], ['c#7'], ['a6'], ['f#6']
],
[//CHORD1
    -1, null, null, ['b5'], null, null,
    ['f#6'], -1, ['d6'], -1, null, ['d6'],
    -1, null, null, ['b5'], null, null,
    -1, null, null, null, null, null,

    null, null, null, ['b5'], null, null,
    -1, null, ['d6'], -1, null, ['d6'],
    ['c#6'], ['d6'], ['e6'], ['b5'], null, null,
    ['e5'], ['g5'], ['b5'], ['d5'], null, null
],
[//CHORD2
    -1, null, null, ['f#5'], null, null,
    null, null, ['b5'], -1, null, ['a5'],
    -1, null, null, ['g5'], null, null,
    -1, null, null, null, null, null,

    null, null, null, ['f#5'], null, null,
    -1, null, ['b6'], -1, null, ['a5'],
    null, null, null, ['g5'], null, null,
    null, null, null, ['a4'], null, null
]
]
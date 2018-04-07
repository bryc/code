/*
    MurmurHash1
    ---------------
    32-bit MurmurHash1 implemented by bryc (github.com/bryc)
*/

function MurmurHash1(key, seed = 0) {
    var m = 3332679571, h = Math.imul(key.length, m) ^ seed;

    for(var i = 0, b = key.length & -4; i < b; i += 4) {
        h += key[i+3] << 24 | key[i+2] << 16 | key[i+1] << 8 | key[i];
        h = Math.imul(h, m); h ^= h >>> 16;
    }
    
    switch(key.length & 3) {
        case 3: h += key[i+2] << 16;
        case 2: h += key[i+1] << 8;
        case 1: h += key[i];
                h = Math.imul(h, m); h ^= h >>> 16;
    }

    h = Math.imul(h, m); h ^= h >>> 10;
    h = Math.imul(h, m); h ^= h >>> 17;

    return h >>> 0;
}

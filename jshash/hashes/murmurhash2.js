/*
    MurmurHash2
    ---------------
    32-bit MurmurHash2 implemented by bryc (github.com/bryc)
*/

function MurmurHash2(key, seed = 0) {
    var m = 1540483477, h = key.length ^ seed;

    for(var i = 0, k, b = key.length & -4; i < b; i += 4) {
        k = key[i+3] << 24 | key[i+2] << 16 | key[i+1] << 8 | key[i];
        k = Math.imul(k, m); k ^= k >>> 24;
        h = Math.imul(h, m) ^ Math.imul(k, m);
    }

    switch (key.length & 3) {
        case 3: h ^= key[i+2] << 16;
        case 2: h ^= key[i+1] << 8;
        case 1: h ^= key[i];
                h = Math.imul(h, m);
    }

    h ^= h >>> 13;
    h = Math.imul(h, m); h ^= h >>> 15;

    return h >>> 0;
}

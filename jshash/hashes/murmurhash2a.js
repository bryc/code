/*
    MurmurHash2A
    ---------------
    32-bit MurmurHash2A implemented by bryc (github.com/bryc)
    Alternate version using Merkle–Damgård construction.
*/

function MurmurHash2(key, seed = 0) {
    var l, k, m = 1540483477, h = seed | 0;

    for(var i = 0, b = key.length & -4; i < b; i += 4) {
        k = key[i+3] << 24 | key[i+2] << 16 | key[i+1] << 8 | key[i];
        k = Math.imul(k, m); k ^= k >>> 24;
        h = Math.imul(h, m) ^ Math.imul(k, m);
    }

    k = 0;
    switch (key.length & 3) {
        case 3: k ^= key[i+2] << 16;
        case 2: k ^= key[i+1] << 8;
        case 1: k ^= key[i];
    }

    k = Math.imul(k, m); k ^= k >>> 24;
    h = Math.imul(h, m) ^ Math.imul(k, m);
    l = Math.imul(key.length, m); l ^= l >>> 24;
    h = Math.imul(h, m) ^ Math.imul(l, m);

    h ^= h >>> 13; h = Math.imul(h, m);
    h ^= h >>> 15;

    return h >>> 0;
}

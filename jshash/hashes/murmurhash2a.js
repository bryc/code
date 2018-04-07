/*
    MurmurHash2A
    ---------------
    32-bit MurmurHash2A implemented by bryc (github.com/bryc)
    Alternative version using Merkle–Damgård construction.
*/

function MurmurHash2(key, seed = 0) {
    var m = 1540483477, r = 24, l = key.length;
    var h = seed | 0;

    for(var i = 0, k, chunk = -4 & key.length; i < chunk; i += 4) {
        k = key[i+3] << 24 | key[i+2] << 16 | key[i+1] << 8 | key[i];
        k = Math.imul(k, m);
        k ^= k >>> r;
        h = Math.imul(h, m) ^ Math.imul(k, m);
    }
    k = 0;
    switch (3 & key.length) {
        case 3: k ^= key[i + 2] << 16;
        case 2: k ^= key[i + 1] << 8;
        case 1: k ^= key[i];
    }
    k = Math.imul(k, m);
    k ^= k >>> r;
    h = Math.imul(h, m) ^ Math.imul(k, m);

    l = Math.imul(l, m);
    l ^= l >>> r;
    h = Math.imul(h, m) ^ Math.imul(l, m);

    h ^= h >>> 13;
    h = Math.imul(h, m);
    h ^= h >>> 15;

    return h >>> 0;
}

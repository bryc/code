/*
    Cyb-Beta 2 hash (64-bit) (by github.com/bryc)
    -----------------
    This is a WIP, hasn't been fully tested.
    But it's very fast and has good basic avalanching and collision resistance.
    
    
    TERRIBLE Avalanche behavior! Don't recommend at all.
*/

function cyb_beta2(key, seed = 0) {
    var m1 = 1540483507, m2 = 3432918353, m3 = 433494437, m4 = 370248451;
    var h1 = seed ^ Math.imul(key.length, m3) + 1;
    var h2 = seed ^ Math.imul(key.length, m1) + 1;

    for (var k, i = 0, chunk = -4 & key.length; i < chunk; i += 4) {
        k = key[i+3] << 24 | key[i+2] << 16 | key[i+1] << 8 | key[i];
        k ^= k >>> 24;
        h1 = h2 ^ Math.imul(h1, m1) ^ k;
        h2 = h1 ^ Math.imul(h2, m3) ^ k;
    }
    switch (3 & key.length) {
        case 3: h1 ^= key[i+2] << 16, h2 ^= key[i+2] << 16;
        case 2: h1 ^= key[i+1] << 8, h2 ^= key[i+1] << 8;
        case 1: h1 ^= key[i], h2 ^= key[i];
                h1 = h2 ^ Math.imul(h1, m2);
                h2 = h1 ^ Math.imul(h2, m4);
    }
    h1 ^= h2 >>> 18, h1 = Math.imul(h1, m2), h1 ^= h2 >>> 22;
    h2 ^= h1 >>> 15, h2 = Math.imul(h2, m3), h2 ^= h1 >>> 13;

    return [h1 >>> 0, h2 >>> 0];
}

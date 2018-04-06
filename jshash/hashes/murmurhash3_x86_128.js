/*
    MurmurHash3_x86_128
    ---------------
    128-bit MurmurHash3 implemented by bryc (github.com/bryc)

    This function is equivalent to MurmurHash3_x86_128,
    which outputs a 128-bit hash (four 32-bit hashes).
    However, it seems that the original has a serious flaw.
    So this version attempts to fix it by ensuring the initial
    value of h1-h4 is unique by XORing c1-c4 to them.
    Not sure what went wrong - maybe this was a failed attempt
    to port MurmurHash3_x64_128 to 32-bit architectures...
    Oh well, it may be useful.
*/

function MurmurHash3_x86_128(key, seed = 0) {
    function rotl32(x,r) {return (x << r) | (x >>> (32 - r));}

    function fmix32(h) {
        h ^= h >>> 16;
        h = Math.imul(h, 2246822507);
        h ^= h >>> 13;
        h = Math.imul(h, 3266489909);
        h ^= h >>> 16;
        return h;
    }

    var c1 = 597399067;
    var c2 = 2869860233;
    var c3 = 951274213;
    var c4 = 2716044179;

    var h1 = seed ^ c1; // Remove these XORs for function's original output
    var h2 = seed ^ c2;
    var h3 = seed ^ c3;
    var h4 = seed ^ c4;

    for(var i = 0, k, chunk = -16 & key.length; i < chunk;) {
        k1 = key[i+3] << 24 | key[i+2] << 16 | key[i+1] << 8 | key[i], i += 4;
        k1 = Math.imul(k1, c1), k1 = rotl32(k1, 15), k1 = Math.imul(k1, c2), h1 ^= k1;
        h1 = rotl32(h1, 19), h1 += h2, h1 = Math.imul(h1, 5) + 1444728091;

        k2 = key[i+3] << 24 | key[i+2] << 16 | key[i+1] << 8 | key[i], i += 4;
        k2 = Math.imul(k2, c2), k2 = rotl32(k2, 16), k2 = Math.imul(k2, c3), h2 ^= k2;
        h2 = rotl32(h2, 17), h2 += h3, h2 = Math.imul(h2, 5) + 197830471;

        k3 = key[i+3] << 24 | key[i+2] << 16 | key[i+1] << 8 | key[i], i += 4;
        k3 = Math.imul(k3, c3), k3 = rotl32(k3, 17), k3 = Math.imul(k3, c4), h3 ^= k3;
        h3 = rotl32(h3, 15), h3 += h4, h3 = Math.imul(h3, 5) + 2530024501;

        k4 = key[i+3] << 24 | key[i+2] << 16 | key[i+1] << 8 | key[i], i += 4;
        k4 = Math.imul(k4, c4), k4 = rotl32(k4, 18), k4 = Math.imul(k4, c1), h4 ^= k4;
        h4 = rotl32(h4, 13), h4 += h1, h4 = Math.imul(h4, 5) + 850148119;
    }

    k1 = 0, k2 = 0, k3 = 0, k4 = 0;
    switch (15 & key.length) {
        case 15: k4 ^= key[i+14] << 16;
        case 14: k4 ^= key[i+13] << 8;
        case 13: k4 ^= key[i+12]
                 k4 = Math.imul(k4, c4), k4 = rotl32(k4, 18), k4 = Math.imul(k4, c1), h4 ^= k4;

        case 12: k3 ^= key[i+11] << 24;
        case 11: k3 ^= key[i+10] << 16;
        case 10: k3 ^= key[i+9] << 8;
        case  9: k3 ^= key[i+8]
                 k3 = Math.imul(k3, c3), k3 = rotl32(k3, 17), k3 = Math.imul(k3, c4), h3 ^= k3;

        case  8: k2 ^= key[i+7] << 24;
        case  7: k2 ^= key[i+6] << 16;
        case  6: k2 ^= key[i+5] << 8;
        case  5: k2 ^= key[i+4]
                 k2 = Math.imul(k2, c2), k2 = rotl32(k2, 16), k2 = Math.imul(k2, c3), h2 ^= k2;

        case  4: k1 ^= key[i+3] << 24;
        case  3: k1 ^= key[i+2] << 16;
        case  2: k1 ^= key[i+1] << 8;
        case  1: k1 ^= key[i]
                 k1 = Math.imul(k1, c1), k1 = rotl32(k1, 15), k1 = Math.imul(k1, c2), h1 ^= k1;
    }

    h1 ^= key.length, h2 ^= key.length, h3 ^= key.length, h4 ^= key.length;

    h1 += h2, h1 += h3, h1 += h4;
    h2 += h1, h3 += h1, h4 += h1;

    h1 = fmix32(h1);
    h2 = fmix32(h2);
    h3 = fmix32(h3);
    h4 = fmix32(h4);

    h1 += h2, h1 += h3, h1 += h4;
    h2 += h1, h3 += h1, h4 += h1;

    return [h1 >>> 0, h2 >>> 0, h3 >>> 0, h4 >>> 0];
}

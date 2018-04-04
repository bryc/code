/*
    MurmurHash3_x86_32
    ---------------
    32-bit MurmurHash3 implemented by bryc (github.com/bryc)
*/

function MurmurHash3(key, seed = 0) {
    function rotl32(x,r) {return (x << r) | (x >>> (32 - r));}

    var c1 = 3432918353, c2 = 461845907;
    var h = seed;

    for(var i = 0, k, chunk = -4 & key.length; i < chunk; i += 4) {
        k = key[i+3] << 24 | key[i+2] << 16 | key[i+1] << 8 | key[i];
        k = Math.imul(k, c1);
        k = rotl32(k, 15);
        k = Math.imul(k, c2);
        h ^= k;
        h = rotl32(h, 13);
        h = Math.imul(h, 5) + 3864292196;
    }

    k = 0;
    switch (3 & key.length) {
        case 3: k ^= key[i+2] << 16;
        case 2: k ^= key[i+1] << 8;
        case 1: k ^= key[i];
                k = Math.imul(k, c1);
                k = rotl32(k, 15);
                k = Math.imul(k, c2);
                h ^= k;
    }

    h ^= key.length;
    h ^= h >>> 16;
    h = Math.imul(h, 2246822507);
    h ^= h >>> 13;
    h = Math.imul(h, 3266489909);
    h ^= h >>> 16;

    return h >>> 0;
}

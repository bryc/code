/*
    MurmurHash2_64B 
    ---------------
    64-bit MurmurHash2 implemented by bryc (github.com/bryc)

    A bit of a quirky function with how it handles seeds.
    The original function used a 64-bit seed, and
    h1 was seeded with the low 32-bits, while h2 was seeded
    with the high 32-bits. This meant that if the seed was 
    under 0x100000000, h2 would always be seeded with 0.
    In this JS implementation the seed is handled differently. 

    The original function is actually not a true 64-bit hash
    and in some cases only has the collision resistance
    of a 32-bit hash. This version incorporates changes that
    should solve this, but gives different hash results.
*/

function MurmurHash2_64B(key, seed = 0) {
    var k1, k2, m = 1540483477, h1 = seed ^ key.length, h2 = h1 ^ m;

    for(var i = 0, b = key.length & -8; i < b;) {
        k1 = key[i+3] << 24 | key[i+2] << 16 | key[i+1] << 8 | key[i];
        k1 = Math.imul(k1, m); k1 ^= k1 >>> 24;
        h1 = Math.imul(h1, m) ^ Math.imul(k1, m); h1 ^= h2;
        i += 4;
        k2 = key[i+3] << 24 | key[i+2] << 16 | key[i+1] << 8 | key[i];
        k2 = Math.imul(k2, m); k2 ^= k2 >>> 24;
        h2 = Math.imul(h2, m) ^ Math.imul(k2, m); h2 ^= h1;
        i += 4;
    }
    
    if(key.length - b >= 4) { // handle the final 4-byte block
        k1 = key[i+3] << 24 | key[i+2] << 16 | key[i+1] << 8 | key[i];
        k1 = Math.imul(k1, m); k1 ^= k1 >>> 24;
        h1 = Math.imul(h1, m) ^ Math.imul(k1, m); h1 ^= h2;
        i += 4;
    }

    switch (key.length & 3) {
        case 3: h2 ^= key[i+2] << 16;
        case 2: h2 ^= key[i+1] << 8;
        case 1: h2 ^= key[i];
                h2 = Math.imul(h2, m);
    }

    h1 ^= h2 >>> 18; h1 = Math.imul(h1, m);
    h2 ^= h1 >>> 22; h2 = Math.imul(h2, m);
    h1 ^= h2 >>> 17; h1 = Math.imul(h1, m);
    h2 ^= h1 >>> 19; h2 = Math.imul(h2, m);

    return [h1 >>> 0, h2 >>> 0]; // 52-bit output: h2 + (h1 & 2097151) * 4294967296;
}

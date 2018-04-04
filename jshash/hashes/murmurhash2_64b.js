/*
    MurmurHash2_64B
    ---------------
    64-bit MurmurHash2 implemented by bryc (github.com/bryc)

    A bit of a quirky function with how it handles seeds.
    The original function used a 64-bit seed, and
    h1 was seeded with the low 32-bits, while h2 was seeded
    with the high 32-bits. This meant that if the seed was 
    under 0x100000000, h2 would always be seeded with 0.
    In this JS implementation the original 64-bit
    seed is split into two 32-bit seeds: seed1 and seed2. 

    Because this is a 64-bit hash digest the output is an
    array of two 32-bit integers. A 52-bit JS integer can
    be constructed instead like so:
    return (h2 & 2097151) * 4294967296 + h1;

    Alternatively just use (example): pad(x[i].toString(16))
    for 64-bit hex string. It hits performance a bit though.
*/

function MurmurHash2_64B(key, seed1 = 0, seed2 = 0) {
    var m = 1540483477, r = 24;
    var h1 = seed1 ^ key.length;
    var h2 = seed2;

    for(var i = 0, k1, k2, chunk = -4 & key.length; i < chunk; i += 4) {
        k1 = key[i+3] << 24 | key[i+2] << 16 | key[i+1] << 8 | key[i];
        k1 = Math.imul(k1, m); k1 ^= k1 >>> r; k1 = Math.imul(k1, m);
        h1 = Math.imul(h1, m) ^ k1;

        if(i++ < chunk) {
            k2 = key[i+3] << 24 | key[i+2] << 16 | key[i+1] << 8 | key[i];
            k2 = Math.imul(k2, m); k2 ^= k2 >>> r; k2 = Math.imul(k2, m);
            h2 = Math.imul(h2, m) ^ k2;
        }
    }

    switch (3 & key.length) {
        case 3: h2 ^= key[i + 2] << 16;
        case 2: h2 ^= key[i + 1] << 8;
        case 1: h2 ^= key[i];
                h2 = Math.imul(h2, m);
    }

    h1 ^= h2 >>> 18; h1 = Math.imul(h1, m);
    h2 ^= h1 >>> 22; h2 = Math.imul(h2, m);
    h1 ^= h2 >>> 17; h1 = Math.imul(h1, m);
    h2 ^= h1 >>> 19; h2 = Math.imul(h2, m);

    return [h1 >>> 0, h2 >>> 0];
}
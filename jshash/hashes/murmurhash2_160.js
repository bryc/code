/*
    MurmurHash2_160
    ---------------
    160-bit MurmurHash2 implemented by bryc (github.com/bryc)

    From: https://simonhf.wordpress.com/2010/09/25/murmurhash160/
    Test Results: https://simonhf.wordpress.com/2010/09/26/

    Simon Hardy-Francis decided to modify MurmurHash2 to output 160 bits
    still using 32-bit arithmetic, and it looked interesting.
    It's quite fast, but each additional hash has an impact on performance.
*/

function MurmurHash2_160(key, seed = 0) {
    var m1 = 0x5bd1e995;
    var m2 = 0x19d699a5;
    var m3 = 0xb11924e1;
    var m4 = 0x16118b03;
    var m5 = 0x53c93455;
    var h1 = seed ^ key.length;
    var h2 = h1 ^ m2;
    var h3 = h1 ^ m3;
    var h4 = h1 ^ m4;
    var h5 = h1 ^ m5;
    var hash32 = [], r = 24;

    for(var i = 0, k, chunk = -4 & key.length; i < chunk; i += 4) {
        k = key[i+3] << 24 | key[i+2] << 16 | key[i+1] << 8 | key[i];
        k = Math.imul(k, m1);
        k ^= k >>> r;
        k = Math.imul(k, m1);

        h1 = Math.imul(h1, m1) ^ k, h1 ^= h2;
        h2 = Math.imul(h2, m2) ^ k, h2 ^= h3;
        h3 = Math.imul(h3, m3) ^ k, h3 ^= h4;
        h4 = Math.imul(h4, m4) ^ k, h4 ^= h5;
        h5 = Math.imul(h5, m5) ^ k, h5 ^= h1;
    }

    switch (3 & key.length) {
        case 3: h1 ^= key[i + 2] << 16;
                h2 ^= key[i + 2] << 16;
                h3 ^= key[i + 2] << 16;
                h4 ^= key[i + 2] << 16;
                h5 ^= key[i + 2] << 16;
        case 2: h1 ^= key[i + 1] << 8;
                h2 ^= key[i + 1] << 8;
                h3 ^= key[i + 1] << 8;
                h4 ^= key[i + 1] << 8;
                h5 ^= key[i + 1] << 8;
        case 1: h1 ^= key[i];
                h2 ^= key[i];
                h3 ^= key[i];
                h4 ^= key[i];
                h5 ^= key[i];
                h1 = Math.imul(h1, m1);
                h2 = Math.imul(h1, m2);
                h3 = Math.imul(h1, m3);
                h4 = Math.imul(h1, m4);
                h5 = Math.imul(h1, m5);
    }

    h1 ^= h1 >>> 13, h1 = Math.imul(h1, m1), h1 ^= h1 >>> 15;
    h2 ^= h2 >>> 13, h2 = Math.imul(h2, m2), h2 ^= h2 >>> 15;
    h3 ^= h3 >>> 13, h3 = Math.imul(h3, m3), h3 ^= h3 >>> 15;
    h4 ^= h4 >>> 13, h4 = Math.imul(h4, m4), h4 ^= h4 >>> 15;
    h5 ^= h5 >>> 13, h5 = Math.imul(h5, m5), h5 ^= h5 >>> 15;

    hash32[0] = (h1 ^ h2 ^ h3 ^ h4 ^ h5) >>> 0;
    hash32[1] = (h2 ^ h1) >>> 0;
    hash32[2] = (h3 ^ h1) >>> 0;
    hash32[3] = (h4 ^ h1) >>> 0;
    hash32[4] = (h5 ^ h1) >>> 0;

    return hash32;
}

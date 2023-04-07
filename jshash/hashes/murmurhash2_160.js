/*
    MurmurHash2_160
    ---------------
    160-bit MurmurHash2 implemented by bryc (github.com/bryc)

    From: https://simonhf.wordpress.com/2010/09/25/murmurhash160/
    Test Results: https://simonhf.wordpress.com/2010/09/26/

    Simon Hardy-Francis modifed MurmurHash2 to output 160 bits
    still using 32-bit arithmetic, and it looked interesting.
    It's quite fast, but each additional hash has an impact on performance.
    Have no idea if its output is as good a 160-bit hash or if it can be
    safely downscaled to 128, 96, 64 etc. But it seems to be good.
    
    Avalanche behavior is... slightly problematic.
    h3^h1 and h4^h1 have some noticeable bias.
    Highly recommend using murmurhash3_128 instead.  
*/

function MurmurHash2_160(key, seed = 0) {
    var k, m1 = 1540483477, m2 = 433494437, m3 = 2971215073,
        m4 = 370248451, m5 = 1405695061, h1 = key.length ^ seed,
        h2 = h1 ^ m2, h3 = h1 ^ m3, h4 = h1 ^ m4, h5 = h1 ^ m5;

    for(var i = 0, b = key.length & -4; i < b; i += 4) {
        k = key[i+3] << 24 | key[i+2] << 16 | key[i+1] << 8 | key[i];
        k = Math.imul(k, m1); k ^= k >>> 24;
        k = Math.imul(k, m1);

        h1 = Math.imul(h1, m1) ^ k ^ h2;
        h2 = Math.imul(h2, m2) ^ k ^ h3;
        h3 = Math.imul(h3, m3) ^ k ^ h4;
        h4 = Math.imul(h4, m4) ^ k ^ h5;
        h5 = Math.imul(h5, m5) ^ k ^ h1;
    }

    switch (key.length & 3) {
        case 3: h1 ^= key[i+2] << 16;
                h2 ^= key[i+2] << 16;
                h3 ^= key[i+2] << 16;
                h4 ^= key[i+2] << 16;
                h5 ^= key[i+2] << 16;
        case 2: h1 ^= key[i+1] << 8;
                h2 ^= key[i+1] << 8;
                h3 ^= key[i+1] << 8;
                h4 ^= key[i+1] << 8;
                h5 ^= key[i+1] << 8;
        case 1: h1 ^= key[i];
                h2 ^= key[i];
                h3 ^= key[i];
                h4 ^= key[i];
                h5 ^= key[i];
                h1 = Math.imul(h1, m1);
                h2 = Math.imul(h2, m2);
                h3 = Math.imul(h3, m3);
                h4 = Math.imul(h4, m4);
                h5 = Math.imul(h5, m5);
    }

    h1 ^= h1 >>> 13, h1 = Math.imul(h1, m1), h1 ^= h1 >>> 15;
    h2 ^= h2 >>> 13, h2 = Math.imul(h2, m2), h2 ^= h2 >>> 15;
    h3 ^= h3 >>> 13, h3 = Math.imul(h3, m3), h3 ^= h3 >>> 15;
    h4 ^= h4 >>> 13, h4 = Math.imul(h4, m4), h4 ^= h4 >>> 15;
    h5 ^= h5 >>> 13, h5 = Math.imul(h5, m5), h5 ^= h5 >>> 15;

    var out = [
        (h1 ^ h2 ^ h3 ^ h4 ^ h5) >>> 0,
        (h2 ^ h1) >>> 0,
        (h3 ^ h1) >>> 0,
        (h4 ^ h1) >>> 0,
        (h5 ^ h1) >>> 0
    ];

    return out;
}

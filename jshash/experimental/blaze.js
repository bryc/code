/*
    BlazeHash
    ---------
    Blazing fast 64-bit (or 52-bit) hash using native JS 32-bit math.
    Should have good collision rate.
    Passes my own tests but is untested in SMHasher, so this hash may be updated.

    c) 2018 bryc (github.com/bryc)
*/

function BlazeHash(key, seed = 0) {
    var p1 = 597399067, p2 = 374761393, h1 = 0xcafebabe ^ seed, h2 = 0xdeadbeef ^ seed;
    for(var i = 0, b = key.length & -4; i < b;) {
        h1 ^= key[i+3]<<24 | key[i+2]<<16 | key[i+1]<<8 | key[i]; i += 4;
        h2 ^= key[i+3]<<24 | key[i+2]<<16 | key[i+1]<<8 | key[i]; i += 4;
        h1 = Math.imul(h1, p1) ^ h2; h1 ^= h1 >>> 24;
        h2 = Math.imul(h2, p2) ^ h1; h2 ^= h2 >>> 24;
    }
    switch(key.length & 7) {
        case 7: h2 ^= key[i+6] << 16;
        case 6: h2 ^= key[i+5] << 8;
        case 5: h2 ^= key[i+4];
        h2 = Math.imul(h2, p2) ^ h1; h2 ^= h2 >>> 24;
        case 4: h1 ^= key[i+3] << 24;
        case 3: h1 ^= key[i+2] << 16;
        case 2: h1 ^= key[i+1] << 8;
        case 1: h1 ^= key[i];
        h1 = Math.imul(h1, p1) ^ h2; h1 ^= h1 >>> 24;
    }
    h1 ^= key.length; h2 ^= key.length;
    h1 = Math.imul(h1, p1) ^ h2; h1 ^= h1 >>> 18; h1 >>>= 0;
    h2 = Math.imul(h2, p2) ^ h1; h2 ^= h2 >>> 22; h2 >>>= 0;
    return [h1, h2]; // 52bit: (h1 & 2097151) * 4294967296 + h2
}

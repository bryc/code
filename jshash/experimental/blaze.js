/*
    BlazeHash
    c) 2018 bryc (github.com/bryc)
    
    Intended for blazing fast hashing of byte arrays. Produces two uncorrelated 32-bit hashes in parallel.
    Expect this function to change in the future as it is further tested and developed.
*/

function BlazeHash(key, seed = 0) {
    var p1 = 597399067, p2 = 374761393, p3 = 2246822507, p4 = 3266489909;
    var h1 = 0xcafebabe ^ seed, h2 = 0xdeadbeef ^ seed;
    for(var i = 0, b = key.length & -8; i < b;) {
        h1 ^= key[i+3] << 24 | key[i+2] << 16 | key[i+1] << 8 | key[i]; i += 4;
        h2 ^= key[i+3] << 24 | key[i+2] << 16 | key[i+1] << 8 | key[i]; i += 4;
        h1 = Math.imul(h1 ^ h1 >>> 16, p1) ^ h2;
        h2 = Math.imul(h2 ^ h2 >>> 24, p2) ^ h1;
    }
    switch(key.length & 7) {
        case 7: h2 ^= key[i+6] << 16;
        case 6: h2 ^= key[i+5] << 8;
        case 5: h2 ^= key[i+4];
        h2 = Math.imul(h2 ^ h2 >>> 24, p2) ^ h1;
        case 4: h1 ^= key[i+3] << 24;
        case 3: h1 ^= key[i+2] << 16;
        case 2: h1 ^= key[i+1] << 8;
        case 1: h1 ^= key[i];
        h1 = Math.imul(h1 ^ h1 >>> 16, p1) ^ h2;
    }
    h1 ^= key.length;
    h1 = Math.imul(h1 ^ h1 >>> 16, p3) ^ Math.imul(h2 ^ h2 >>> 13, p4);
    h2 = Math.imul(h2 ^ h2 >>> 16, p3) ^ Math.imul(h1 ^ h1 >>> 13, p4);
    return [h1 >>> 0, h2 >>> 0]; // 53bit: 4294967296 * (2097151 & h2) + (h1>>>0)
}

// An alternate version that reads 4 bytes at a time instead of 8, probably inefficient. Improved version of old Cyb-Beta 1.

function BlazeHashB(key, seed = 0) {
    var p1 = 597399067, p2 = 374761393, p3 = 2246822507, p4 = 3266489909;
    var h1 = 0xcafebabe ^ seed, h2 = 0xdeadbeef ^ seed;
    for(var k, i = 0, b = key.length & -4; i < b; i += 4) {
        k = key[i+3] << 24 | key[i+2] << 16 | key[i+1] << 8 | key[i];
        h1 ^= k; h1 = Math.imul(h1 ^ h1 >>> 16, p1) ^ h2;
        h2 ^= k; h2 = Math.imul(h2 ^ h2 >>> 24, p2) ^ h1;
    }
    k = 0;
    switch (3 & key.length) {
        case 3: k ^= key[i+2] << 16;
        case 2: k ^= key[i+1] << 8;
        case 1: k ^= key[i];
        h1 ^= k; h1 = Math.imul(h1 ^ h1 >>> 16, p1) ^ h2;
        h2 ^= k; h2 = Math.imul(h2 ^ h2 >>> 24, p2) ^ h1;
    }
    h1 ^= key.length;
    h1 = Math.imul(h1 ^ h1 >>> 16, p3) ^ Math.imul(h2 ^ h2 >>> 13, p4);
    h2 = Math.imul(h2 ^ h2 >>> 16, p3) ^ Math.imul(h1 ^ h1 >>> 13, p4);
    return [h1 >>> 0, h2 >>> 0]; // 53bit: 4294967296 * (2097151 & h2) + (h1>>>0)
}

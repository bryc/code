/*
    xxHash
    ---------------
    32-bit xxHash implemented by bryc (github.com/bryc)
*/

function xxHash(key, seed = 0) {
    function rotl32(x,r) {return (x << r) | (x >>> (32 - r));}
    function uint32(k,i) {return k[i+3] << 24 | k[i+2] << 16 | k[i+1] << 8 | k[i];}

    var p1 = 2654435761, p2 = 2246822519, p3 = 3266489917, p4 = 668265263, p5 = 374761393,
        v0 = seed + p5, v1 = seed + p1 + p2, v2 = seed + p2, v3 = seed, v4 = seed - p1, i = 0;

    if(key.length >= 16) {
        do {
            v1 += Math.imul(uint32(key, i), p2), i += 4;
            v1 = Math.imul(rotl32(v1, 13), p1);
            v2 += Math.imul(uint32(key, i), p2), i += 4;
            v2 = Math.imul(rotl32(v2, 13), p1);
            v3 += Math.imul(uint32(key, i), p2), i += 4;
            v3 = Math.imul(rotl32(v3, 13), p1);
            v4 += Math.imul(uint32(key, i), p2), i += 4;
            v4 = Math.imul(rotl32(v4, 13), p1);
        } while(i <= key.length - 16);

        v0 = rotl32(v1, 1) + rotl32(v2, 7) + rotl32(v3, 12) + rotl32(v4, 18);
    }

    v0 += key.length;
    while(i <= key.length - 4) {
        v0 += Math.imul(uint32(key, i), p3), i += 4;
        v0 = Math.imul(rotl32(v0, 17), p4);
    }

    while(i < key.length) {
        v0 += Math.imul(key[i++], p5);
        v0 = Math.imul(rotl32(v0, 11), p1);
    }

    v0 = Math.imul(v0 ^ v0 >>> 15, p2);
    v0 = Math.imul(v0 ^ v0 >>> 13, p3);

    return (v0 ^ v0 >>> 16) >>> 0;
}
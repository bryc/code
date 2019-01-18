/*
    xxHash
    ---------------
    32-bit xxHash implemented by bryc (github.com/bryc)
*/

function xxHash(key, seed = 0) {
    var p1 = 2654435761, p2 = 2246822519, p3 = 3266489917, p4 = 668265263, p5 = 374761393,
        v0 = seed+p5 | 0, v1 = seed+p1+p2 | 0, v2 = seed+p2 | 0, v3 = seed | 0, v4 = seed-p1 | 0,
        i = 0;

    if(key.length >= 16) {
        while(i <= key.length - 16) {
            v1 += Math.imul(key[i+3]<<24 | key[i+2]<<16 | key[i+1]<<8 | key[i], p2); i += 4;
            v1 = Math.imul(v1<<13 | v1>>>19, p1);
            v2 += Math.imul(key[i+3]<<24 | key[i+2]<<16 | key[i+1]<<8 | key[i], p2); i += 4;
            v2 = Math.imul(v2<<13 | v2>>>19, p1);
            v3 += Math.imul(key[i+3]<<24 | key[i+2]<<16 | key[i+1]<<8 | key[i], p2); i += 4;
            v3 = Math.imul(v3<<13 | v3>>>19, p1);
            v4 += Math.imul(key[i+3]<<24 | key[i+2]<<16 | key[i+1]<<8 | key[i], p2); i += 4;
            v4 = Math.imul(v4<<13 | v4>>>19, p1);
        }
        v0 = (v1<<1 | v1>>>31) + (v2<<7 | v2>>>25) + (v3<<12 | v3>>>20) + (v4<<18 | v4>>>14);
    }

    v0 += key.length;
    while(i <= key.length - 4) {
        v0 += Math.imul(key[i+3]<<24 | key[i+2]<<16 | key[i+1]<<8 | key[i], p3); i += 4;
        v0 = Math.imul(v0<<17 | v0>>>15, p4);
    }

    while(i < key.length) {
        v0 += Math.imul(key[i++], p5);
        v0 = Math.imul(v0<<11 | v0>>>21, p1);
    }

    v0 = Math.imul(v0 ^ v0>>>15, p2);
    v0 = Math.imul(v0 ^ v0>>>13, p3);
    v0 ^= v0>>>16;

    return v0>>>0;
}

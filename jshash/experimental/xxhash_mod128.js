/*
    This is an attempt to modify xxHash to produce a 128-bit hash. It's speed is pretty good.
    xxHash had to be modified heavily (removing v0, and only using v1-v4), changing final mix primes.
    So don't use it, it could be spectacularly bad.
*/

function badxxHashMod(key, seed = 0) {
    var p1 = 2654435761, p2 = 2246822519, p3 = 3266489917, p4 = 668265263, p5 = 374761393,
        v1 = seed+p1+p2 | 0, v2 = seed+p2 | 0, v3 = seed | 0, v4 = seed-p1 | 0,
        i = 0;

    if(key.length >= 16) {
        while(i <= key.length - 16) {
            v1 += Math.imul(key[i+3]<<24 | key[i+2]<<16 | key[i+1]<<8 | key[i], p2) ^ v2; i += 4;
            v1 = Math.imul(v1<<13 | v1>>>19, p1);
            v2 += Math.imul(key[i+3]<<24 | key[i+2]<<16 | key[i+1]<<8 | key[i], p2) ^ v3; i += 4;
            v2 = Math.imul(v2<<13 | v2>>>19, p1);
            v3 += Math.imul(key[i+3]<<24 | key[i+2]<<16 | key[i+1]<<8 | key[i], p2) ^ v4; i += 4;
            v3 = Math.imul(v3<<13 | v3>>>19, p1);
            v4 += Math.imul(key[i+3]<<24 | key[i+2]<<16 | key[i+1]<<8 | key[i], p2) ^ v1; i += 4;
            v4 = Math.imul(v4<<13 | v4>>>19, p1);
        }
        //v0 += (v1<<1 | v1>>>31) + (v2<<7 | v2>>>25) + (v3<<12 | v3>>>20) + (v4<<18 | v4>>>14);
    }

    v1 += key.length; v2 += key.length; v3 += key.length; v4 += key.length;

    var k1=0, k2=0, k3=0, k4=0;
    switch (key.length & 15) {
        case 15: k4 |= key[i+14] << 16;
        case 14: k4 |= key[i+13] << 8;
        case 13: k4 |= key[i+12];
                 v4 += Math.imul(k4, p5) ^ v1;
                 v4 = Math.imul(v4<<11 | v4>>>21, p1);
        case 12: k3 |= key[i+11] << 24;
        case 11: k3 |= key[i+10] << 16;
        case 10: k3 |= key[i+9] << 8;
        case  9: k3 |= key[i+8];
                 v3 += Math.imul(k3, p3) ^ v4;
                 v3 = Math.imul(v3<<17 | v3>>>15, p4);
        case  8: k2 |= key[i+7] << 24;
        case  7: k2 |= key[i+6] << 16;
        case  6: k2 |= key[i+5] << 8;
        case  5: k2 |= key[i+4];
                 v2 += Math.imul(k2, p3) ^ v3;
                 v2 = Math.imul(v2<<17 | v2>>>15, p4);
        case  4: k1 |= key[i+3] << 24;
        case  3: k1 |= key[i+2] << 16;
        case  2: k1 |= key[i+1] << 8;
        case  1: k1 |= key[i];
                 v1 += Math.imul(k1, p3) ^ v2;
                 v1 = Math.imul(v1<<17 | v1>>>15, p4);
    }

    v1 += v2; v1 += v3; v1 += v4;
    v2 += v1; v3 += v1; v4 += v1;

    v1 = Math.imul(v1 ^ v1>>>15, p2) ^ v2;
    v1 = Math.imul(v1 ^ v1>>>13, p3);
    v1 ^= v1>>>16;
    v2 = Math.imul(v2 ^ v2>>>15, p1) ^ v3;
    v2 = Math.imul(v2 ^ v2>>>13, p2);
    v2 ^= v2>>>16;
    v3 = Math.imul(v3 ^ v3>>>15, p4) ^ v4;
    v3 = Math.imul(v3 ^ v3>>>13, p1);
    v3 ^= v3>>>16;
    v4 = Math.imul(v4 ^ v4>>>15, p3) ^ v1;
    v4 = Math.imul(v4 ^ v4>>>13, p4);
    v4 ^= v4>>>16;

    return [v1>>>0, v2>>>0, v3>>>0, v4>>>0];
}

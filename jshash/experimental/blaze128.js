/* 
    BlazeHash128 prototype
    Uses some ideas from zzHash (+xxHash).
    It is faster than MurmurHash3_x86 and slightly faster than my XXH128 attempt.
    I think it can be improved further.
    
    Avalanche Results:
    Surprisngly impressive. However, slight bias with h2^h4 and odd issue with h1^h2, indicating mixing issues.
*/

function BlazeHash128(key, seed = 0) {
    var p1 = 2654435761, p2 = 2246822519, p3 = 3266489917, p4 = 668265263,
        h1 = p1 ^ seed,
        h2 = p2 ^ seed,
        h3 = p3 ^ seed,
        h4 = p4 ^ seed, h5;

    for(var i = 0, b = key.length & -16; i < b;) {
        h1 += key[i+3]<<24 | key[i+2]<<16 | key[i+1]<<8 | key[i]; i += 4;
        h2 += key[i+3]<<24 | key[i+2]<<16 | key[i+1]<<8 | key[i]; i += 4;
        h3 += key[i+3]<<24 | key[i+2]<<16 | key[i+1]<<8 | key[i]; i += 4;
        h4 += key[i+3]<<24 | key[i+2]<<16 | key[i+1]<<8 | key[i]; i += 4;
        h1 = Math.imul(h1, p1) + h2; h1 = Math.imul(h1, p3);
        h2 = Math.imul(h2, p2) + h3; h2 = Math.imul(h2, p4);
        h3 = Math.imul(h3, p3) + h4; h3 = Math.imul(h3, p1);
        h4 = Math.imul(h4, p4) + h1; h4 = Math.imul(h4, p2);
    }

    switch (key.length & 15) {
        case 15: h4 += key[i+14] << 16;
        case 14: h4 += key[i+13] << 8;
        case 13: h4 += key[i+12];
                 h4 = Math.imul(h4, p4) + h1; h4 = Math.imul(h4, p2);
        case 12: h3 += key[i+11] << 24;
        case 11: h3 += key[i+10] << 16;
        case 10: h3 += key[i+9] << 8;
        case  9: h3 += key[i+8];
                 h3 = Math.imul(h3, p3) + h4; h3 = Math.imul(h3, p1);
        case  8: h2 += key[i+7] << 24;
        case  7: h2 += key[i+6] << 16;
        case  6: h2 += key[i+5] << 8;
        case  5: h2 += key[i+4];
                 h2 = Math.imul(h2, p2) + h3; h2 = Math.imul(h2, p4);
        case  4: h2 += key[i+3] << 24;
        case  3: h1 += key[i+2] << 16;
        case  2: h1 += key[i+1] << 8;
        case  1: h1 += key[i];
                 h1 = Math.imul(h1, p1) + h2; h1 = Math.imul(h1, p3);
    }

    h5 = key.length + h1 + h2 + h3 + h4;
    h1 += h5; h2 ^= h5; h3 += h5; h4 ^= h5;

    h1 = Math.imul(h1^h1>>>15, p1); h1 = Math.imul(h1^h1>>>13, p2); h1 ^= h1>>>16;
    h2 = Math.imul(h2^h2>>>15, p2); h2 = Math.imul(h2^h2>>>13, p3); h2 ^= h2>>>16;
    h3 = Math.imul(h3^h3>>>15, p3); h3 = Math.imul(h3^h3>>>13, p4); h3 ^= h3>>>16;
    h4 = Math.imul(h4^h4>>>15, p4); h4 = Math.imul(h4^h4>>>13, p1); h4 ^= h4>>>16;

    h5 = h1 + h2 + h3 + h4;
    h1 += h5; h2 ^= h5; h3 += h5; h4 ^= h5;

    return [h1>>>0, h2>>>0, h3>>>0, h4>>>0];
}

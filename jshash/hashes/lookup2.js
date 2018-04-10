/*
    Jenkins lookup2
    ---------------
    Jenkins lookup2 hash implemented by bryc (github.com/bryc)
    Outputs 32-bit hash.

    Like lookup3, a,b,c can combine to produce 64 or 96-bit hash.
    However a and b seem to have lower quality collision resistance
    and distribution, resulting in a weaker 64-bit or 96-bit hash.

    This is explored in a paper (Chapter 4.1 Getting the most from Jenkins)
    "Although the word returned is the only one that satisfies certain properties
    that can be tested in Jenkins’ lookup2.c [12], we have found that for our purposes,
    extracting all three words from a single run of Jenkins is about as good as calling
    the function three times."
    Source: http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.4.6765
*/

function lookup2(k, init = 0) {
    var len = k.length, o = 0,
        a = 0x9e3779b9 | 0,
        b = 0x9e3779b9 | 0,
        c = init | 0;

    while (len >= 12) {
        a += k[o]   | k[o+1] << 8 | k[o+2]  << 16 | k[o+3]  << 24;
        b += k[o+4] | k[o+5] << 8 | k[o+6]  << 16 | k[o+7]  << 24;
        c += k[o+8] | k[o+9] << 8 | k[o+10] << 16 | k[o+11] << 24;

        a -= b; a -= c; a ^= c >>> 13;
        b -= c; b -= a; b ^= a << 8;
        c -= a; c -= b; c ^= b >>> 13;
        a -= b; a -= c; a ^= c >>> 12;
        b -= c; b -= a; b ^= a << 16;
        c -= a; c -= b; c ^= b >>> 5;
        a -= b; a -= c; a ^= c >>> 3;
        b -= c; b -= a; b ^= a << 10;
        c -= a; c -= b; c ^= b >>> 15;

        len -= 12, o += 12;
    }

    c += k.length;
    switch(len) {
        case 11: c += k[o+10] << 24;
        case 10: c += k[o+9] << 16;
        case  9: c += k[o+8] << 8;
            // the first byte of c is reserved for the length
        case  8: b += k[o+7] << 24;
        case  7: b += k[o+6] << 16;
        case  6: b += k[o+5] << 8;
        case  5: b += k[o+4];
        case  4: a += k[o+3] << 24;
        case  3: a += k[o+2] << 16;
        case  2: a += k[o+1] << 8;
        case  1: a += k[o];
    }

    a -= b; a -= c; a ^= c >>> 13;
    b -= c; b -= a; b ^= a << 8;
    c -= a; c -= b; c ^= b >>> 13;
    a -= b; a -= c; a ^= c >>> 12;
    b -= c; b -= a; b ^= a << 16;
    c -= a; c -= b; c ^= b >>> 5;
    a -= b; a -= c; a ^= c >>> 3;
    b -= c; b -= a; b ^= a << 10;
    c -= a; c -= b; c ^= b >>> 15;

    return c >>> 0;
}

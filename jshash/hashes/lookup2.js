/*
    Jenkins lookup2
    ---------------
    Jenkins lookup2 hash implemented by bryc (github.com/bryc)
    Like lookup3, a,b,c can combine to produce 64 or 96-bit hash.
    However only c as a 32-bit hash is recommended, indicating
    possible quality (mixed less) issues in the others.

    Source: Chapter 4.1 Getting the most from Jenkins
    citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.4.6765
*/

function lookup2(k, init = 0) {
    var a = 2654435769, b = 2654435769, c = init | 0, len = k.length, o = 0;

    while (len >= 12) {
        a += k[o] | k[o+1] << 8 | k[o+2] << 16 | k[o+3] << 24;
        b += k[o+4] | k[o+5] << 8 | k[o+6] << 16 | k[o+7] << 24;
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

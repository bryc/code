/*
    Jenkins lookup3 (hashlittle2)
    ---------------
    Jenkins lookup3 hash implemented by bryc (github.com/bryc)
    Can also output 64-bit hash. Possibly even 96-bit hash.
    
    Note from Bob:
    *pc is better mixed than *pb, so use *pc first.  If you want
    * a 64-bit value do something like "*pc + (((uint64_t)*pb)<<32)".
*/

function lookup3(k, init = 0, init2 = 0) {
    function rot(x,r) {return ((x<<r) | (x >>> (32 - r)));}

    var len = k.length, a, b, c, o = 0;
    a = b = c = (0xdeadbeef + len + init) >>> 0;
    c += init2;
    while (len > 12) {
        a += k[o]   | k[o+1]<<8 | k[o+2] <<16 | k[o+3] <<24;
        b += k[o+4] | k[o+5]<<8 | k[o+6] <<16 | k[o+7] <<24;
        c += k[o+8] | k[o+9]<<8 | k[o+10]<<16 | k[o+11]<<24;

        a -= c; a ^= rot(c, 4);  c = c + b >>> 0;
        b -= a; b ^= rot(a, 6);  a = a + c >>> 0;
        c -= b; c ^= rot(b, 8);  b = b + a >>> 0;
        a -= c; a ^= rot(c, 16); c = c + b >>> 0;
        b -= a; b ^= rot(a, 19); a = a + c >>> 0;
        c -= b; c ^= rot(b, 4);  b = b + a >>> 0;

        len -= 12;
        o += 12;
    }

    switch (len) {
    case 12:
        a += k[o]   | k[o+1]<<8 | k[o+2] <<16 | k[o+3] <<24;
        b += k[o+4] | k[o+5]<<8 | k[o+6] <<16 | k[o+7] <<24;
        c += k[o+8] | k[o+9]<<8 | k[o+10]<<16 | k[o+11]<<24;
        break;
    case 11:
        a += k[o]   | k[o+1]<<8 | k[o+2] <<16 | k[o+3]<<24;
        b += k[o+4] | k[o+5]<<8 | k[o+6] <<16 | k[o+7]<<24;
        c += k[o+8] | k[o+9]<<8 | k[o+10]<<16;
        break;
    case 10:
        a += k[o]   | k[o+1]<<8 | k[o+2]<<16 | k[o+3]<<24;
        b += k[o+4] | k[o+5]<<8 | k[o+6]<<16 | k[o+7]<<24;
        c += k[o+8] | k[o+9]<<8;
        break;
    case 9:
        a += k[o]   | k[o+1]<<8 | k[o+2]<<16 | k[o+3]<<24;
        b += k[o+4] | k[o+5]<<8 | k[o+6]<<16 | k[o+7]<<24;
        c += k[o+8];
        break;
    case 8:
        a += k[o]   | k[o+1]<<8 | k[o+2]<<16 | k[o+3]<<24;
        b += k[o+4] | k[o+5]<<8 | k[o+6]<<16 | k[o+7]<<24;
        break;
    case 7:
        a += k[o]   | k[o+1]<<8 | k[o+2]<<16 | k[o+3]<<24;
        b += k[o+4] | k[o+5]<<8 | k[o+6]<<16;
        break;
    case 6:
        a += k[o]   | k[o+1]<<8 | k[o+2]<<16 | k[o+3]<<24;
        b += k[o+4] | k[o+5]<<8;
        break;
    case 5:
        a += k[o]   | k[o+1]<<8 | k[o+2]<<16 | k[o+3]<<24;
        b += k[o+4];
        break;
    case 4:
        a += k[o] | k[o+1]<<8 | k[o+2]<<16 | k[o+3]<<24;
        break;
    case 3:
        a += k[o] | k[o+1]<<8 | k[o+2]<<16;
        break;
    case 2:
        a += k[o] | k[o+1]<<8;
        break;
    case 1:
        a += k[o];
        break;
    case 0:
        return [b >>> 0, c >>> 0];
    }

    c ^= b; c -= rot(b, 14);
    a ^= c; a -= rot(c, 11);
    b ^= a; b -= rot(a, 25);
    c ^= b; c -= rot(b, 16);
    a ^= c; a -= rot(c, 4);
    b ^= a; b -= rot(a, 14);
    c ^= b; c -= rot(b, 24);

    return [b >>> 0, c >>> 0];
}

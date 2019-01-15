/*
    HalfSipHash (2-4 rounds, double output)
    ---------------
    HalfSipHash implemented by bryc (github.com/bryc)

    This implements HalfSipHash in JS, the 32-bit version of SipHash. It is configured to use 2-4 rounds with double (64-bit) hash output.
    With slight modifications, the original 32-bit result can be obtained (see comments). You could also do 1-3 rounds but it's not much faster.

    It is seeded with a 64-bit key, supplied as two 32-bit numbers. The default here is the same as in the SipHash test.c program.

    It's speed is not too great in JS. Even after some optimizing, it's still about 10% slower than MurmurHash3_x86_128, which is a 128-bit hash.
    And quality-wise, it may not be as "secure" as the full x64 SipHash. It seems to fail one test of SMHasher (zeroes):
    https://github.com/rurban/smhasher/blob/master/doc/HalfSipHash

    Sources:
    https://github.com/veorq/SipHash/blob/master/halfsiphash.c
    https://github.com/rurban/smhasher/blob/master/halfsiphash.c
*/

function HalfSipHash(m, seed = 0x03020100, seed2 = 0x07060504) {
    var v0 = 0, v1 = 0, v2 = 0x6c796765, v3 = 0x74656462, k0 = seed, k1 = seed2, len = m.length;

    v3 ^= k1, v2 ^= k0, v1 ^= k1, v0 ^= k0;
    v1 ^= 0xEE; // This line ONLY for 64-bit output

    for(var k, i = 0, b = len & -4; i < b; i += 4) {
        k = m[i+3] << 24 | m[i+2] << 16 | m[i+1] << 8 | m[i];
        v3 ^= k;
        v0+=v1,v1=v1<<5|v1>>>27,v1^=v0,v0=v0<<16|v0>>>16,v2+=v3,v3=v3<<8|v3>>>24,v3^=v2,v0+=v3,v3=v3<<7|v3>>>25,v3^=v0,v2+=v1,v1=v1<<13|v1>>>19,v1^=v2,v2=v2<<16|v2>>>16;
        v0+=v1,v1=v1<<5|v1>>>27,v1^=v0,v0=v0<<16|v0>>>16,v2+=v3,v3=v3<<8|v3>>>24,v3^=v2,v0+=v3,v3=v3<<7|v3>>>25,v3^=v0,v2+=v1,v1=v1<<13|v1>>>19,v1^=v2,v2=v2<<16|v2>>>16;
        v0 ^= k;
    }

    k = len << 24;
    switch (len & 3) {
        case 3: k |= m[i+2] << 16;
        case 2: k |= m[i+1] << 8;
        case 1: k |= m[i];
    }

    v3 ^= k;
    v0+=v1,v1=v1<<5|v1>>>27,v1^=v0,v0=v0<<16|v0>>>16,v2+=v3,v3=v3<<8|v3>>>24,v3^=v2,v0+=v3,v3=v3<<7|v3>>>25,v3^=v0,v2+=v1,v1=v1<<13|v1>>>19,v1^=v2,v2=v2<<16|v2>>>16;
    v0+=v1,v1=v1<<5|v1>>>27,v1^=v0,v0=v0<<16|v0>>>16,v2+=v3,v3=v3<<8|v3>>>24,v3^=v2,v0+=v3,v3=v3<<7|v3>>>25,v3^=v0,v2+=v1,v1=v1<<13|v1>>>19,v1^=v2,v2=v2<<16|v2>>>16;
    v0 ^= k;
    v2 ^= 0xEE; // 0xFF here for 32-bit output, 0xEE for 64-bit output
    v0+=v1,v1=v1<<5|v1>>>27,v1^=v0,v0=v0<<16|v0>>>16,v2+=v3,v3=v3<<8|v3>>>24,v3^=v2,v0+=v3,v3=v3<<7|v3>>>25,v3^=v0,v2+=v1,v1=v1<<13|v1>>>19,v1^=v2,v2=v2<<16|v2>>>16;
    v0+=v1,v1=v1<<5|v1>>>27,v1^=v0,v0=v0<<16|v0>>>16,v2+=v3,v3=v3<<8|v3>>>24,v3^=v2,v0+=v3,v3=v3<<7|v3>>>25,v3^=v0,v2+=v1,v1=v1<<13|v1>>>19,v1^=v2,v2=v2<<16|v2>>>16;
    v0+=v1,v1=v1<<5|v1>>>27,v1^=v0,v0=v0<<16|v0>>>16,v2+=v3,v3=v3<<8|v3>>>24,v3^=v2,v0+=v3,v3=v3<<7|v3>>>25,v3^=v0,v2+=v1,v1=v1<<13|v1>>>19,v1^=v2,v2=v2<<16|v2>>>16;
    v0+=v1,v1=v1<<5|v1>>>27,v1^=v0,v0=v0<<16|v0>>>16,v2+=v3,v3=v3<<8|v3>>>24,v3^=v2,v0+=v3,v3=v3<<7|v3>>>25,v3^=v0,v2+=v1,v1=v1<<13|v1>>>19,v1^=v2,v2=v2<<16|v2>>>16;
    k0 = v1 ^ v3; // Stop here for 32-bit only. k0 is the final hash. Remainder is for second hash (k1).
    v1 ^= 0xDD;
    v0+=v1,v1=v1<<5|v1>>>27,v1^=v0,v0=v0<<16|v0>>>16,v2+=v3,v3=v3<<8|v3>>>24,v3^=v2,v0+=v3,v3=v3<<7|v3>>>25,v3^=v0,v2+=v1,v1=v1<<13|v1>>>19,v1^=v2,v2=v2<<16|v2>>>16;
    v0+=v1,v1=v1<<5|v1>>>27,v1^=v0,v0=v0<<16|v0>>>16,v2+=v3,v3=v3<<8|v3>>>24,v3^=v2,v0+=v3,v3=v3<<7|v3>>>25,v3^=v0,v2+=v1,v1=v1<<13|v1>>>19,v1^=v2,v2=v2<<16|v2>>>16;
    v0+=v1,v1=v1<<5|v1>>>27,v1^=v0,v0=v0<<16|v0>>>16,v2+=v3,v3=v3<<8|v3>>>24,v3^=v2,v0+=v3,v3=v3<<7|v3>>>25,v3^=v0,v2+=v1,v1=v1<<13|v1>>>19,v1^=v2,v2=v2<<16|v2>>>16;
    v0+=v1,v1=v1<<5|v1>>>27,v1^=v0,v0=v0<<16|v0>>>16,v2+=v3,v3=v3<<8|v3>>>24,v3^=v2,v0+=v3,v3=v3<<7|v3>>>25,v3^=v0,v2+=v1,v1=v1<<13|v1>>>19,v1^=v2,v2=v2<<16|v2>>>16;
    k1 = v1 ^ v3;
    return [k0 >>> 0, k1 >>> 0];
}

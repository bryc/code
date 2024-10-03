/*
    GoodOAAT
    ---------------
    Sokolov Yura's GoodOAAT implemented by bryc (github.com/bryc)
    An interesting 32-bit hash function which passes SMHasher3.
    Possibly slower than MurmurHash3 for Blobs, but may be a strong yet simple string hash.
    Notably however, MurmurHash3 no longer passes the latest fork - SMHasher3.

    Author states:
        "now h1 passes all collision checks, so it is suitable for hash-tables with prime numbers"

    This may indicate that h1 and h2 can be used together to produce 53-bit hashes (or 64-bit).
    Unfortunately, h1 has 41 failures in SMHasher3 (Was the author using the original SMHasher?):
    
    Summary for: GoodOAAT
    Overall result: FAIL            ( 145 / 186 passed)
    Failures:
        Sanity              : [Implementation verification]
        Avalanche           : [3, 4, 5, 6, 7, 8, 9, 10, 12, 16, 20, 64, 128]
        BIC                 : [3, 8, 11, 15]
        Sparse              : [20/3, 9/4]
        Permutation         : [4-bytes [3 low bits; BE], 4-bytes [3 high bits; LE], 4-bytes [3 high+low bits; LE], 4-bytes [3 high+low bits; BE], 4-bytes [0, low bit; BE], 4-bytes [0, high bit; LE], 8-bytes [0, low bit; BE], 8-bytes [0, high bit; LE]]
        TwoBytes            : [8]
        PerlinNoise         : [2]
        Bitflip             : [3, 4, 8]
        SeedSparse          : [2]
        Seed                : [2, 3, 6]
        SeedAvalanche       : [4]
        SeedBIC             : [3]
        SeedBitflip         : [3, 4]

    I'm no sure how severe the failures are, but at the very least, I think it is clear that h1 isn't as good as h2. 
    I would not suggest using it as a 53/64-bit hash until both halves were to pass SMHasher3.
*/

function GoodOAAT(key, seed = 0) {
    var h1 = 0x3b00 ^ seed;
    var h2 = seed << 15 | seed >>> 17;
    for(var i = 0; i < key.length; i++) {
        h1 += key[i];
        h1 = h1 + (h1 << 3) | 0;
        h2 += h1;
        h2 = h2 << 7 | h2 >>> 25;
        h2 = h2 + (h2 << 2) | 0;
    }
    h1 ^= h2; h1 += h2 << 14 | h2 >>> 18;
    h2 ^= h1; h2 += h1 >>> 6 | h1 << 26;
    h1 ^= h2; h1 += h2 << 5 | h2 >>> 27;
    h2 ^= h1; h2 += h1 >>> 8 | h1 << 24;
    return h2 >>> 0;
}

/*
    GoodOAAT
    ---------------
    Sokolov Yura's GoodOAAT implemented by bryc (github.com/bryc)
    An interesting hash function which passes SMHasher3.
    Possibly slower than MurmurHash3 for Blobs, but may be a strong yet simple string hash.
    Apparently MurmurHash3 no longer passes the latest fork of SMHasher3.

    Author states:
        "now h1 passes all collision checks, so it is suitable for hash-tables with prime numbers"

    This may indicate that h1 and h2 can be used together to produce 53-bit hashes, but more testing needed.
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

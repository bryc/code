/*
    CityHash32 / FarmHash32
    ---------------
    CityHash32 implemented by bryc (github.com/bryc)

    It happens to be the same algorithm as FarmHash32.
    Pretty much an overly-complicated MurmurHash3. Not recommended to use.
    Speed takes a hit due to the many nested functions. I will try to optimize later, but it works.

    Source:
    https://github.com/google/cityhash/blob/master/src/city.cc#L189
    https://github.com/rurban/smhasher/blob/master/City.cpp#L163
*/

function CityHash32(s, seed = 0) {
    function Rotate32(v, s) {return v>>>s|v<<32-s}
    function Fetch32(key, i) {return key[i+3]<<24|key[i+2]<<16|key[i+1]<<8|key[i]}
    function bswap_32(s){return((4278190080&s)>>>24|(16711680&s)>>>8|(65280&s)<<8|(255&s)<<24)>>>0}

    function fmix(h) {
        h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b);
        h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35);
        h ^= h >>> 16;
        return h;
    }

    function Mur(a, h) {
        a = Math.imul(a, c1); a = Rotate32(a, 17); a = Math.imul(a, c2);
        h ^= a; h = Rotate32(h, 19);
        return Math.imul(h, 5) + 0xe6546b64 | 0;
    }

    function Hash32Len0to4(s) {
        for(var i = 0, b = seed, c = 9; i < s.length; i++) {
            b = Math.imul(b, c1) + s[i] | 0; c ^= b;
        }
        return fmix(Mur(b, Mur(s.length, c))) >>> 0;
    }

    function Hash32Len5to12(s) {
        var len = s.length;
        var a = len + seed, b = Math.imul(len, 5), c = 9, d = b;
        a += Fetch32(s, 0);
        b += Fetch32(s, len - 4);
        c += Fetch32(s, (len >>> 1) & 4);
        return fmix(Mur(c, Mur(b, Mur(a, d)))) >>> 0;
    }

    function Hash32Len13to24(s) {
        var len = s.length;
        var a = Fetch32(s, (len >>> 1) - 4);
        var b = Fetch32(s, 4);
        var c = Fetch32(s, len - 8);
        var d = Fetch32(s, len >>> 1);
        var e = Fetch32(s, 0);
        var f = Fetch32(s, len - 4);
        var h = len + seed;
        return fmix(Mur(f, Mur(e, Mur(d, Mur(c, Mur(b, Mur(a, h))))))) >>> 0;
    }

    var len = s.length, c1 = 0xcc9e2d51, c2 = 0x1b873593;
    if (len <= 24) {
        return len <= 12 ? (len <= 4 ? Hash32Len0to4(s, seed) : Hash32Len5to12(s, seed)) : Hash32Len13to24(s, seed);
    }
    // len >= 25
    var h = len + seed, g = Math.imul(c1, len), f = g;

    var a0 = Math.imul(Rotate32(Math.imul(Fetch32(s, len - 4 ), c1), 17), c2);
    var a1 = Math.imul(Rotate32(Math.imul(Fetch32(s, len - 8 ), c1), 17), c2);
    var a2 = Math.imul(Rotate32(Math.imul(Fetch32(s, len - 16), c1), 17), c2);
    var a3 = Math.imul(Rotate32(Math.imul(Fetch32(s, len - 12), c1), 17), c2);
    var a4 = Math.imul(Rotate32(Math.imul(Fetch32(s, len - 20), c1), 17), c2);

    h ^= a0; h = Rotate32(h, 19); h = Math.imul(h, 5) + 0xe6546b64 | 0;
    h ^= a2; h = Rotate32(h, 19); h = Math.imul(h, 5) + 0xe6546b64 | 0;
    g ^= a1; g = Rotate32(g, 19); g = Math.imul(g, 5) + 0xe6546b64 | 0;
    g ^= a3; g = Rotate32(g, 19); g = Math.imul(g, 5) + 0xe6546b64 | 0;
    f += a4; f = Rotate32(f, 19); f = Math.imul(f, 5) + 0xe6546b64 | 0;

    var i = 0, iters = ((len - 1) / 20) | 0;

    do {
        var a0 = Math.imul(Rotate32(Math.imul(Fetch32(s, i), c1), 17), c2);
        var a1 = Fetch32(s, 4 + i);
        var a2 = Math.imul(Rotate32(Math.imul(Fetch32(s, 8 + i), c1), 17), c2);
        var a3 = Math.imul(Rotate32(Math.imul(Fetch32(s, 12 + i), c1), 17), c2);
        var a4 = Fetch32(s, 16 + i);
        h ^= a0; h = Rotate32(h, 18); h = Math.imul(h, 5) + 0xe6546b64 | 0;
        f += a1; f = Rotate32(f, 19); f = Math.imul(f, c1);
        g += a2; g = Rotate32(g, 18); g = Math.imul(g, 5) + 0xe6546b64 | 0;
        h ^= a3 + a1; h = Rotate32(h, 19); h = Math.imul(h, 5) + 0xe6546b64 | 0;
        g ^= a4; g = Math.imul(bswap_32(g), 5);
        h += Math.imul(a4, 5); h = bswap_32(h);
        f += a0;
        [f, h] = [h, f]; [f, g] = [g, f]; // Permute
        i += 20;
    } while (--iters !== 0);

    g = Math.imul(Rotate32(g, 11), c1); g = Math.imul(Rotate32(g, 17), c1);
    f = Math.imul(Rotate32(f, 11), c1); f = Math.imul(Rotate32(f, 17), c1);
    h = Rotate32(h + g, 19); h = Math.imul(h, 5) + 0xe6546b64 | 0; h = Math.imul(Rotate32(h, 17), c1);
    h = Rotate32(h + f, 19); h = Math.imul(h, 5) + 0xe6546b64 | 0; h = Math.imul(Rotate32(h, 17), c1);
    return h >>> 0;
}

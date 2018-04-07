# Hash function implementations in JavaScript

I've ported a bunch of hash functions to JS. This is a showcase of some of the better functions that play nicely in JavaScript. Performance is the main consideration here.

Also see: [CRC functions](CRC.md)


|       Algorithm      |   Bit_width |      Speed     |                                      Notes                                   |
|----------------------|---------|-----------------|---------------------------------------------------------------------------------|
| [MurmurHash1](murmurhash1.js) | 32-bit  | 999,999 ops/sec |  |
| [MurmurHash2_x86_32](murmurhash2.js) | 32-bit  |                 |  |
| [MurmurHash2_x86_32_A](murmurhash2a.js) | 32-bit  |                 | Fixes a flaw in MurmurHash2. Uses Merkle–Damgård construction. |
| [MurmurHash2_x86_64](murmurhash2_64b.js) | 64-bit  |                 | Produces two correlated 32-bit hashes. Contains a flaw - alternate version. |
| ~~MurmurHash2_x64_64~~ | 64-bit  |                 | Requires slow 64-bit arithmetic |
| [MurmurHash2_160](murmurhash2_160.js) | 160-bit |                 | Unofficial modification using five hash states |
| [MurmurHash3_x86_32](murmurhash3.js) | 32-bit  |                 |  |
| [MurmurHash3_x86_128](murmurhash3_x86_128.js) | 128-bit |                 | Contains a possible flaw - alternate version. |
| ~~MurmurHash3_x64_128~~  | 128-bit |                 | Requires slow 64-bit arithmetic |
| [xxHash_x86_32](xxhash_32.js) | 32-bit  |                 |   |
| ~~xxHash_x64_64~~ | 64-bit  |                 | Requires slow 64-bit arithmetic |
| [Lookup3_x86](lookup3.js) | 32/64-bit  |                 | 32/64-bit. 96 is possible but with worse statistics. |
| [Lookup2_x86](lookup2.js) | 32-bit  |                 | (_Obsolete_) 32-bit. 64/96 is possible but with worse statistics. |
| [FNV_x86](FNV.js) | 32-bit  |                 | FNV-0, FNV-1, FNV-1a, FNV-1a_BM |

## MurmurHash 1.0

It's pretty fast but might have some flaws (but unless you know what you're doing, you probably can't make a better one from scratch).

```js
function MurmurHash(key, seed = 0) {
    var m = 3332679571, r = 16;
    var h = seed ^ Math.imul(key.length, m);

    for(var i = 0, chunk = -4 & key.length; i < chunk; i += 4) {
        h += key[i+3] << 24 | key[i+2] << 16 | key[i+1] << 8 | key[i];
        h = Math.imul(h, m);
        h ^= h >>> r;
    }

    switch(3 & key.length) {
        case 3: h += key[i+2] << 16;
        case 2: h += key[i+1] << 8;
        case 1: h += key[i],
                h = Math.imul(h, m);
                h ^= h >>> r;
    }

    h = Math.imul(h, m);
    h ^= h >>> 10;
    h = Math.imul(h, m);
    h ^= h >>> 17;

    return h >>> 0;
}
```

### Additional variants:

_None_


## MurmurHash 2.0 (32-bit)

Also pretty fast, very close to MurmurHash1. Maybe the fastest "good" 32-bit hash function in JavaScript.

```js
function MurmurHash2(key, seed = 0) {
    var m = 1540483477, r = 24;
    var h = seed ^ key.length;

    for(var i = 0, k, chunk = -4 & key.length; i < chunk; i += 4) {
        k = key[i+3] << 24 | key[i+2] << 16 | key[i+1] << 8 | key[i];
        k = Math.imul(k, m);
        k ^= k >>> r;
        k = Math.imul(k, m);
        h = Math.imul(h, m) ^ k;
    }

    switch (3 & key.length) {
        case 3: h ^= key[i + 2] << 16;
        case 2: h ^= key[i + 1] << 8;
        case 1: h ^= key[i];
                h = Math.imul(h, m);
    }

    h ^= h >>> 13;
    h = Math.imul(h, m);
    h ^= h >>> 15;

    return h >>> 0;
}
```



### Additional variants

I implemented: [MurmurHash2_64B](murmurhash2_64b.js), [MurmurHash2_160](murmurhash2_160.js). 

1. <s>MurmurHash64B: 64-bit hash, 32-bit arithmetic</s>
2. <s>MurmurHash2_160: A [custom modification](https://simonhf.wordpress.com/2010/09/25/murmurhash160/) of MurmurHash2 with a 160-bit output.</s>
3. [MurmurHash2A](https://github.com/abrandoned/murmur2/blob/master/MurmurHash2.c#L170): Modified original using Merkle-Damgard construction (apparently fixes a flaw?)
4. MurmurHash64A: 64-bit hash, 64-bit arithmetic

## MurmurHash 3.0 (32-bit)

MurmurHash3 is supposed to improve on MurmurHash2 and has better performance. That might be the case in C++, but in JavaScript it's measurably slower than MurmurHash2. Maybe due to `rotl32`  or the increased number of instructions.

```js
function MurmurHash3(key, seed = 0) {
    function rotl32(x,r) {return (x << r) | (x >>> (32 - r));}

    var c1 = 3432918353, c2 = 461845907;
    var h = seed;

    for(var i = 0, k, chunk = -4 & key.length; i < chunk; i += 4) {
        k = key[i+3] << 24 | key[i+2] << 16 | key[i+1] << 8 | key[i];
        k = Math.imul(k, c1);
        k = rotl32(k, 15);
        k = Math.imul(k, c2);
        h ^= k;
        h = rotl32(h, 13);
        h = Math.imul(h, 5) + 3864292196;
    }

    k = 0;
    switch (3 & key.length) {
        case 3: k ^= key[i+2] << 16;
        case 2: k ^= key[i+1] << 8;
        case 1: k ^= key[i];
                k = Math.imul(k, c1);
                k = rotl32(k, 15);
                k = Math.imul(k, c2);
                h ^= k;
    }

    h ^= key.length;
    h ^= h >>> 16;
    h = Math.imul(h, 2246822507);
    h ^= h >>> 13;
    h = Math.imul(h, 3266489909);
    h ^= h >>> 16;

    return h >>> 0;
}
```

### Additional variants

I implemented: [MurmurHash3_x86_128](murmurhash3_x86_128.js). 

1. <s>MurmurHash3_x86_128: 128-bit output, 32-bit arithmetic.</s>
2. MurmurHash3_x86_32: 32-bit output, 32-bit arithmetic. _The above algorithm_.
3. MurmurHash3_x64_128: 128-bit output, 64-bit arithmetic. Different output than #2.

****

## xxHash (32-bit)
32-bit version of xxHash (aka XXH32). It's supposed to be blazing fast, but it's slower than all three MurmurHash implementations, _espeically_ on short keys. As a JS hash function, it's still very acceptable. It's faster than many others.

<!--
Check algorithm correctness using these implementations (also try legit sources):
https://asecuritysite.com/encryption/xxHash
https://hash.onlinetoolsland.com/xxhash/en/
https://github.com/Cyan4973/xxHash/wiki/xxHash-specification-(draft)#xxh32-algorithm-description
-->

```js
function xxHash(key, seed = 0) {
    function rotl32(x,r) {return (x << r) | (x >>> (32 - r));}
    function uint32(k,i) {return k[i+3] << 24 | k[i+2] << 16 | k[i+1] << 8 | k[i];}

    var p1 = 2654435761, p2 = 2246822519, p3 = 3266489917, p4 = 668265263, p5 = 374761393,
        v0 = seed + p5, v1 = seed + p1 + p2, v2 = seed + p2, v3 = seed, v4 = seed - p1, i = 0;

    if(key.length >= 16) {
        do {
            v1 += Math.imul(uint32(key, i), p2), i += 4;
            v1 = Math.imul(rotl32(v1, 13), p1);
            v2 += Math.imul(uint32(key, i), p2), i += 4;
            v2 = Math.imul(rotl32(v2, 13), p1);
            v3 += Math.imul(uint32(key, i), p2), i += 4;
            v3 = Math.imul(rotl32(v3, 13), p1);
            v4 += Math.imul(uint32(key, i), p2), i += 4;
            v4 = Math.imul(rotl32(v4, 13), p1);
        } while(i <= key.length - 16);

        v0 = rotl32(v1, 1) + rotl32(v2, 7) + rotl32(v3, 12) + rotl32(v4, 18);
    }

    v0 += key.length;
    while(i <= key.length - 4) {
        v0 += Math.imul(uint32(key, i), p3), i += 4;
        v0 = Math.imul(rotl32(v0, 17), p4);
    }

    while(i < key.length) {
        v0 += Math.imul(key[i++], p5);
        v0 = Math.imul(rotl32(v0, 11), p1);
    }

    v0 = Math.imul(v0 ^ v0 >>> 15, p2);
    v0 = Math.imul(v0 ^ v0 >>> 13, p3);

    return (v0 ^ v0 >>> 16) >>> 0;
}
```

### Additional variants

1. XXH64: 64-bit hash, 64-bit arithmetic - might be an issue to port.

## lookup3.c

Bob Jenkins long, messy [lookup3 hash](http://burtleburtle.net/bob/c/lookup3.c) from 2006. It's WEIRD. Some instances of `>>> 0`  are used only because without it, the performance seems to drop dramatically. In Chrome, it seems to be faster than **xxHash**, but in Firefox, it's half as fast as xxHash. I unrolled `mix()` and `final()` because external functions are not applicable for the port.

```js
function lookup3(k, init = 0) {
    function rot(x,r) {return ((x<<r) | (x >>> (32 - r)));}

    var len = k.length, a, b, c, o = 0;
    a = b = c = (0xdeadbeef + len + init) >>> 0;

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
        return c;
    }

    c ^= b; c -= rot(b, 14);
    a ^= c; a -= rot(c, 11);
    b ^= a; b -= rot(a, 25);
    c ^= b; c -= rot(b, 16);
    a ^= c; a -= rot(c, 4);
    b ^= a; b -= rot(a, 14);
    c ^= b; c -= rot(b, 24);

    return c >>> 0;
}
```

### Additional variants

1. hashlittle: 32-bit output, 32-bit arithmetic - _the algorithm above_.
2. hashlittle2: 64-bit output, 32-bit arithmetic - might be interesting to port.

## FNV 

TODO: Do FNV here, all variants and bit widths.

### Additional variants

1. [FNVPlus](https://github.com/tjwebb/fnv-plus) - enhanced JS version worth looking into. 

# Functions I'd like to port

1. [CRC32C](http://www.evanjones.ca/crc32c.html) - [faster](https://stackoverflow.com/questions/17645167/implementing-sse-4-2s-crc32c-in-software/17646775) CRC32? 8 bytes at a time
1. [lookup2.c](http://burtleburtle.net/bob/c/lookup2.c) - I have a JS version but it's slow, would be nice to see if it can be fixed.
2. [t1ha](https://github.com/leo-yuriev/t1ha) - supposedly super fast, and has 32-bit modes, but seems a bit weird to port.
3. SpookyHash - 128bit hash. low priority, but already have some JS code to study. Spooky32?
4. SipHash - 64bit hash, supposedly fast (doesn't seem that way). low priority. Have code to study it. There is a halfsiphash version (32-bit?) - its a MAC algorithm.
5. SlashHash - 64bit, supposedly fast. low priority, but have code.
6. [BeagleHash](https://github.com/demerphq/BeagleHash) - 64-bit but has some 32-bit stuff, might have potential.
7. Johannes Baagøe's Mash function - see what the big deal is.
8. CityHash32, part of CityHash might be worth seeing. What about FarmHash32? HighwayHash?
9. SuperFastHash - never messed with it.
10. [SeaHash](https://github.com/jroivas/seahash) - forgot about this one, got buried.

# Benchmarks

1. https://jsbench.me/fyjfja4xih/1 - MurmurHash3 benchmarks
2. https://jsbench.me/2hjfj9oscd/1 - xxHash benchmarks
3. https://jsbench.me/isjfj2rpkx/1 - comparison of available implementations
4. https://jsbench.me/tgjfegz4er/1 - the guds
5. https://jsbench.me/zrjfehfwgu/1 - the not-so-guds

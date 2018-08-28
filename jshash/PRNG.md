# Pseudorandom number generators

[PRNGs](https://gist.github.com/bryc/38a86416e8fa940e009adb15821f36d7) appear to have a lot in common with non-cryptographic hashes. They both try to achieve _random-looking output_. And in some cases employ similar concepts and borrow from each other. And some people have made both PRNGs and hash functions.

Like hashes, PRNGs often predominantly utilize 64-bit arithmetic, thus making it hard to find good JavaScript PRNGs. So this article documents my own implementations of PRNGs.

_Note that PRNGs typically need a separate algorithm to generate a random seed. This is best achieved by a hashing algorithm_.

## Alea

Alea is based on MWC (Multiply-with-Carry). It includes its own string hash function: Mash. It's speed is pretty good, but I cannot accurately measure its seed/state size (yet). 

```js
function Alea(seed) {
    if(seed === undefined) {seed = +new Date() + Math.random();}
    function Mash() {
        var n = 4022871197;
        return function(r) {
            for(var t, s, u = 0, e = 0.02519603282416938; u < r.length; u++)
            s = r.charCodeAt(u), f = (e * (n += s) - (n*e|0)),
            n = 4294967296 * ((t = f * (e*n|0)) - (t|0)) + (t|0);
            return (n|0) * 2.3283064365386963e-10;
        }
    }
    return function() {
        var m = Mash(), a = m(" "), b = m(" "), c = m(" "), x = 1, y;
        seed = seed.toString(), a -= m(seed), b -= m(seed), c -= m(seed);
        a < 0 && a++, b < 0 && b++, c < 0 && c++;
        return function() {
            var y = x * 2.3283064365386963e-10 + a * 2091639; a = b, b = c;
            return c = y - (x = y|0);
        };
    }();
}
```

## Lehmer MCG

Has a state/period of 2^31-1. Is not that ideal, but it works.

```js
function MCG(seed) {
    function mcg(seed) {return 48271 * seed % 2147483647}
     seed = mcg(seed || Math.random());
     return function() {return (seed = mcg(seed)) / 2147483646 } // 2^31-2
}
```

## Xorshift

The original vanilla xorshift introduced in 2003. Comes in 128 and 32-bit flavors.

```js
function xorshift128(s) {
    return function() {
        var z, t = s[3];
        t ^= t << 11; t ^= t >>> 8;
        s[3] = s[2]; s[2] = s[1];
        z = s[1] = s[0];
        t ^= z; t ^= z >>> 19;  
        s[0] = t;
        return (t >>> 0) / 4294967295;
    }
}

function xorshift32(s) {
    return function() {
        s ^= s << 13, s ^= s >>> 17, s ^= s << 5;
        return (s >>> 0) / 4294967295;
    }
}

// potentially better variants of xorshift32:
function xorshift32a(s) {
    return function() {
        s ^= s << 13, s ^= s >>> 17, s ^= s << 5;
        return (Math.imul(s,1597334677) >>> 0) / 4294967295;
    }
}

function xorshift32a(s) {
    return function() {
        var s2 = Math.imul(s,1597334677);
        s2 = (s2>>>24|s2>>>8&65280|s2<<8&16711680|s2<<24)>>>0;
        s ^= s << 13, s ^= s >>> 17, s ^= s << 5;
        return ((s + s2) >>> 0) / 4294967295;
    }
}

```

## Xoroshiro

The xoroshiro family included two 32-bit compatible entries, `xoroshiro64**` and `xoroshiro64*`. It has a state size of 64-bit.

```js
function xoroshiro64ss(s) {
    return function() {
        var s0 = s[0], s1 = s[1];
        var m = Math.imul(s0, 0x9E3779BB),
            r = (m<<5 | m>>>27) * 5;
        s1 ^= s0;
        s[0] = (s0<<26 | s0>>>6) ^ s1 ^ (s1 << 9);
        s[1] = s1<<13 | s1>>>19;
        return (r >>> 0) / 4294967295; // 2^32-1
    }
}


function xoroshiro64s(s) {
    return function() {
        var s0 = s[0], s1 = s[1];
        var r = Math.imul(s0, 0x9E3779BB);
        s1 ^= s0;
        s[0] = (s0<<26 | s0>>>6) ^ s1 ^ (s1 << 9);
        s[1] = s1<<13 | s1>>>19;
        return (r >>> 0) / 4294967295; // 2^32-1
    }
}
```

## Xoshiro

The latest (as of May 2018) in the Xorshift-derivative series, xoshiro family now offers 128-bit state generators in 32-bit just like the original xorshift. Comes in two variants: `xoshiro128**` and `xoshiro128+`

```js
function xoshiro128ss(s) {
    return function() {
        var m = s[0] * 5, r = (m<<7 | m>>>25) * 9,
            t = s[1] << 9;
        s[2] ^= s[0], s[3] ^= s[1],
        s[1] ^= s[2], s[0] ^= s[3],
        s[2] ^= t, s[3] = s[3]<<11 | s[3]>>>21;
        return (r >>> 0) / 4294967295; // 2^32-1
    }
}

function xoshiro128p(s) {
    return function() {
        var r = s[0] + s[3], t = s[1] << 9;
        s[2] ^= s[0], s[3] ^= s[1],
        s[1] ^= s[2], s[0] ^= s[3],
        s[2] ^= t, s[3] = s[3]<<11 | s[3]>>>21;
        return (r >>> 0) / 4294967296; // 2^32-1
    }
}
```

## JSF

Bob Jenkin's PRNG from 2007. Unfortunately only has a 32-bit seed despite having a 128-bit state. But perhaps the entire state can be seeded using a different algorithm. Seems pretty decent. Bob Jenkins also made some nice hash functions.

```js
function JSF(seed) {
    function jsf() {
        var e = s[0] - (s[1]<<27 | s[1]>>5);
         s[0] = s[1] ^ (s[2]<<17 | s[2]>>15),
         s[1] = s[2] + s[3],
         s[2] = s[3] + e, s[3] = s[0] + e;
        return (s[3] >>> 0) / 4294967295; // 2^32-1
    }
    seed >>>= 0;
    var s = [0xf1ea5eed, seed, seed, seed];
    for(var i=0;i<20;i++) jsf();
    return jsf;
}
```


## SplitMix32 and Mulberry32

These are PRNGs that only use a 32-bit state, similar to xorshift32. Quite useful for embedded systems. And potentially better than the Lehmer MCG. But due to the small state size, they take a big quality hit. C code only for now.


```c
uint32_t state;

int32_t mulberry32(void) {
    uint32_t z = state += 0x6D2B79F5;
    z = (z ^ z >> 15) * (1 | z);
    z ^= z + (z ^ z >> 7) * (61 | z);
    return z ^ z >> 14;
}

uint32_t splitmix32(void) {
    uint32_t z = state += 0x9e3779b9;
    z ^= z >> 15; // 16 for murmur3
    z *= 0x85ebca6b;
    z ^= z >> 13;
    z *= 0xc2b2ae3d; // 0xc2b2ae35 for murmur3
    return z ^= z >> 16;
}
```


****

# Seed generating functions

Here are various functions that can be used to efficiently generate seeds for PRNGs. I'll include integer and string hashing functions as well here.

`initseed` is an experimental 128-bit seed generator. It takes an array of 4 32-bit numbers and mixes them using the mixing function from Murmur3/xxHash.

```js
function initseed(s) {
    function mix(h) {
        h ^= h>>>15; h = Math.imul(h,2246822507);
        h ^= h>>>13; h = Math.imul(h,3266489917); h ^= h>>>16;
        return h;
    }
    var e = s[0] + s[1] + s[2] + s[3];
    s[0] += e ^ 597399067; s[1] ^= e ^ 668265263; s[2] += e ^ 951274213; s[3] ^= e ^ 374761393;
    s[0] = mix(s[0]) + s[1]; s[1] = mix(s[1]);
    s[2] = mix(s[2]) + s[3]; s[3] = mix(s[3]);
    e = s[0] + s[1] + s[2] + s[3];
    s[0] += e; s[1] ^= e; s[2] += e; s[3] ^= e;
    return s;
}
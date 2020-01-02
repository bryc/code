*License: Public domain. Software licenses are annoying. If your code is sacred, don't publish it. If you want to mess with people, golf your code or only release binaries. If your country lacks a public domain, you should probably start a revolution.*

# Pseudorandom number generators

PRNGs appear to have a lot in common with non-cryptographic hashes. They both try to achieve _random-looking output_, and in some cases employ similar concepts and borrow from each other. Some people who designed hash functions also made PRNGs.

Like hashes, PRNGs often predominantly utilize 64-bit arithmetic, making it hard to find good JavaScript random number generators. So this article documents my own implementations of PRNGs. All of the PRNGs here are optimized for speed and are quite short (only a few lines each). The quality of most of them should also be quite acceptable, despite being limited to 32-bit operations.

_Note that PRNGs typically need a separate algorithm to generate a seed with sufficient entropy. This is best achieved by a hashing algorithm._

## Table of PRNGs

Out of the table, the best JS PRNGS seem to be: `sfc32`, and `mulberry32` for speed and statistic quality. Runners-up `jsf32b` and `gjrand32` should also be good but seems to lag behind in performance. `xoshiro128**` is fast and "decent" but has poor randomness in the low bits. It fails linear-complexity and binary-rank tests (`sfc32`, `jsf32`, `gjrand32` passes these). All the xorshift variants suffer from this issue, so be aware of the the low bits when using this generator.

Alea is not in the table yet, since the current version seems super slow in comparison to these new fast 32-bit PRNGs. I plan to add some other PRNGs from [here](https://github.com/nquinlan/better-random-numbers-for-javascript-mirror) and seedrandom.

| Algorithm | State size | Speed | Notes |
| --------- | ---------- | ----- | ----- |
| xoroshiro64+ | 64-bit | 8,077,296 | lfsr issues. |
| xoroshiro64* | 64-bit | 8,058,755 | lfsr issues. |
| xoroshiro64** | 64-bit | 8,037,441 | preferred version. lfsr issues, but fast. |
| xoshiro128+ | 128-bit | 6,968,875 | lfsr issues. |
| xoshiro128** | 128-bit | 6,930,900 | preferred version. has lfsr issues, but better than xorshift. |
| sfc32 | 128-bit | 7,451,860 | pretty fast. chaotic. best 2^128 state JS PRNG. passes practrand. |
| gjrand32 | 128-bit | 5,948,657 | chaotic.  |
| jsf32 | 128-bit | 6,183,320 | chaotic. |
| jsf32b | 128-bit | 6,161,758 | jsf32 with another rotate. better randomness, same speed in JS. |
| tyche | 128-bit | 2,892,738 | sloww |
| tychei | 128-bit | 4,592,413 | still kinda slow. but tyche/i passes BigCrush. |
| xorshift128 | 128-bit | 6,101,622 |  |
| xorshift32 | 32-bit | 5,902,315 | no idea why it's slow. |
| xorshift32a | 32-bit | 5,895,329 |  |
| xorshift32b | 32-bit | 5,858,901 |  |
| lcg | 31-bit | 10,613,765 | park-miller lcg. fast but only 31 bits and fails tests. |
| mulberry32 | 32-bit | 10,440,286 | FAST. best 2^32 state JS PRNG. passes gjrand. |
| splitmix32 | 32-bit | 10,477,915 | based on xxhash/murmurhash3, untested. |

## Alea

Alea is based on MWC (Multiply-with-Carry). It includes its own string hash function: Mash. <!--It's speed is pretty good, but I cannot accurately measure its seed/state size (yet). --> 

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

## LCG (Lehmer RNG)

Commonly called a *Linear congruential generator (LCG)*, but in this case, more correctly called a *Multiplicative congruential generator (MCG)* or *Lehmer RNG*. It has a state and period of 2^31-1. It's blazingly fast in JavaScript (likely the fastest), but its quality is quite poor.

```js
function LCG(a) {
    return function() {
      a = Math.imul(48271, a) | 0 % 2147483647;
      return (a & 2147483647) / 2147483648;
    }
}

// Here are some optimized ES6 one-liners:
var LCG=s=>()=>(2**31-1&(s=Math.imul(48271,s)))/2**31; // Same as above
var LCG=s=>()=>((s=Math.imul(741103597,s))>>>0)/2**32; // 32-bit version, likely far better
var LCG=s=>()=>((s=Math.imul(1597334677,s))>>>0)/2**32; // Another 32-bit version
```

The Lehmer RNG is the *minimal standard* RNG as proposed by Park–Miller in 1988 & 1993 and implemented in C++11 as `minstd_rand`. Keep in mind that the state and period are only 31-bit (31 bits give 2 billion possible states, 32 bits give double that).

I cannot recommend using this, as it seems to have a bit of quality problems. Always **discard** the first result of an LCG, and be aware that some chosen seeds can exhibit unwanted patterns in output.

Mathematically, LCGs have different parameters such as _a_, _m_ and _c_, which is often up to the implementor. The MCG or Lehmer RNG described here is a special case when _c_ is always zero, most likely for simplification purposes. Other popular multipliers in sequence: 16807, 48271, 69621, and 39373.

**References:**
- [LCG on Wikipedia](https://en.wikipedia.org/wiki/Linear_congruential_generator)
- [Random Number Generators: Good Ones Are Hard To Find (1988)](http://www.firstpr.com.au/dsp/rand31/p1192-park.pdf) - Park–Miller's original paper, suggesting a multipler as 16807.
- [Another Test For Randomness (1993)](http://www.firstpr.com.au/dsp/rand31/p105-crawford.pdf#page=4) - In response to criticism, suggesting 48271 over 16807.
- [A table of Linear Congruential Generators of different sizes and good lattice structure (1997)](https://pdfs.semanticscholar.org/8284/542deb19d556c8818e0456cce771a50ed0ff.pdf) - By P. L'Ecuyer, source of 32-bit constants.


## Multiply-with-carry

This is Marsaglia's MWC generator (KISS99 version). There are multiple variations that use different constants, but this is likely the definitive one. It actually dates back to 1994 but its origins are hard to trace. I don't recommend using it, it's quite old and it has some significant quality issues.

```js
function mwc(a, b) {
    return function() {
        a = 36969 * (a & 65535) + (a >>> 16);
        b = 18000 * (b & 65535) + (b >>> 16);
        var result = (a << 16) + (b & 65535) >>> 0;
        return result / 4294967296;
    }
}
```

It uses two 16-bit integers as input (hence the MWC1616 name). So technically a 32-bit state.
A variant of this was used in Google Chrome until 2015 when it was replaced with "Xorshift128+" due to quality concerns.

**References:**
- [The Mother of All Random Number Generators (1993?)](https://web.archive.org/web/20200102030515/http://home.sandiego.edu/~pruski/MotherExplanation.txt) - Originally used multiplier 30903 and 18000.
- [Marsaglia's original usenset post (1999)](http://www.ciphersbyritter.com/NEWS4/RANDC.HTM#369B5E30.65A55FD1@stat.fsu.edu) - Also contains some other sub-generators
- [KISS: A Bit Too Simple (2011)]() - Some criticism on the KISS99 generators
- [There’s Math.random(), and then there’s Math.random()](https://v8.dev/blog/math-random) - Chrome originally used MWC with 30903 and 18030
- [TIFU By Using Math.random()](https://medium.com/@betable/tifu-by-using-math-random-f1c308c4fd9d) - Other criticisms leading to MWC being replaced.

## Xorshift

Marsaglia's original Xorshift generator from 2003. Comes in 128 and 32-bit versions. They are better than LCG or MWC, but still very flawed.

```js
function xorshift128(a, b, c, d) {
    return function() {
        a |= 0; b |= 0; c |= 0;
        var t = d ^ d << 11; t = t ^ t >>> 8;
        t = t ^ a; t = t ^ a >>> 19; 
        d = c; c = b; b = a; a = t;
        return (t >>> 0) / 4294967296;
    }
}

function xorshift32(a) {
    return function() {
        a ^= a << 25; a ^= a >>> 7; a ^= a << 2;
        return (a >>> 0) / 4294967296;
    }
}

// potentially better variants of xorshift32:
function xorshift32a(a) {
    return function() {
        a ^= a << 25; a ^= a >>> 7; a ^= a << 2;
        return (Math.imul(a, 1597334677) >>> 0) / 4294967296;
    }
}

function xorshift32b(a) {
    return function() {
        var t = Math.imul(a, 1597334677);
        t = t>>>24 | t>>>8&65280 | t<<8&16711680 | t<<24;
        a ^= a << 25; a ^= a >>> 7; a ^= a << 2;
        return (a + t >>> 0) / 4294967296;
    }
}

```

**References:**
- [Xorshift RNGs (2003)](https://www.jstatsoft.org/article/view/v008i14) - 	George Marsaglia's paper on Xorshift generators
- [On the Xorshift Random Number Generators (2005)](http://www-perso.iro.umontreal.ca/~lecuyer/myftp/papers/xorshift.pdf) - An analysis of Xorshift, highlighting strengths and weaknesses

## Xoroshiro

The xoroshiro family included two 32-bit compatible entries, `xoroshiro64**` and `xoroshiro64*`. It has a state size of 64-bit. I've included an unoffical implementation of `xoroshiro64+`. 

```js
function xoroshiro64ss(a, b) {
    return function() {
        var r = Math.imul(a, 0x9E3779BB); r = (r << 5 | r >>> 27) * 5;
        b = b ^ a; a = b ^ (a << 26 | a >>> 6) ^ b << 9;
        b = b << 13 | b >>> 19;
        return (r >>> 0) / 4294967296;
    }
}

function xoroshiro64s(a, b) {
    return function() {
        var r = Math.imul(a, 0x9E3779BB);
        b = b ^ a; a = b ^ (a << 26 | a >>> 6) ^ b << 9;
        b = b << 13 | b >>> 19;
        return (r >>> 0) / 4294967296;
    }
}

// unofficial xoroshiro64+ (bryc)
function xoroshiro64p(a, b) {
    return function() {
        var r = a + b;
        b = b ^ a; a = b ^ (a << 26 | a >>> 6) ^ b << 9;
        b = b << 13 | b >>> 19;
        return (r >>> 0) / 4294967296;
    }
}
```

## Xoshiro

The latest (as of May 2018) in the Xorshift-derivative series, xoshiro family now offers 128-bit state generators in 32-bit just like the original xorshift. Comes in two variants: `xoshiro128**` and `xoshiro128+`

```js
function xoshiro128ss(a, b, c, d) {
    return function() {
        var t = b << 9, r = a * 5; r = (r << 7 | r >>> 25) * 9;
        c = c ^ a; d = d ^ b; b = b ^ c; a = a ^ d; c = c ^ t;
        d = d << 11 | d >>> 21;
        return (r >>> 0) / 4294967296;
    }
}

function xoshiro128p(a, b, c, d) {
    return function() {
        var t = b << 9, r = a + d;
        c = c ^ a; d = d ^ b; b = b ^ c; a = a ^ d; c = c ^ t;
        d = d << 11 | d >>> 21;
        return (r >>> 0) / 4294967296;
    }
}
```

## JSF / smallprng

Bob Jenkin's PRNG from 2007. Unfortunately only has a 32-bit seed despite having a 128-bit state. But perhaps the entire state can be seeded using a different algorithm. Seems pretty decent. Bob Jenkins also made some nice hash functions. It is described as a "chaotic PRNG".

```js
function jsf32(a, b, c, d) {
    return function() {
        a |= 0; b |= 0; c |= 0; d |= 0;
        var t = a - (b << 27 | b >>> 5) | 0;
        a = b ^ (c << 17 | c >>> 15);
        b = c + d | 0;
        c = d + t | 0;
        d = a + t | 0;
        return (d >>> 0) / 4294967296;
    }
}

// 3-rotate version, improves randomness.
function jsf32b(a, b, c, d) {
    return function() {
        a |= 0; b |= 0; c |= 0; d |= 0;
        var t = a - (b << 23 | b >>> 9) | 0;
        a = b ^ (c << 16 | c >>> 16) | 0;
        b = c + (d << 11 | d >>> 21) | 0;
        b = c + d | 0;
        c = d + t | 0;
        d = a + t | 0;
        return (d >>> 0) / 4294967296;
    }
}

// https://gist.github.com/imneme/85cff47d4bad8de6bdeb671f9c76c814
```

## gjrand32

Another "chaotic PRNG" designed by David Blackman. It is from the GJrand suite of random number tests. The original version is 64-bit and well-tested, this one hasn't been extensively tested but seems to be good.

```js
function gjrand32(a, b, c, d) {
    return function() {
      a |= 0; b |= 0; c |= 0; d |= 0;
      a = a << 16 | a >>> 16;
      b = b + c | 0;
      a = a + b | 0;
      c = c ^ b;
      c = c << 11 | c >>> 21;
      b = b ^ a;
      a = a + c | 0;
      b = c << 19 | c >>> 13;
      c = c + a | 0;
      d = d + 0x96a5 | 0;
      b = b + d | 0;
      return (a >>> 0) / 4294967296;
    }
}
```

## sfc32

Yet another chaotic PRNG, the sfc stands for "Small Fast Counter". It passes PractRand, as well as Crush/BigCrush (TestU01). Also one of the fastest.

```js
function sfc32(a, b, c, d) {
    return function() {
      a |= 0; b |= 0; c |= 0; d |= 0; 
      var t = (a + b | 0) + d | 0;
      d = d + 1 | 0;
      a = b ^ b >>> 9;
      b = c + (c << 3) | 0;
      c = c << 21 | c >>> 11;
      c = c + t | 0;
      return (t >>> 0) / 4294967296;
    }
}
```

## tyche

Tyche is based on ChaCha's quarter-round. It's a bit slow but should be good quality. `tychei`, the inverted version, is 20% faster.

```js
function tychei(a, b, c, d) {
    return function() {
        a |= 0; b |= 0; c |= 0; d |= 0;
        b = (b << 25 | b >>> 7)  ^ c; c = c - d | 0;
        d = (d << 24 | d >>> 8)  ^ a; a = a - b | 0;
        b = (b << 20 | b >>> 12) ^ c; c = c - d | 0;
        d = (d << 16 | d >>> 16) ^ a; a = a - b | 0;
        return (a >>> 0) / 4294967296;
    }
}

function tyche(a, b, c, d) {
    return function() {
        a |= 0; b |= 0; c |= 0; d |= 0;
        a = a + b | 0; d = d ^ a; d = d << 16 | d >>> 16;
        c = c + d | 0; b = b ^ c; b = b << 12 | b >>> 20;
        a = a + b | 0; d = d ^ a; d = d << 8  | d >>> 24;
        c = c + d | 0; b = b ^ c; b = b << 7  | b >>> 25;
        return (b >>> 0) / 4294967296;
    }
}
```

## Mulberry32

Mulberry32 is minimalistic generator utilizing a 32-bit state, originally intended for embedded applications. It appears to be very good; the author states it passes all tests of gjrand, and this JavaScript implementation is very fast. But since the state is 32-bit like Xorshift, it's period (how long the random sequence lasts before repeating) is significantly less than those with 128-bit states, but it's still quite large, at around 4 billion.

```js
function mulberry32(a) {
    return function() {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}
```

**References:**
- [Original C implementation (2017)](https://gist.github.com/tommyettinger/46a874533244883189143505d203312c)

## SplitMix32

SplitMix32 is a transformation of the `fmix32` finalizer from MurmurHash3 into a PRNG. It has a 32-bit internal state, like Xorshift and Mulberry32. 

```js
function splitmix32(a) {
    return function() {
      a |= 0; a = a + 0x9e3779b9 | 0;
      var t = a ^ a >>> 15; t = Math.imul(t, 0x85ebca6b);
      t = t ^ t >>> 13; t = Math.imul(t, 0xc2b2ae35);
      return ((t = t ^ t >>> 16) >>> 0) / 4294967296;
    }
}
```

This is based on an algorithm known as `SplitMix` included in Java JDK8. It uses 64-bit arithmetic and doesn't define a 32-bit version. However, It is derived from the `fmix64` finalizer used in MurmurHash3 and appears to be an application of Weyl sequences. MurmurHash3 also contains a 32-bit equivalent of this function, `fmix32`. The constant `0x9e3779b` is the 32-bit truncation of the golden ratio, which is also what is used in the original.

**References:**
- [Fast Splittable Pseudorandom Number Generators (2014)](http://gee.cs.oswego.edu/dl/papers/oopsla14.pdf)
- [C implementation of splitmix32.c by Kaito Udagawa (2016)](https://github.com/umireon/my-random-stuff/blob/e7b17f992955f4dbb02d4016682113b48b2f6ec1/xorshift/splitmix32.c)
- [A more generic description of 32-bit SplitMix (2017)](http://marc-b-reynolds.github.io/shf/2017/09/27/LPRNS.html)
- [Exploring variants of the same function for integer hashing (2018)](https://nullprogram.com/blog/2018/07/31/)

## v3b

Very odd "chaotic" PRNG using a counter with variable output. It's supposed to be fast, but in Google Chrome specifically, it's quite slow. In Firefox it's fine, oddly enough. [C code here](https://pastebin.com/JBAUPKjw).

```js
function v3b(a, b, c, d) {
  var out, pos = 0, a0 = 0, b0 = b, c0 = c, d0 = d;
  return function() {
      if(pos === 0) {
          a += d; a = a << 21 | a >>> 11;
          b = (b << 12 | b >>> 20) + c;
          c ^= a; d ^= b;
          a += d; a = a << 19 | a >>> 13;
          b = (b << 24 | b >>> 8) + c;
          c ^= a; d ^= b;
          a += d; a = a << 7 | a >>> 25;
          b = (b << 12 | b >>> 20) + c;
          c ^= a; d ^= b;
          a += d; a = a << 27 | a >>> 5;
          b = (b << 17 | b >>> 15) + c;
          c ^= a; d ^= b;
        
          a += a0; b += b0; c += c0; d += d0; a0++; pos = 4;
      }
      switch(--pos) {
        case 0: out = a; break;
        case 1: out = b; break;
        case 2: out = c; break;
        case 3: out = d; break;
      }
      return out >>> 0;
  }
}

// default seeding procedure (32-bit seed):

var seed = 0; // uint32_t
v = [seed, 2654435769, 1013904242, 3668340011]; // golden ratios
var next = v3b(v[0], v[1], v[2], v[3]);
for(var i = 0; i < 16; i++) next();
```

****

# Addendum A: Seed generating functions

Certain generators originally had their own seeding procedure, such as jsf32, sfc32 and gjrand32. Those three in particular run the next() function 10-20 times in advance, assumingly to aid in the initialization process. I believe this process can be skipped by using a suitable hash function such as MurmurHash3 to generate the full initial state of the generator.

Here are various utility functions that can be used to generate seeds properly for PRNGs. <!-- I'll include integer and string hashing functions as well here. -->

`xfnv1a` is a good example of generating seed bits from a string. It is based on Bret Mulvey's modified FNV1a.

```js
function xfnv1a(str) {
    for(var i = 0, h = 2166136261 >>> 0; i < str.length; i++)
        h = Math.imul(h ^ str.charCodeAt(i), 16777619);
    return function() {
        h += h << 13; h ^= h >>> 7;
        h += h << 3;  h ^= h >>> 17;
        return (h += h << 5) >>> 0;
    }
}
```

How it would be used:

```js
// Create a xfnv1a state:
var seed = xfnv1a("apples");
// Output four 32-bit hashes to produce the seed for sfc32.
var rand = sfc32(seed(), seed(), seed(), seed());

// Or: output one 32-bit hash to produce the seed for mulberry32.
var rand = mulberry32(seed());

// Obtain sequential random numbers like so:
rand();
rand();
```

A possible issue with this function could be whether the xor and shift operations are sufficient to mix the state for each subsequent hash. A potential alternative, using MurmurHash sensibilities, dubbed 'xmur1a':

```js
function xmur1a(str) {
    for(var i = 0, h = Math.imul(str.length, 2166136261) >>> 0; i < str.length; i++)
        h = Math.imul(h + str.charCodeAt(i), 3432918353), h ^= h >>> 24;
    return function() {
        h ^= h >>> 15; h = Math.imul(h, 2246822507);
        h ^= h >>> 13; h = Math.imul(h, 3266489917);
        return (h ^= h >>> 16) >>> 0;
    }
}
```

This utilizes the famed fmix function seen in MurmurHash3, xxHash and SplitMix, as well as a slight MurmurHash1-style modification to FNV1a's combining step. This means switching xor to add, changing the multiplier, and adding a xorshift step.

On paper, this may be an ideal and efficient function for generating good _hash seeds_. But I haven't tested it. As a final option, a full MurmurHash3 implementation:

```js
function xmur3a(str) {
    for(var k, i = 0, h = 2166136261 >>> 0; i < str.length; i++) {
        k = Math.imul(str.charCodeAt(i), 3432918353); k = k << 15 | k >>> 17;
        h ^= Math.imul(k, 461845907); h = h << 13 | h >>> 19;
        h = Math.imul(h, 5) + 3864292196 | 0;
    }
    h ^= str.length;
    return function() {
        h ^= h >>> 16; h = Math.imul(h, 2246822507);
        h ^= h >>> 13; h = Math.imul(h, 3266489909);
        h ^= h >>> 16;
        return h >>> 0;
    }
}
```

An earlier attempt at improving xfnv1a(), that is a bit more verbose as well:

```js
function initseed(k) {
    for(var i = 0, h = 0xdeadbeef | 0; i < k.length; i++)
        h = Math.imul(h + k.charCodeAt(i), 2654435761), h ^= h >>> 24,
        h = Math.imul(h<<11 | h>>>21, 2246822519);
    return function() {
        h += h << 13; h ^= h >>> 7; h += h << 3;  h ^= h >>> 17;
        h = h ^ h >>> 15; h = Math.imul(h, 2246822507);
        h = h ^ h >>> 13; h = Math.imul(h, 3266489917);
        return ((h = Math.imul(h ^ h >>> 16, 1597334677)) >>> 0);
    }
}
```

`initseed` is an older 128-bit seed generator I tried making. It takes an array of 4 32-bit numbers and mixes them using the mixing function from Murmur3/xxHash. Probably not worth using.

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
```

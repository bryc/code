*License: Public domain. Software licenses are annoying. If your code is sacred, don't publish it. If you want to mess with people, golf your code or only release binaries. If your country lacks a public domain, you should probably start a revolution.*

# Pseudorandom number generators

This is a repository of optimized PRNG implementations, in the same spirit of my [hash function implementations](hashes/README.md).

PRNGs appear to have a lot in common with non-cryptographic hashes. They both try to achieve _random-looking output_, and in some cases employ similar concepts and borrow from each other. Some people who designed hash functions also made PRNGs.

Like hashes, PRNGs often predominantly utilize 64-bit arithmetic, making it hard to find good, seedable JavaScript random number generators. So this article documents my own implementations of PRNGs. All of the PRNGs here are optimized for speed and are quite short (only a few lines each). The quality of most of them should also be quite acceptable, despite being limited to 32-bit operations. However, this is an inclusive list, and some weaker PRNGs are compared here as well.

_Note that for best results, PRNGs typically need a seed with sufficient entropy. See [Addendum A: Seed generating functions](#addendum-a-seed-generating-functions)._

## Table of PRNGs

Out of the table, the best JS PRNGS seem to be: `sfc32`, and `mulberry32` for speed and statistical quality. Runners-up `jsf32b` and `gjrand32` should also be good but seems to lag behind in performance. `xoshiro128**` is fast and totally acceptable, but has poor randomness in the lower bits. It fails linear-complexity and binary-rank tests (`sfc32`, `jsf32`, and `gjrand32` pass these). All the Xorshift variants seem to suffer from this issue, so be aware of the the low bits when using this generator.

<!--Alea is not in the table yet, since the current version seems super slow in comparison to these new fast 32-bit PRNGs. I plan to add some other PRNGs from [here](https://github.com/nquinlan/better-random-numbers-for-javascript-mirror), seedrandom or any other source I can find.-->

| Algorithm | State size | Speed | Notes |
| --------- | ---------- | ----- | ----- |
| xoroshiro64+ | 64-bit | 8,077,296 | |
| xoroshiro64** | 64-bit | 8,037,441 | |
| xoroshiro64* | 64-bit | 8,058,755 | |
| xoshiro128+ | 128-bit | 6,968,875 | |
| xoshiro128** | 128-bit | 6,930,900 | preferred version. has lfsr issues, but better than xorshift. |
| sfc32 | 128-bit | 7,451,860 | pretty fast. best 2^128 state JS PRNG. passes practrand. |
| gjrand32 | 128-bit | 5,948,657 | not well tested, but possibly good. |
| jsf32 | 128-bit | 6,183,320 | well-tested, pretty good. |
| jsf32b | 128-bit | 6,161,758 | jsf32 with another rotate. better randomness, same speed in JS. |
| tyche | 128-bit | 2,892,738 | slow. |
| tychei | 128-bit | 4,592,413 | still kinda slow. but tyche/i passes BigCrush. |
| xorshift128 | 128-bit | 6,101,622 |  |
| xorshift32 | 32-bit | 5,902,315 | need to retest. |
| xorshift32a | 32-bit | 5,895,329 |  |
| xorshift32b | 32-bit | 5,858,901 |  |
| lcg | 31-bit | 10,613,765 | fails tests rapidly. |
| mulberry32 | 32-bit | 10,440,286 | very fast and passes gjrand. best 2^32 state JS PRNG. |
| splitmix32 | 32-bit | 10,477,915 | based on murmurhash3. |

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

**Full disclosure: By necessity, this LCG implementation differs from the C++ original, `minstd_rand`. The below text was written under the assumption that were equivalent, which was wrong. While `ministd_rand` already has a reputation as being poor, the `Math.imul` version here may in fact be weaker. This is because the original stored the result of `x * 48271` in a 64-bit `long` type, while here, I'm effectively using a 32-bit `int` type.**

**Technically JS is capable of doing the correct calculation natively, because the result will never exceed JS's 53-bit limitation, but it is 55-65% slower and still inferior in  quality to other, more faster generators in this list:**

```js
function LCG(a) {
    return function() {
      return a = a * 48271 % 2147483647;
    }
}
```

**Original text below:**

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

The Lehmer RNG is the *minimal standard* RNG as proposed by Park–Miller in 1988 & 1993 and implemented in C++11 as `minstd_rand`. Keep in mind that the state and period are only 31-bit (31 bits give 2 billion possible states, 32 bits give double that). Mathematically, LCGs have different parameters such as _a_, _m_ and _c_, which is often up to the implementor. The MCG or Lehmer RNG described here is a special case when _c_ is always zero. Other popular multipliers in sequence: 16807, 48271, 69621, and 39373.

I don't recommend using LCG/MCG, as they seems to have quality problems. If you must use it, always **discard** the first few results, ensure the **seed is odd**, and use a larger multiplier.

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

Marsaglia's original Xorshift generator from 2003. Comes in 32-bit and 128-bit states. It's better than LCG or MWC, but fails many modern tests.

```js
function xorshift32(a) {
    return function() {
        a ^= a << 13; a ^= a >>> 17; a ^= a << 5;
        return (a >>> 0) / 4294967296;
    }
}

function xorshift128(a, b, c, d) {
    return function() {
        var t = a ^ a << 11;
        a = b, b = c, c = d;
        d = (d ^ d >>> 19) ^ (t ^ t >>> 8);
        return (d >>> 0) / 4294967296;
    }
}

function xorwow(a, b, c, d, e, f) {
    return function() {
        var t = a ^ a >>> 2;
        a = b, b = c, c = d, d = e;
        e = (e ^ e << 4) ^ (t ^ t << 1);
        f = (f + 362437) >>> 0;
        return ((e+f) >>> 0) / 4294967296;
    }
}

// Improved variants, based on ideas from Marc-B-Reynolds and Sebastiano Vigna
// https://gist.github.com/Marc-B-Reynolds/0b5f1db5ad7a3e453596
// https://gist.github.com/Marc-B-Reynolds/82bcd9bd016246787c95

// 32-bit version of "xorshift64star" using a 32-bit LCG multiplier
function xorshift32m(a) {
    return function() {
        a ^= a << 13; a ^= a >>> 17; a ^= a << 5;
        return (Math.imul(a, 1597334677) >>> 0) / 4294967296;
    }
}

// This version should pass SmallCrush, implements __builtin_bswap32
function xorshift32amx(a) {
    return function() {
        var t = Math.imul(a, 1597334677);
        t = t>>>24 | t>>>8&65280 | t<<8&16711680 | t<<24; // reverse byte order
        a ^= a << 13; a ^= a >>> 17; a ^= a << 5;
        return (a + t >>> 0) / 4294967296;
    }
}
```

**References:**
- [Xorshift RNGs (2003)](https://www.jstatsoft.org/article/view/v008i14) - 	George Marsaglia's paper on Xorshift generators
- [On the Xorshift Random Number Generators (2005)](http://www-perso.iro.umontreal.ca/~lecuyer/myftp/papers/xorshift.pdf) - An analysis of Xorshift, highlighting strengths and weaknesses
- [Exploration of Marsaglia’s xorshift generators, scrambled (2014)](http://vigna.di.unimi.it/ftp/papers/xorshift.pdf)
- [Further scramblings of Marsaglia’s xorshift generators (2014)](http://vigna.di.unimi.it/ftp/papers/xorshiftplus.pdf)

## Xoroshiro
The Xoroshiro family includes two 32-bit compatible entries, `xoroshiro64**` and `xoroshiro64*`. They have a 64-bit state size, and is named after its operations (Xor, Rotate, Shift, Rotate). I've included an unoffical implementation of `xoroshiro64+`, and some experimental 32-bit equivalents of `xoroshiro128+` and `xorshift128+`, although I would advise caution with those. For 32-bit applications, Xoshiro has better options available.

`xoroshiro128+` was originally published in April 2016 in source code form, but was not formally described until the [May 2018 paper](http://vigna.di.unimi.it/ftp/papers/ScrambledLinear.pdf) which introduced Xoshiro. As a result, they changed the parameters of the original to ones with better statistical results, which is the version used in the 32-bit implementation here.

```js
function xoroshiro64ss(a, b) {
    return function() {
        var r = Math.imul(a, 0x9E3779BB); r = (r << 5 | r >>> 27) * 5;
        b = b ^ a; a = b ^ (a << 26 | a >>> 6) ^ b << 9;
        b = b << 13 | b >>> 19;
        return (r >>> 0) / 4294967296;
    }
}

// only good for floating point values, linearity issues on lower bits.
function xoroshiro64s(a, b) {
    return function() {
        var r = Math.imul(a, 0x9E3779BB);
        b = b ^ a; a = b ^ (a << 26 | a >>> 6) ^ b << 9;
        b = b << 13 | b >>> 19;
        return (r >>> 0) / 4294967296;
    }
}

// unofficial xoroshiro64+ (experimental)
function xoroshiro64p(a, b) {
    return function() {
        var r = a + b;
        b = b ^ a; a = b ^ (a << 26 | a >>> 6) ^ b << 9;
        b = b << 13 | b >>> 19;
        return (r >>> 0) / 4294967296;
    }
}

// 32-bit xoroshiro128+ (experimental)
// Source: https://github.com/umireon/my-random-stuff/blob/master/xorshift/xoroshiro128plus_32_test.c
function xoroshiro128plus_32(a, b, c, d) {
    return function() {
      var x = a >>> 0,
          y = b >>> 0,
          z = c >>> 0,
          w = d >>> 0, t;

      t = w + y + (z !== 0 && x >= (-z>>>0) ? 1 : 0);
      z ^= x;
      w ^= y;

      a = (y << 23 | x >>> 9) ^ z ^ (z << 14);
      b = (x << 23 | y >>> 9) ^ w ^ (w << 14 | z >>> 18);
      c = w << 4 | z >>> 28;
      d = z << 4 | w >>> 28;

      return t >>> 0;
    }
}

// 32-bit xorshift128+ (experimental, later improved to xoroshiro)
// Source: https://github.com/umireon/my-random-stuff/blob/master/xorshift/xorshift128plus_32_test.c
// This is functionally equivalent to the generator currently used in Google Chrome since 2015.
function xorshift128plus_32b(a, b, c, d) {
    return function() {
      var x = a >>> 0,
          y = b >>> 0,
          z = c >>> 0,
          w = d >>> 0, t;

      t = w + y + (x !== 0 && z >= (-x>>>0) ? 1 : 0);
      y ^= y << 23 | x >>> 9;
      x ^= x << 23;

      a = z;
      b = w;
      c = x ^ z ^ (x >>> 18 | y << 14) ^ (z >>> 5 | w << 27);
      d = y ^ w ^ (y >>> 18) ^ (w >>> 5);

      return t >>> 0;
    }
}
```

**References:**
- [Xoroshiro128+ website (2016-2018)](https://web.archive.org/web/20180201134533/http://xoroshiro.di.unimi.it/)
- [Scrambled Linear Pseudorandom Number Generators (2018)](http://vigna.di.unimi.it/ftp/papers/ScrambledLinear.pdf)

## Xoshiro

The latest (as of May 2018) in the Xorshift-derivative series, Xoshiro family now offers 128-bit state generators in 32-bit just like the original xorshift. Comes in three variants: `xoshiro128**`, `xoshiro128++` and `xoshiro128+`. 

```js
function xoshiro128ss(a, b, c, d) {
    return function() {
        var t = b << 9, r = a * 5; r = (r << 7 | r >>> 25) * 9;
        c = c ^ a; d = d ^ b; b = b ^ c; a = a ^ d; c = c ^ t;
        d = d << 11 | d >>> 21;
        return (r >>> 0) / 4294967296;
    }
}

function xoshiro128pp(a, b, c, d) {
    return function() {
        var t = b << 9, r = a + d; r = (r << 7 | r >>> 25) + a;
        c = c ^ a; d = d ^ b; b = b ^ c; a = a ^ d; c = c ^ t;
        d = d << 11 | d >>> 21;
        return (r >>> 0) / 4294967296;
    }
}

// "for floating-point generation" - indicating serious bias in lowest bits.
function xoshiro128p(a, b, c, d) {
    return function() {
        var t = b << 9, r = a + d;
        c = c ^ a; d = d ^ b; b = b ^ c; a = a ^ d; c = c ^ t;
        d = d << 11 | d >>> 21;
        return (r >>> 0) / 4294967296;
    }
}
```

**References:**
- [Scrambled Linear Pseudorandom Number Generators (2018)](http://vigna.di.unimi.it/ftp/papers/ScrambledLinear.pdf)

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

// Seed procedure as recommended by the author:
var seed = 0; // any unsigned 32-bit integer.
var jsf = jsf32([0xF1EA5EED, seed, seed, seed]);
for(var i = 0; i < 20; i++) jsf();

// https://gist.github.com/imneme/85cff47d4bad8de6bdeb671f9c76c814
```

**References:**
- https://burtleburtle.net/bob/rand/smallprng.html

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

// Seed procedure as recommended by the author (close enough):
var seed = 0; // any unsigned 32-bit integer.
var advance = gjrand32([0xCAFEF00D, 0xBEEF5EED, seed, seed]);
for(var i = 0; i < 14; i++) advance();
```

**References:**
- http://gjrand.sourceforge.net/
- [gjrand.hpp](https://gist.github.com/imneme/7a783e20f71259cc13e219829bcea4ac) - source of 32-bit version

## sfc32

Yet another chaotic PRNG, the sfc stands for "Small Fast Counter".  It is part of the PracRand PRNG test suite. It passes PractRand, as well as Crush/BigCrush (TestU01). Also one of the fastest.

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

// Seed procedure --- clean this up later
void PractRand::RNGs::Raw::sfc32::seed(Uint64 s) {
	a = 0;//a gets mixed in the slowest
	b = Uint32(s >> 0);
	c = Uint32(s >> 32);
	counter = 1;
	for (int i = 0; i < 12; i++) raw32();//12
}
void PractRand::RNGs::Raw::sfc32::seed_fast(Uint64 s) {
	a = 0;
	b = Uint32(s >> 0); 
	c = Uint32(s >> 32);
	counter = 1;
	for (int i = 0; i < 8; i++) raw32();//8
}
void PractRand::RNGs::Raw::sfc32::seed(Uint32 s1, Uint32 s2, Uint32 s3) {
	a = s1;
	b = s2;
	c = s3;
	counter = 1;
	for (int i = 0; i < 15; i++) raw32();
}
```

**References:**
- http://pracrand.sourceforge.net/

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

**References:**
- [Paper: Fast and Small Nonlinear Pseudorandom Number Generators for Computer Simulation](https://www.researchgate.net/publication/233997772_Fast_and_Small_Nonlinear_Pseudorandom_Number_Generators_for_Computer_Simulation)

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

Very odd "chaotic" PRNG using a counter with variable output. It's supposed to be fast, but in Google Chrome specifically, it's quite slow. In Firefox it's fine, oddly enough.

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

// Seed procedure as recommended by the author:
var seed = 0; // any unsigned 32-bit integer
var next = v3b(seed, 2654435769, 1013904242, 3668340011); // golden ratios
for(var i = 0; i < 16; i++) next();
```

**References:**
- http://cipherdev.org/v3b.c (Original C code source)

****

# Addendum A: Seed generating functions

Most of the generators here have no built-in seed generating procedure (for sake of simplicity), but accept one or more 32-bit values as the initial state of the PRNG. Similar seeds (e.g. a simple seed of 1 and 2) can cause correlations in weaker PRNGs, resulting in the output having similar properties (such as randomly generated levels being similar). To avoid this, it is best practice to initialize PRNGs with a well-distributed seed.

There are various ways to seed a PRNG, but care must be taken. Certain generators have their own seeding procedure (jsf32, sfc32, gjrand32, v3b), which typically fill the state with some preset data and run the generator a few times in advance. This appears to work, and is often by design, but it can reduce the effective number of input states dramatically.

I propose using a seperate hash function to intiailize the entire state. Hash functions are very good at generating seeds for PRNGs from short strings. A good hash function will generate very different results even when two strings are similar. Here's an example based on MurmurHash3's mixing function:

```js
function xmur3(str) {
    for(var i = 0, h = 1779033703 ^ str.length; i < str.length; i++)
        h = Math.imul(h ^ str.charCodeAt(i), 3432918353),
        h = h << 13 | h >>> 19;
    return function() {
        h = Math.imul(h ^ h >>> 16, 2246822507),
        h = Math.imul(h ^ h >>> 13, 3266489909);
        return (h ^= h >>> 16) >>> 0;
    }
}
```

Each subsequent call to the *return function* of `xmur3` produces a new "random" 32-bit hash value to be used as a seed in a PRNG. Here's how you might use it:

```js
// Create xmur3 state:
var seed = xmur3("apples");
// Output four 32-bit hashes to provide the seed for sfc32.
var rand = sfc32(seed(), seed(), seed(), seed());

// Output one 32-bit hash to provide the seed for mulberry32.
var rand = mulberry32(seed());

// Obtain sequential random numbers like so:
rand();
rand();
```

On paper, this may be an ideal and efficient function for generating good _hash seeds_. But I haven't tested it thoroughly. As a final option, one can choose a full MurmurHash3 implementation:

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

Before xmur3, I also had `xfnv1a`, based on [Bret Mulvey's modified FNV1a](https://papa.bretmulvey.com/post/124027987928/hash-functions), but is probably lesser in quality:

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

// earlier attempt at improving xfnv1a, possibly overly verbose
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

`initseed` is an even older 128-bit seed generator I tried making. It takes an array of 4 32-bit numbers and mixes them using the mixing function from Murmur3/xxHash. Probably not worth using.

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

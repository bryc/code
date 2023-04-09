# Experimental hash functions

Nothing is set in stone yet, still working on this.

## BlazeHash

BlazeHash is intended to be a very fast non-cryptographic hash function in plain JavaScript, which also passes SMHasher.
This is the first 'stable' version:

```js
function BlazeHash(key, seed = 0) {
    let h1 = 0xcafebabe ^ seed, h2 = 0xdeadbeef ^ seed, i = 0;
    for(let b = key.length & -8; i < b; i += 8) {
        h1 ^= key[i+3] << 24 | key[i+2] << 16 | key[i+1] << 8 | key[i  ];
        h2 ^= key[i+7] << 24 | key[i+6] << 16 | key[i+5] << 8 | key[i+4];
        h1 ^= Math.imul(h2 ^ (h2 >>> 15), 0xca9b4735);
        h2 ^= Math.imul(h1 ^ (h1 >>> 16), 0x38b34ae5);
    }
    switch(key.length & 7) {
        case 7: h2 ^= key[i+6] << 16;
        case 6: h2 ^= key[i+5] << 8;
        case 5: h2 ^= key[i+4];
        case 4: h1 ^= key[i+3] << 24;
        case 3: h1 ^= key[i+2] << 16;
        case 2: h1 ^= key[i+1] << 8;
        case 1: h1 ^= key[i];
        h1 ^= Math.imul(h2 ^ (h2 >>> 15), 0xca9b4735);
        h2 ^= Math.imul(h1 ^ (h1 >>> 16), 0x38b34ae5);
    }
    h1 ^= key.length ^ h2;
    h1 ^= Math.imul(h1 ^ (h2 >>> 15), 0x735a2d97);
    h2 ^= Math.imul(h2 ^ (h1 >>> 15), 0xcaf649a9);
    h1 ^= h2 >>> 16; h2 ^= h1 >>> 16;
    return [h1 >>> 0, h2 >>> 0];
    //return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}
```

It's speed mostly comes from the fact that it reads 8 bytes at a time and performs only the minimum amount of operations required to pass strict avalanche criterion. I haven't yet checked it in SMHasher, so further tweaks may be required to ensure both h1 and h2 pass as a 64-bit hash.

It has _quite_ good avalanche behavior, though in some rare cases_very_ slight bias may randomly pop up. I did my best to minimize it though. The only way to fully eliminate it will unfortunately involve adding extra operations, but before that i need to use even more sensitive tests.

At some point I would also like to try to see if a 128-bit version of BlazeHash can beat the speed of my MurmurHash3_128 port. It's really quite fast and also very good quality (in fact, it's probably the best choice for a robust hash in JS), so it'll be hard to beat


*****

The rest of this article is just a bunch of alpha-quality experiments for illustrative purposes, which you should not use except for studying.


## Cyb

Cyb is a hash function experiment to help gain a bit of insight into effective hashing techniques. It's still WIP, but will be published in this repo.

Consider the following three functions which develop and improve:

```js
function cyb_test0(key) {
    let hash = 1;
    for(let i = 0; i < key.length; i++) {
        hash += hash << 1;
        hash += key[i];
    }
    return hash;
}
```

can be improved into:

```js
function cyb_test1(key) {
    let hash = 1;
    for(let i = 0; i < key.length; i++) {
        hash += key[i];
        hash += hash << 7;
    }
    return hash;
}
```

which can be further improved into:

```js
function cyb_test2(key) {
    let hash = 1;
    for(let i = 0; i < key.length; i++) {
        hash += key[i];
        hash += hash << 8;
        hash ^= hash >>> 1;
    }
    return hash;
}
```

Basically, I will evaluate each step in the evolution of each hash function. I'll produce some statistics for collision rate and general quality. As well as provide rationales for the selection of each shift digit and such. Maybe figure out some interesting stuff that isn't already well known along the way. I'd also like to compare speed / code size in compiled output. Would be interesting to see if any of these could rival or improve upon ancient checksum or hashing techniques still used in limited embedded hardware today.

I'll do this first for the shift-based techniques above (which also include Jenkin's OOAT hash), but also look into multiplication-based methods like FNV-1a or Knuth's multiplicative hash.

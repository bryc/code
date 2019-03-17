# Experimental hash functions

Nothing is set in stone yet, still working on this.

## BlazeHash

BlazeHash is intended to be polished family of fast hash functions in JavaScript.
Nothing is final yet (so proceed with caution), but the [64-bit variants](blaze.js) are looking promising.
I also plan to make a 128-bit version, and probably a plain 32-bit one. Nothing has been tested extensively, but things will probably have to change when it is tested properly.

## Cyb

Cyb is a hash function experiment to help gain a bit of insight into effective hashing techniques. It's still WIP, but I will publish it when it is done.

For an example of what I mean, consider the following three functions which develop and improve:

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
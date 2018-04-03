
# Cyb

Cyb (previously CYRB32) is a hash function experiment designed for quickly identifying binary data. It comes in many variants and its quality remains not well understood (which should change when I am able to tame SMHasher).  

Regardless, it demonstrates potential and serves as a test bed for an eventual finalized algorithm. In this article, I will document each iteration of the code.

# Cyb Alpha-0

**Alpha-0** is the earliest version of Cyb I could find saved anywhere.  It makes an attempt to force avalanche using two XOR operations, but it is ineffective.

```js
function cyb_alpha0(key) {
    var hash = 1;
    for(var i = 0; i < key.length; i++) {
        hash += (hash << 1) + key[i]; // (hash << 4) is probably better
        hash ^= hash << 6;
    }
    hash ^= hash << 20;
    return hash >>> 0;
}
```

# Cyb Alpha-1

**Alpha-1** is Alpha-0, but stripped to its absolute core. It makes no attempt at avalanche, but retains the ability to differentiate between similar keys (e.g. `[0,1,0]` vs. `[1,0,0]` or `[0,0]` vs. `[0,0,0]`). To achieve this, the initial value of the hash must be non-zero. 

```js
function cyb_alpha1(key) {
    var hash = 1;
    for(var i = 0; i < key.length; i++) {
        hash += (hash << 1) + key[i]; // (hash << 4) is better!
    }
    return hash >>> 0;
}
```

Compared to Alpha-0, it has poor collision-resistance. Changing `hash << 1` to `hash << 4` can improve this slightly, however. This issue and more is addressed in **Cyb Alpha-2**. It also has seriously **horrible** distribution/randomness.

**Note to self:** When able to discern a difference through testing, determine if and how adding `key[i]` to the hash first is effective. My basic tests lean on yes, but I need to be sure.

# Cyb Alpha-2 (New)

**Alpha-2** is an attempt to improve Alpha-1 while maintaining as much simplicity as possible. There are currently two candidates, Alpha-2A and Alpha-2B. Both candidates appear superior to even Cyb Alpha.

**Alpha-2A**, originally called miracle, was my first attempt at improving Alpha-1. It's main goal is to achieve good distribution/randomness in very short or sparse keys. Which it mildly succeeds at.

```js
function cyb_alpha2a(key) {
    var hash = 1;
    for(var i = 0; i < key.length; i++) {
        hash += key[i];
        hash += hash << 5; // hash << 4
        hash ^= hash >>> 1;
    }
    hash ^= hash << 9; // hash << 11
    hash += hash << 15; // hash << 14
    return hash >>> 0;
}
```

**Alpha-2B** borrows constants from Bob Jenkin's OAAT hash, which seem to have interesting properties. It differs to Jenkins' original by having an initial value of `1`, and reducing mixing to a single line: `hash += hash << 15`. It appears to have distribution problems for small keys which Alpha-2A does not.

```js
function cyb_alpha2b(key) {
    var hash = 1;
    for(var i = 0; i < key.length; i++) {
        hash += key[i];
        hash += hash << 10;
        hash ^= hash >>> 6;
    }
    hash += hash << 15;
    return hash >>> 0;
}
```

# Cyb Beta-0 (WIP)

Beta is characterized by reading 4 bytes at a time and uses `Math.imul`, similar to MurmurHash. It is a bit faster than my MurmurHash implementations (which are already fast), but might have inferior quality (it is untested). The multiplication constants are arbitrary primes. The algorithm seems to suffer quality if the first prime is the same as the second.

```js
function cyb_beta0(key) {
    var hash = 1;
    for (var i = 0, chunk = -4 & key.length; i < chunk; i += 4) {
        hash += key[i+3] << 24 | key[i+2] << 16 | key[i+1] << 8 | key[i];
        hash = Math.imul(hash, 1540483507);
        hash ^= hash >>> 24;
    }
    
    switch (3 & key.length) {
        case 3: hash ^= key[i+2]<<16;
        case 2: hash ^= key[i+1]<<8;
        case 1: hash ^= key[i], hash = Math.imul(hash, 3432918353);
    }
    
    hash ^= key.length;
    hash = Math.imul(hash, 3432918353);
    hash ^= hash >>> 15;
    
    return hash >>> 0;
}
```

# Cyb Beta-1 (WIP)
Beta-1 is a modification of Beta-0 that outputs two unrelated 32-bit hashes, effectively producing a 64-bit result that should have much fewer collisions. It's also faster than my MurmurHash3, and as fast as my MurmurHash2 32-bit implementations (which are already quite fast), making it quite efficient. It passes my basic collision/avalanche tests, but I cannot make any hash quality assurances. It can either be output as an array of 3 numbers or a truncated 52-bit number.

```js
function cyb_beta1(key, seed = 0) {
    var m1 = 1540483507, m2 = 3432918353, m3 = 433494437, m4 = 370248451;
    var h1 = seed ^ Math.imul(key.length, m3) + 1;
    var h2 = seed ^ Math.imul(key.length, m1) + 1;

    for (var k, i = 0, chunk = -4 & key.length; i < chunk; i += 4) {
        k = key[i+3] <<24 | key[i+2] <<16 | key[i+1] <<8 | key[i];
        k ^= k >>> 24;
        h1 = Math.imul(h1, m1) ^ k, h2 = Math.imul(h2, m3) ^ k;
    }
    switch (3 & key.length) {
        case 3: h1 ^= key[i+2] << 16, h2 ^= key[i+2] << 16;
        case 2: h1 ^= key[i+1] << 8, h2 ^= key[i+1] << 8;
        case 1: h1 ^= key[i], h2 ^= key[i];
                h1 = Math.imul(h1, m2), h2 = Math.imul(h2, m4);
    }
    h1 ^= h1>>>13, h1 = Math.imul(h1, m2), h1 ^= h1>>>15; h1>>>=0;
    h2 ^= h2>>>13, h2 = Math.imul(h2, m3), h2 ^= h2>>>15; h2>>>=0;
    return [h1, h2]; // (h2 & 2097151) * 4294967296 + h1 // for 52-bit Number output
}
```

A quick experiment of finding collisions in 32-bit output shows that a full 52-bit digest would be unaffected:
This essentially means that `h2` and `h1` are independent and do not share collision occurrences.

<code><u>19acdb</u>|<b>e5b96b93</b> <u>165e02</u>|<b>e5b96b93</b></code>
<code><u>02d422</u>|<b>ae1750fa</b> <u>1d5bf3</u>|<b>ae1750fa</b></code>
<code><u>163886</u>|<b>150b0b42</b> <u>003ea3</u>|<b>150b0b42</b></code>
<code><u>0c905c</u>|<b>15152ff2</b> <u>0c9ca6</u>|<b>15152ff2</b></code>
<code><u>11990c</u>|<b>2864e779</b> <u>13af97</u>|<b>2864e779</b></code>

****

# Cyb Kappa (Deprecated)

**Kappa** is an older series of misguided attempts to improve Cyb Alpha-1. Performance is quite bad in Kappa-1 through 4. The only functions worth investigation are Kappa-1 and Kappa-5, everything else is garbage and only shown here for completeness.

**Kappa-0** is the original in this series. It fails Test 4 in the same way Cyb Alpha-1 did due to `hash << 1` and this flaw is present throughout the Kappa series. Also appears to have bad distribution. It's quite bad overall.

```js
function cyb_kappa0(key) {
    var hash = 0xcadb07c5;
    for(var i = 0; i < key.length; i++) {
        hash += (hash << 1) + key[i];
    }
    hash ^= hash << 9;
    hash ^= hash << 16;
    return hash >>> 0;
}
```

**Kappa-1** attempts to improve distribution/randomness. It succeeds, but at a high performance cost. It also suffers from bad collision even with the fix applied.

```js
function cyb_kappa1(key) {
    var hash = 0xcadb07c5;
    for(var i = 0; i < key.length; i++) {
        hash += (hash << 1) + key[i];
    }
    var tmp = hash >>> 0;
    while(tmp > 0) {
        if(tmp & 1) {
            hash += tmp;
            hash ^= hash << 1;
        }
        tmp >>>= 1;
    }
    return hash >>> 0;
}
```

**Kappa-2** attempts to use a circular shift. A valiant effort, but it failed due to heavy collisions.  Distribution appears fine, but it is very flawed and has many collisions.

```js
function cyb_kappa2(key) {
    function csh(a,b) {return(a<<b|a>>>(32-b))}
    var hash = 0xcadb07c5;
    for(var i = 0; i < key.length; i++) {
        hash ^= key[i];
        hash += csh(hash, hash & 7 | 1);
    }
    for(var tmp = hash >>> 0; tmp > 0; tmp >>>= 1) {
        if(tmp & 1) {
            hash = (hash + tmp) ^ csh(hash, hash & 3 | 1);
        }
    }
    return hash >>> 0;
}
```

**Kappa-3**: Going back to what works. Small key distribution seems alright. Appears to have many issues though.

```js
function cyb_kappa3(key) {
    var hash = 1337;
    for(var i = 0; i < key.length; i++) {
        hash += key[i];
        hash += hash << (hash & 7);
    }
    for(var tmp = hash >>> 0; tmp > 0; tmp >>>= 1) {
        if(tmp & 1) {
            hash += tmp + (hash << (hash & 7));
        }
    }
    return hash >>> 0;
}
```

**Kappa-4**: This was used in MPKEdit for quite a while. Distribution seems OK for the most part.

```js
function cyb_kappa4(key) {
    var hash = 0x9CB85729;
    for(var i = 0; i < key.length; i++) {
        hash += key[i];
        hash += hash << ((hash & 7) + 1);
    }
    for(var tmp = hash >>> 0; tmp > 0; tmp >>>= 1) {
        if(tmp & 1) {
            hash += tmp + (hash << ((hash & 7) + 1));
        }
    }
    return hash >>> 0;
}
```

**Kappa-5**: Trying to simplify things. Distribution seems alright.

```js
function cyb_kappa5(key) {
    var hash = 0xbf3931a8;
    for(var i = 0; i < key.length; i++) {
        hash += (hash << 3) + key[i];
        hash ^= hash >>> 1;
    }
    for(var tmp = hash >>> 0; tmp > 0; tmp >>>= 3) {
        hash += (hash << 4) ^ tmp;
    }
    return hash >>> 0;
}
```
/*
    cyrb53 (c) 2018 bryc (github.com/bryc)
    A fast and simple 53-bit hash function with decent collision resistance.
    Largely inspired by MurmurHash2/3, but with a focus on speed/simplicity.
    Public domain. Attribution appreciated.
*/
const cyrb53 = function(str, seed = 0) {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for(let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1  = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2  = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

/*
    cyrb53a (c) 2023 bryc (github.com/bryc)
    There's a somewhat noticeable mixing bias in h1 of the old version.
    Not enough to worry much about, but I decided to try and fix it.
    I've tweaked the constants and operations, and now it passes
    strict avalanche criteria, and even does it in fewer operations.
    Public domain. Attribution appreciated.
*/
const cyrb53a = function(str, seed = 0) {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for(let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 3545902487);
        h2 = Math.imul(h2 ^ ch,  569420461);
    }
    h1 ^= Math.imul(h1 ^ (h2 >>> 15), 1935289751);
    h2 ^= Math.imul(h2 ^ (h1 >>> 15), 4082773399);
    h2 ^= h1 >>> 16; h1 ^= h2 >>> 16;
    return 2097152 * (h2 >>> 0) + (h1 >>> 11);
};

/*
    cyrb53b (c) 2023 bryc (github.com/bryc)
    Not ready yet. Soon though. This will be another 53-bit hash, but it will
    be even faster by reading up to 8 bytes at a time.
    It will take up more lines, but it will be worth it for the speed boost.
*/

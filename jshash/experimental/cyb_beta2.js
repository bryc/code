/*
    Cyb-Beta 2 hash (64-bit) (by github.com/bryc)
    -----------------
    This is a WIP, hasn't been fully tested.


Collision resistance has issues:

console.log(
    cyb_beta2([42, 50, 103, 117] ).toString(16) ,
    cyb_beta2([42, 114, 103, 53] ).toString(16)    
);
console.log(
    cyb_beta2([44, 52, 68, 100] ).toString(16) ,
    cyb_beta2([44, 116, 68, 36] ).toString(16)    
);
console.log(
    cyb_beta2([110, 43, 95, 45] ).toString(16) ,
    cyb_beta2([110, 107, 95, 109] ).toString(16)    
);
console.log(
    cyb_beta2([37, 50, 56, 108] ).toString(16) ,
    cyb_beta2([37, 114, 56, 44] ).toString(16)    
);
console.log(
    cyb_beta2([114, 50, 76, 43] ).toString(16) ,
    cyb_beta2([114, 66, 76, 91] ).toString(16)    
);
*/

function cyb_beta2(key, seed = 0) {
    let h1 = Math.imul(key.length ^ seed,  433494437) | 1,
        h2 = Math.imul(key.length ^ seed, 1540483507) | 1;

    for (var i = 0, k, chunk = -4 & key.length; i < chunk; i += 4) {
        k = key[i+3] << 24 | key[i+2] << 16 | key[i+1] << 8 | key[i];
        k ^= k >>> 16;
        h1 ^= Math.imul(h2 ^ k, 1540483507);
        h2 ^= Math.imul(h1 ^ k, 433494437);
    }
    switch (3 & key.length) {
        case 3: k ^= key[i+2] << 16;
        case 2: k ^= key[i+1] << 8;
        case 1: k ^= key[i];
                k ^= k >>> 16;
                h1 ^= Math.imul(h2 ^ k, 3432918353);
                h2 ^= Math.imul(h1 ^ k, 370248451);
    }
    h1 ^= Math.imul(h1 ^ (h2 >>> 15), 0x735a2d97);
    h2 ^= Math.imul(h2 ^ (h1 >>> 15), 0xcaf649a9);
    h1 ^= h2 >>> 16; h2 ^= h1 >>> 16;

    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

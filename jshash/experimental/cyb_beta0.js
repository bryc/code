/*
    Cyb Beta-0
    ---------------
    Fast, experimental 32-bit hash by bryc (github.com/bryc)
    Based on MurmurHash2
*/

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
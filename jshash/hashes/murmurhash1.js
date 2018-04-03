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

/*
    FNV (Fowler/Noll/Vo)
    ---------------
    optimized 32-bit FNV hash implementations - github.com/bryc
    ---------------
    FNV0 - FNV-0, original (obsolete)
    FNV1 - FNV-1, first version
    FNV1a - FNV-1a, revised FNV-1
    FNV1a_BM - FNV-1a, "forced avalanche" modification (Mulvey)
*/

function FNV0(key) {
    var hval = 0;
    for(var i = 0; i < key.length; i++) {
        hval = key[i] ^ Math.imul(hval, 16777619);
    }
    return hval >>> 0;
}

function FNV1(key) {
    var hval = 2166136261 | 0;
    for(var i = 0; i < key.length; i++) {
        hval = key[i] ^ Math.imul(hval, 16777619);
    }
    return hval >>> 0;
}

function FNV1a(key) {
    var hval = 2166136261 | 0;
    for(var i = 0; i < key.length; i++) {
        hval = Math.imul(hval ^ key[i], 16777619);
    }
    return hval >>> 0;
}

function FNV1a_BM(key) {
    var hval = 2166136261 | 0;
    for(var i = 0; i < key.length; i++) {
        hval = Math.imul(hval ^ key[i], 16777619);
    }
    hval += hval << 13;
    hval ^= hval >>> 7;
    hval += hval << 3;
    hval ^= hval >>> 17;
    hval += hval << 5;
    return hval >>> 0;
}

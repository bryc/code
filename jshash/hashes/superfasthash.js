/*
    SuperFastHash
    ---------------
    Paul Hsieh's SuperFastHash implemented by bryc (github.com/bryc)
    Outputs 32-bit hash.

    Source: http://www.azillionmonkeys.com/qed/hash.html

    Seems to have more collisions than normal. Fails my rolling bit test
    with 2 of 10240 collisions, implying worse-than-chance collisions.
    Doesn't seem AS bad as people think though.
    
    Strict Avalanche test shows that it fails moderately.
    This is definitely a problematic hash.
*/

function SuperFastHash(key) {
    if (!key) {return 0}
    var hash = key.length, tmp, len = key.length >>> 2, p = 0;

    for (var i = 0; i < len; i++) {
        hash += key[p] | key[p+1] << 8;
        tmp = ((key[p+2] | key[p+3] << 8) << 11) ^ hash;
        hash = (hash << 16) ^ tmp;
        hash += hash >>> 11;
        p += 4;
    }

    switch(key.length & 3) {
        case 3:
            hash += key[p] | key[p+1] << 8;
            hash ^= hash << 16;
            hash ^= key[p+2] << 18;
            hash += hash >>> 11;
            break;
        case 2:
            hash += key[p] | key[p+1] << 8;
            hash ^= hash << 11;
            hash += hash >>> 17;
            break;
        case 1:
            hash += key[p];
            hash ^= hash << 10;
            hash += hash >>> 1;
            break;
    }

    hash ^= hash << 3;
    hash += hash >>> 5;
    hash ^= hash << 4;
    hash += hash >>> 17;
    hash ^= hash << 25;
    hash += hash >>> 6;

    return hash >>> 0;
}

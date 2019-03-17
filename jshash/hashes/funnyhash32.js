/*
    FunnyHash32
    ---------------
    FunnyHash32 implemented by bryc (github.com/bryc)

    A bit of a strange design, it loads the entire 4 bytes again at the end, rather than a 'tail'.
    Which can lead to some duplicate bytes introduced.
    And when keys are 1 or 2 bytes in length, it also duplicates some of those bytes.
    It also only mixes a and b at the end via addition, which may not be the best choice in JS
    if it is a C optimization.
*/

function funnyhash32(key, seed = 0) {
    function rotl(n,r){return n<<r | n>>>32-r}
    let c1 = 0xb8b34b2d, c2 = 0x52c6a2d9;
    let a = seed ^ 2<<16, b = seed, len = key.length, t;

    for(let i = 0; len >= 4; len -= 4, i += 4) {
        t = key[i+3] << 24 | key[i+2] << 16 | key[i+1] << 8 | key[i];
        a = Math.imul(rotl(a ^ t, 16), c1);
        b = Math.imul(rotl(b, 16) ^ t, c2);
    }

    t = key.length - 4;
    t = t<0 ?
        key[0] | key[0|key.length/2]<<8 | key[key.length-1] << 16 :
        key[t+3] << 24 | key[t+2] << 16 | key[t+1] << 8 | key[t];

    a ^= len, b ^= len;
    a = Math.imul(rotl(a ^ t, 16), c1);
    b = Math.imul(rotl(b, 16) ^ t, c2);

    a ^= a>>>11 ^ a>>>20, b ^= b>>>11 ^ b>>>20;
    a = Math.imul(a, c1), b = Math.imul(b, c2);
    a ^= a >>> 16, b ^= b >>> 16;
    return (a + b) >>> 0;
}

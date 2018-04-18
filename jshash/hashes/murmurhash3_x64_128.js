/*
    MurmurHash3_x64_128
    ---------------
    128-bit MurmurHash3 (64-bit version) implemented by bryc (github.com/bryc)

    WIP. This is very slow due to the 64-bit operations involved.
*/

function MurmurHash3_x64_128(key, seed = 0) {
    function mul(u,n){var r=u[0]>>>16,l=65535&u[0],m=u[1]>>>16,t=65535&u[1],a=n[0]>>>16,
    c=65535&n[0],e=n[1]>>>16,f=65535&n[1],i=0,o=0,v=0,b=0;return v+=(b+=t*f)>>>16,o+=(v+=m*f)>>>16,
    v&=65535,o+=(v+=t*e)>>>16,i+=(o+=l*f)>>>16,o&=65535,i+=(o+=m*e)>>>16,o&=65535,i+=(o+=t*c)>>>16,
    i+=r*f+l*e+m*c+t*a,[((i&=65535)<<16|(o&=65535))>>>0,((v&=65535)<<16|(b&=65535))>>>0]}

    function add(a, b) {
        return [(a[0]+b[0] + (a[1]+b[1] > 0xFFFFFFFF)) >>> 0, (a[1]+b[1]) >>> 0];
    }

    function rol(n, r) {
        if(r < 32) {
            return [(n[0] << r | n[1] >>> 32-r) >>> 0, (n[1] << r | n[0] >>> 32-r) >>> 0];
        } else {
            r -= 32;
            return [(n[1] << r | n[0] >>> 32-r) >>> 0, (n[0] << r | n[1] >>> 32-r) >>> 0];
        }
    }

    function shl(n, r) {
        if(r < 32) {
            return [n[0] << r | n[1] >>> 32-r, n[1] << r];
        } else if(r < 64) {
            return [n[1] << r-32, 0];
        }
    }

    function xor(a, b) {
        return [(a[0] ^ b[0]) >>> 0, (a[1] ^ b[1]) >>> 0];
    }

    function fmix(h) {
        h = xor(h, [0, h[0] >>> 1]);
        h = mul(h, [0xff51afd7, 0xed558ccd]);
        h = xor(h, [0, h[0] >>> 1]);
        h = mul(h, [0xc4ceb9fe, 0x1a85ec53]);
        h = xor(h, [0, h[0] >>> 1]);
        return h;
    }

    var h1 = [0, seed], h2 = [0, seed], k1 = [0, 0], k2 = [0, 0];
    var p1 = [0x87c37b91, 0x114253d5], p2 = [0x4cf5ad43, 0x2745937f];

    for(var i = 0, b = key.length & -16; i < b; i += 16) {
        k1 = [key[i+4]  | key[i+5 ]<<8 | key[i+6 ]<<16 | key[i+7] <<24, key[i]   | key[i+1]<<8 | key[i+2 ]<<16  | key[i+3 ]<<24];
        k2 = [key[i+12] | key[i+13]<<8 | key[i+14]<<16 | key[i+15]<<24, key[i+8] | key[i+9]<<8 | key[i+10]<<16  | key[i+11]<<24];
        k1 = mul(k1, p1);
        k1 = rol(k1, 31);
        k1 = mul(k1, p2);
        h1 = xor(h1, k1);
        h1 = rol(h1, 27);
        h1 = add(h1, h2);
        h1 = add(mul(h1, [0, 5]), [0, 0x52dce729]);
        k2 = mul(k2, p2);
        k2 = rol(k2, 33);
        k2 = mul(k2, p1);
        h2 = xor(h2, k2);
        h2 = rol(h2, 31);
        h2 = add(h2, h1);
        h2 = add(mul(h2, [0, 5]), [0, 0x38495ab5]);
    }

    k1 = [0, 0]; k2 = [0, 0];
    switch(key.length & 15) {
        case 15: k2 = xor(k2, shl([0, key[i+14]], 48));
        case 14: k2 = xor(k2, shl([0, key[i+13]], 40));
        case 13: k2 = xor(k2, shl([0, key[i+12]], 32));
        case 12: k2 = xor(k2, shl([0, key[i+11]], 24));
        case 11: k2 = xor(k2, shl([0, key[i+10]], 16));
        case 10: k2 = xor(k2, shl([0, key[i+9]], 8));
        case 9:  k2 = xor(k2, [0, key[i+8]]);
                 k2 = mul(k2, p2);
                 k2 = rol(k2, 33);
                 k2 = mul(k2, p1);
                 h2 = xor(h2, k2);
        case 8:  k1 = xor(k1, shl([0, key[i+7]], 56));
        case 7:  k1 = xor(k1, shl([0, key[i+6]], 48));
        case 6:  k1 = xor(k1, shl([0, key[i+5]], 40));
        case 5:  k1 = xor(k1, shl([0, key[i+4]], 32));
        case 4:  k1 = xor(k1, shl([0, key[i+3]], 24));
        case 3:  k1 = xor(k1, shl([0, key[i+2]], 16));
        case 2:  k1 = xor(k1, shl([0, key[i+1]], 8));
        case 1:  k1 = xor(k1, [0, key[i]]);
                 k1 = mul(k1, p1);
                 k1 = rol(k1, 31);
                 k1 = mul(k1, p2);
                 h1 = xor(h1, k1);
    }

    h1 = xor(h1, [0, key.length]);
    h2 = xor(h2, [0, key.length]);
    h1 = add(h1, h2);
    h2 = add(h2, h1);
    h1 = fmix(h1);
    h2 = fmix(h2);
    h1 = add(h1, h2);
    h2 = add(h2, h1);

    return [h1[0] >>> 0, h1[1] >>> 0, h2[0] >>> 0, h2[1] >>> 0];
}

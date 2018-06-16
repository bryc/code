/* 
Attempt to port 128-bit zzHash to JavaScript
Probably incorrect.
*/

function zzHash128(key, seed = 0) {
    function rotl32(x,r){return x << r | x >>> 32-r}

    function get_32bits(key, i) {
        return key[i+3] << 24 | key[i+2] << 16 | key[i+1] << 8 | key[i];
    }

    function fmix32(h, p1, p2){
        h = Math.imul(h ^ h>>>15, p1);
        h = Math.imul(h ^ h>>>13, p2);
        h ^= h>>>16;
        return h;
    }

    function update(h1, h2, p1, p2, int) {
        h1 += int;
        h1 = Math.imul(h1, p1);
        h1 += h2;
        h1 = Math.imul(h1, p2);
        return h1;
    }

    var p1 = 2654435761,
        p2 = 2246822519,
        p3 = 3266489917,
        p4 = 668265263,
        p5 = 374761393,
        v1 = seed | 0,
        v2 = p3 | 0,
        v3 = seed | 0,
        v4 = p5 | 0,
        v5 = seed |0,
        v6, i = 0;

    if(key.length >= 20) {
        while(i <= key.length - 20) {
            v1 = update(v1, v2, p1, p4, get_32bits(key, i)); i += 4;
            v2 = update(v2, v3, p2, p5, get_32bits(key, i)); i += 4;
            v3 = update(v3, v4, p3, p1, get_32bits(key, i)); i += 4;
            v4 = update(v4, v5, p4, p2, get_32bits(key, i)); i += 4;
            v5 = update(v5, v1, p5, p3, get_32bits(key, i)); i += 4;
        }
    }
    
    switch (key.length - i) {
        case 19:
        case 18:
        case 17:
            v1 = update(v1, v2, p1, p4, get_32bits(key, i)); i += 4;
            v2 = update(v2, v3, p2, p5, get_32bits(key, i)); i += 4;
            v3 = update(v3, v4, p3, p1, get_32bits(key, i)); i += 4;
            v4 = update(v4, v5, p4, p2, get_32bits(key, i)); i += 4;
            v5 = update(v5, v1, p5, p3, get_32bits(key, i)); i += 4;
            break;
        case 16:
        case 15:
        case 14:
        case 13:
            v1 = update(v1, v2, p1, p4, get_32bits(key, i)); i += 4;
            v2 = update(v2, v3, p2, p5, get_32bits(key, i)); i += 4;
            v3 = update(v3, v4, p3, p1, get_32bits(key, i)); i += 4;
            v4 = update(v4, v5, p4, p2, get_32bits(key, i)); i += 4;
            break;
        case 12:
        case 11:
        case 10:
        case  9:
            v1 = update(v1, v2, p1, p4, get_32bits(key, i)); i += 4;
            v2 = update(v2, v3, p2, p5, get_32bits(key, i)); i += 4;
            v3 = update(v3, v4, p3, p1, get_32bits(key, i)); i += 4;
            break;
        case  8:
            v1 = update(v1, v2, p1, p4, get_32bits(key, i)); i += 4;
            v2 = update(v2, v3, p2, p5, get_32bits(key, i)); i += 4;
            break;
        case  7:
        case  6:
        case  5:
            v1 += get_32bits(key, i) * p1; i += 4;
            v2 += rotl32(get_32bits(key, i) * p2, 13); i += 4;
            break;
        case  4:
            v1 += get_32bits(key, i); i += 4;
            break;
        case  3: v1 += key[i+2] << 16;
        case  2: v1 += key[i+1] << 8;
        case  1: v1 += key[i];
        case  0:
            break;
    }
    
    v6 = key.length + v1 + v2 + v3 + v4 + v5;
    v1 += v6; v2 ^= v6; v3 += v6; v4 ^= v6; v5 += v6;
    
    v1 = fmix32(v1, p1, p2);
    v2 = fmix32(v2, p2, p3);
    v3 = fmix32(v3, p3, p4);
    v4 = fmix32(v4, p4, p5);
    v5 = fmix32(v5, p5, p1);
    
    v6 = v1 + v2 + v3 + v4 + v5;
    v1 += v6; v2 ^= v6; v3 += v6; v4 ^= v6;
    
    return [v1>>>0, v2>>>0, v3>>>0, v4>>>0];
}

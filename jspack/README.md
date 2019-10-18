<p align=center><img src=https://user-images.githubusercontent.com/1408749/53035252-04d48300-3443-11e9-85c0-54a14a7d477b.png></p>

## Lossless compression algorithms in JavaScript

Here are various LZ-based compression algorithms ported to JS, aiming for functional simplicity and speed in the spirit of my other hash/PRNG implementations. The goal is for each to weigh less than 1000 bytes when minified.

### LZ77

### LZSS

### LZW

### LZP

### LZJB

```js
var LZJB = {
    e: (I) => {
        var out = [], S = 0, D = 0, C, cmp, cmk = 128, i, ofs, hp, tbl = [], len = I.length;

        while (S < len) {
            if ((cmk <<= 1) == 256) { cmk = 1, cmp = D, out[D++] = 0; }
            if (S > len-3) { out[D++] = I[S++]; continue; }

            hp = I[S] << 16 | I[S+1] << 8 | I[S+2];
            hp ^= hp >> 9; hp = (I[S] ^ hp + (hp >> 5)) & 1023;

            ofs = S-tbl[hp] & 1023;
            tbl[hp] = S;

            C = S - ofs;
            if (C != S && I[S] == I[C] && I[S+1] == I[C+1] && I[S+2] == I[C+2]) {
                for(i = 3; i < 66 && I[S+i] == I[C+i]; i++); S += i;
                out[cmp] |= cmk;
                out[D++] = i-3 << 2 | ofs >> 8;
                out[D++] = ofs & 255;
            } else { out[D++] = I[S++]; }
        }
        return out;
    },
    d: (I) => {
        var out = [], S = 0, D = 0, C, cmp, cmk = 128, i;

        while (S < I.length) {
            if ((cmk <<= 1) == 256) { cmk = 1, cmp = I[S++]; }

            if (cmp & cmk) {
                C = D - ((I[S]<<8 | I[S+1]) & 1023);
                i = (I[S]>>2) + 3;
                S = S + 2;
                for(; i > 0; i--) { out[D++] = out[C++]; }
                
            } else { out[D++] = I[S++]; }
        }
        return out;
    }
};
```

### Snappy

# "Cyclic Codes for Error Detection"
### Implementing Cyclic Redundancy Check (CRC) in JavaScript

This article serves as sequential documentation of attempts to implement my own versions of table-based and non-table based CRC algorithms in multiple widths (e.g. CRC-4, CRC-8, CRC-16, CRC-32). Many variants of CRC aren't readily available in JS, so the goal is to learn how CRC works and produce a concise library that supports all of the possible parameters. For now, the code will be kept as short and simple as possible while maintaining accurate output.

*Quick observation before we start: I've noticed that certain parts of the code must be altered depending on whether reflections are used, which is annoying. Most other parameters do not require alterations (such as `poly` or `init`). Determining the exact nature of this will be important for the final library.*

We will start by computing the CRC lookup table, since it's often a prerequisite of the algorithm. Later we will look into methods which bypass this step entirely (at a performance cost). Here are some attempts to generate the CRC table for various flavors of CRC:

## CRC-16/CCIITT-TRUE (KERMIT)
**Settings:** `width=16`, `poly=0x1021`, `init=0x0000`, `refin=true`, `refout=true`, `xorout=0x0000`, `check=0x2189`
```js
    function CRC(data) {
        var POLY = 0x8408;
        for(var crc = 0, i = 0, table = []; i < 256; i++) {
            crc = i;
            for(var j = 0; j < 8; j++) {
                crc = crc & 1 ? crc >>> 1 ^ POLY : crc >>> 1;
            }
            table[i] = crc & 0xFFFF;
        }

        console.log(0x1189, 0x2312, 0x329b, table); 
    }
    CRC(); // table[1], table[2], table[3] should match 3 values.
```

Note that the polynomial used in the code, `0x8408`, is actually `0x1021` with the bits in **reverse order**. I am not sure why this must be.

## CRC-16/CCIITT-FALSE
**Settings:** `width=16`, `poly=0x1021`, `init=0xffff`, `refin=false`, `refout=false`, `xorout=0x0000 `, `check=0x29b1`
```js
    function CRC(data) {
        var POLY = 0x1021;
        for(var crc = 0, i = 0, table = []; i < 256; i++) {
            crc = i << 8;
            for(var j = 0; j < 8; j++) {
                crc = crc & 0x8000 ? crc << 1 ^ POLY : crc << 1;
            }
            table[i] = crc & 0xFFFF;
        }

        console.log(0x1021, 0x2042, 0x3063, table); 
    }
    CRC(); // table[1], table[2], table[3] should match 3 values.
```

Unlike the previous configuration, *CRC-16/CCIITT-TRUE*, the polynomial in the code no longer needs to be reversed, I suspect due to the reflection being `false`. The logic must be altered, however, and appears slightly more complicated. `crc = i` is now `crc = i << 8`, and `crc & 1` is now `crc & 0x8000`. The shifts have also changed direction.

****

So far so good for 16-bit CRC tables. Let's move on to 32-bit CRC's. Based on what we've found, we should be able to adapt the *CRC-16/CCIITT-TRUE* code to any CRC width by following these rules:

1. Use reversed form of the polynomial
2. Reflection must be TRUE

The standard CRC-32 fits this description, so lets start there and see what we get.

## CRC-32
**Settings:** `width=32`, `poly=0x04c11db7`, `init=0xffffffff`, `refin=true`, `refout=true`, `xorout=0xffffffff`, `check=0xcbf43926`
```js
    function CRC(data) {
        var POLY = 0xEDB88320;
        for(var crc = 0, i = 0, table = []; i < 256; i++) {
            crc = i;
            for(var j = 0; j < 8; j++) {
                crc = crc & 1 ? crc >>> 1 ^ POLY : crc >>> 1;
            }
            table[i] = crc >>> 0;
        }

        console.log(0x77073096, 0xee0e612c, 0x990951ba, table); 
    }
    CRC(); // table[1], table[2], table[3] should match 3 values.
```

It appears to be correct. But what if reflection is FALSE?
The BZIP2 variant of CRC-32 covers this situation. We will adapt the CRC-16/CCIITT-FALSE code for this case.

## CRC-32/BZIP2

**Settings:** `width=32`, `poly=0x04c11db7`, `init=0xffffffff`, `refin=false`, `refout=false`, `xorout=0xffffffff`, `check=0xfc891918`
```js
    function CRC(data) {
        var POLY = 0x04C11DB7;
        for(var crc = 0, i = 0, table = []; i < 256; i++) {
            crc = i << 16;
            for(var j = 0; j < 16; j++) {
                crc = crc & 0x80000000 ? crc << 1 ^ POLY : crc << 1;
            }
            table[i] = crc >>> 0;
        }

        console.log(0x04c11db7, 0x09823b6e, 0x0d4326d9, table); 
    }
    CRC(); // table[1], table[2], table[3] should match 3 values.
```

This correctly generates the lookup table for CRC-32/BZIP2. The code had to be modified, changing `i << 8` to `i << 16`, increase the inner `j` loop from 8 to 16, and increase the AND bit from `0x8000` to `0x80000000`. This was not the case for the normal CRC-32. 

I am not why I didn't have to increase the inner loop to 16 for the previous CRC-32 calculation. Hmm...

****

At this point, I should mention that `init` (also known as xor-in) and `xorout` seemingly have no effect on the lookup table, but do apply when calculating the CRC on actual data.

Let's complete the code for each algorithm and attempt to reproduce the `check` value (CRC of UTF-8/ASCII string `123456789`. 

## CRC-16/CCIITT-TRUE (KERMIT)

**Settings:** `init=0x0000`, `xorout=0x0000`, `check=0x2189`
```js
    var str = [49, 50, 51, 52, 53, 54, 55, 56, 57];
    function CRC(data) {
        var POLY = 0x8408;
        for(var crc = 0, i = 0, table = []; i < 256; i++) {
            crc = i;
            for(var j = 0; j < 8; j++) {
                crc = crc & 1 ? crc >>> 1 ^ POLY : crc >>> 1;
            }
            table[i] = crc & 0xFFFF;
        }
        
        for(var crc = 0, i = 0; i < data.length; i++) {
            crc = table[data[i] ^ crc & 0xFF] ^ crc >>> 8;
        }
        return (crc ^ 0) & 0xFFFF; 
    }
    console.log(0x2189, CRC(str));
```

It matches!  The `init` value should be placed where `var crc = 0` is in the second loop. And `xorout` should be a value XOR'd to the crc in the return statement.

## CRC-16/CCIITT-FALSE

**Settings:** `init=0xffff`, `xorout=0x0000 `, `check=0x29b1`
```js
    var str = [49, 50, 51, 52, 53, 54, 55, 56, 57];
    function CRC(data) {
        var POLY = 0x1021;
        for(var crc = 0, i = 0, table = []; i < 256; i++) {
            crc = i << 8;
            for(var j = 0; j < 8; j++) {
                crc = crc & 0x8000 ? crc << 1 ^ POLY : crc << 1;
            }
            table[i] = crc & 0xFFFF;
        }
        
        for(var crc = 0xFFFF, i = 0; i < data.length; i++) {
            crc = table[data[i] ^ (crc >>> 8) & 0xFF] ^ crc << 8;
        }
        return (crc ^ 0) & 0xFFFF; 
    }
    console.log(0x29b1, CRC(str));
```
*Uh oh*... It didn't work when using the same method as in KERMIT; simply inserting the `init` and `xorout` values. I had to reverse the `crc >>> 8` shift to `crc << 8`, and change `crc` to `crc >>> 8` within the table selector! So it seems that when reflection is FALSE, the logic is more complicated not only in the table generation code, but the crc calculation code as well.

Very well, moving on to CRC-32!

## CRC-32:

**Settings:** `init=0xffffffff`, `xorout=0xffffffff`, `check=0xcbf43926`
```js
    var str = [49, 50, 51, 52, 53, 54, 55, 56, 57];
    function CRC(data) {
        var POLY = 0xEDB88320;
        for(var crc = 0, i = 0, table = []; i < 256; i++) {
            crc = i;
            for(var j = 0; j < 8; j++) {
                crc = crc & 1 ? crc >>> 1 ^ POLY : crc >>> 1;
            }
            table[i] = crc >>> 0;
        }
        
        for(var crc = -1, i = 0; i < data.length; i++) {
            crc = table[data[i] ^ crc & 0xFF] ^ crc >>> 8;
        }
        return (crc ^ -1) >>> 0; 
    }
    console.log(0xcbf43926, CRC(str));
```
Great, works without a hitch. Notice that I used `-1` instead of `0xFFFFFFFF` where `init` and `xorout` should go. They's basically the same thing in JS.

Let's move on to CRC-32/BZIP2, where reflection is FALSE.

## CRC-32/BZIP2

**Settings:** `init=0xffffffff`, `xorout=0xffffffff`, `check=0xfc891918`
```js
    var str = [49, 50, 51, 52, 53, 54, 55, 56, 57];
    function CRC(data) {
        var POLY = 0x04C11DB7;
        for(var crc = 0, i = 0, table = []; i < 256; i++) {
            crc = i << 16;
            for(var j = 0; j < 16; j++) {
                crc = crc & 0x80000000 ? crc << 1 ^ POLY : crc << 1;
            }
            table[i] = crc >>> 0;
        }
        
        for(var crc = -1, i = 0; i < data.length; i++) {
            crc = table[data[i] ^ (crc >>> 24) & 0xFF] ^ crc << 8;
        }
        return (crc ^ -1) >>> 0; 
    }
    console.log(0xfc891918, CRC(str));
```

Hmm, was not expecting this. So it didn't work out-of-the-box. I had to change `crc >>> 8` to `crc >>> 24`. I have no idea why it must be 24, but it appears to be correct now. I need to find a way to streamline the code for when reflection is FALSE.

****

Now that we have gained the knowledge from doing the above algorithms, we can do the same for CRC-8 and CRC-4 using tools **reveng** and **pycrc**.

## CRC-4/ITU

**Settings:** `width=4`, `poly=0x3`, `init=0x0`, `refin=true`, `refout=true`, `xorout=0x0`, `check=0x7`
```js
    var str = [49, 50, 51, 52, 53, 54, 55, 56, 57];
    function CRC(data) {
        var POLY = 0xC;
        for(var crc = 0, i = 0, table = []; i < 256; i++) {
            crc = i;
            for(var j = 0; j < 8; j++) {
                crc = crc & 1 ? crc >>> 1 ^ POLY : crc >>> 1;
            }
            table[i] = crc & 0xF;
        }
        
        for(var crc = 0, i = 0; i < data.length; i++) {
            crc = table[data[i] ^ crc & 0xFF] ^ crc >>> 8;
        }
        return (crc ^ 0) & 0xF; 
    }
    console.log(0x7, CRC(str));
```

Yess! Correct on first try, thanks to being a reflected algorithm. Moving on to CRC-8, which is not.

## CRC-8/ITU

**Settings:** `width=8`, `poly=0x07`, `init=0x00`, `refin=false`, `refout=false`, `xorout=0x55`, `check=0xa1`
```js
    var str = [49, 50, 51, 52, 53, 54, 55, 56, 57];
    function CRC(data) {
        var POLY = 0x7;
        for(var crc = 0, i = 0, table = []; i < 256; i++) {
            crc = i;
            for(var j = 0; j < 8; j++) {
                crc = crc & 0x80 ? crc << 1 ^ POLY : crc << 1;
            }
            table[i] = crc & 0xFF;
        }
        
        for(var crc = 0, i = 0; i < data.length; i++) {
            crc = table[data[i] ^ crc & 0xFF] ^ crc << 8;
        }
        return (crc ^ 0x55) & 0xFF; 
    }
    console.log(0xa1, CRC(str));
```

Saying it again: whenever reflection is FALSE in the algo, the code requires more sophistication. In the case of CRC-8, we had to change `crc = i << 8;` to `crc = i;` in the table generation code. We also had to change `(crc >>> 8)` to just `crc` in the CRC calculation code. This might imply that when the CRC size is 8 bits, shifting is not as important.

****

That concludes the research into *table-driven CRC calculations*. It's pretty cool that unlike many  CRC snippets online that use a hard-coded table of values, all of the above implementation correctly generate the table from scratch!

However, table-driven implementations are only important for speed, but aren't strictly required. We can directly compute the CRC of input using the polynomial without having to refer to a lookup table. It combines the computations used in both the table generation and the CRC calculation itself. So having already understood how to properly do both in the above algorithms, we should be able to produce tableless CRC implementations for all of the above.

Let's start with a hard one:

## CRC-32/BZIP2
```js
    var str = [49, 50, 51, 52, 53, 54, 55, 56, 57];
    function CRC(data) {
        var POLY = 0x04C11DB7;
        for(var crc = -1, i = 0; i < data.length; i++) {
            crc = crc ^ (data[i] << 24);
            for(var j = 0; j < 8; j++) {
                crc = crc & 0x80000000 ? crc << 1 ^ POLY : crc << 1;
            }
        }
        return (crc ^ -1) >>> 0; 
    }
    console.log(0xfc891918, CRC(str)); // check value should match
```

It was more complicated than I originally thought, but not too bad. The line `crc = crc ^ (data[i] << 24)` is supposed to correspond to `crc = table[data[i] ^ (crc >>> 24) & 0xFF] ^ (crc << 8)`. 

Looking back after having finished the all the others below, it seems that  many elements can be stripped from the table-lookup version. You don't need the `(crc << 8)`, or the `& 0xFF`.  However, *you do* have to keep the `>>> 24` term and reverse it on the actual input data, it seems.

## CRC-32
```js
    var str = [49, 50, 51, 52, 53, 54, 55, 56, 57];
    function CRC(data) {
        var POLY = 0xEDB88320;
        for(var crc = -1, i = 0; i < data.length; i++) {
            crc = crc ^ (data[i]);
            for(var j = 0; j < 8; j++) {
                crc = crc & 1 ? crc >>> 1 ^ POLY : crc >>> 1;
            }
        }
        return (crc ^ -1) >>> 0; 
    }
    console.log(0xcbf43926, CRC(str)); // check value should match
```

Standard CRC-32 is simpler in this case, and we've got more clues. `crc = crc ^ (data[i]);` here refers to `crc = table[data[i] ^ crc & 0xFF] ^ crc >>> 8;`.

This means that the `>>> 24` is translating to `<< 24` in CRC-32/BZIP2, because in this case, there is no shift in that line. So from how I understand it, the rule is *"take the crc, XOR it with the byte, then shift the input data in the reverse direction by the same amount"*.

## CRC-16/CCIITT-FALSE
```js
    var str = [49, 50, 51, 52, 53, 54, 55, 56, 57];
    function CRC(data) {
        var POLY = 0x1021;
        for(var crc = 0xFFFF, i = 0; i < data.length; i++) {
            crc = crc ^ (data[i] << 8);
            for(var j = 0; j < 8; j++) {
                crc = crc & 0x8000 ? crc << 1 ^ POLY : crc << 1;
            }
        }
        return (crc ^ 0) & 0xFFFF; 
    }
    console.log(0x29b1, CRC(str)); // check value should match
```

Beau. Worked first try after inputting the expected _"parameters"_. Also tested on a bunch of arbitrary strings and they all matched. 


## CRC-16/CCIITT-TRUE (KERMIT)
```js
    var str = [49, 50, 51, 52, 53, 54, 55, 56, 57];
    function CRC(data) {
        var POLY = 0x8408;
        for(var crc = 0, i = 0; i < data.length; i++) {
            crc = crc ^ data[i];
            for(var j = 0; j < 8; j++) {
                crc = crc & 1 ? crc >>> 1 ^ POLY : crc >>> 1;
            }
        }
        return (crc ^ 0) & 0xFFFF; 
    }
    console.log(0x2189, CRC(str)); // check value should match
```

First try again, this is getting too easy. The reflected algorithms are definitely easier to implement. 

## CRC-8/ITU
```js
    var str = [49, 50, 51, 52, 53, 54, 55, 56, 57];
    function CRC(data) {
        var POLY = 0x7;
        for(var crc = 0, i = 0; i < data.length; i++) {
            crc = crc ^ data[i];
            for(var j = 0; j < 8; j++) {
                crc = crc & 0x80 ? crc << 1 ^ POLY : crc << 1;
            }
        }
        return (crc ^ 0x55) & 0xFF; 
    }
    console.log(0xa1, CRC(str)); // check value should match
```

Smooth sailing again. Last but not least is CRC-4.

## CRC-4/ITU
```js
    var str = [49, 50, 51, 52, 53, 54, 55, 56, 57];
    function CRC(data) {
        var POLY = 0xC;
        for(var crc = 0, i = 0; i < data.length; i++) {
            crc = crc ^ data[i];
            for(var j = 0; j < 8; j++) {
                crc = crc & 1 ? crc >>> 1 ^ POLY : crc >>> 1;
            }
        }
        return (crc ^ 0) & 0xF; 
    }
    console.log(0x7, CRC(str)); // check value should match
```
    
And finally, the CRC-4 works just fine as well. It's strangely similar to the CRC-16/KERMIT algo, with the only difference being the polynomial and final AND mask.

That concludes my foray into CRC's for now, and clears up much of the fog I had on the subject.

## A note on performance

CRC's are damn slow. At least when I compared my two CRC-32 algorithms to other hashing algorithms. It remains to be seen if these can be optimized, but if used only as a message digest, a more faster hashing algorithm may be preferred.

## A note on pycrc

pycrc can generate C code:

`python pycrc.py --model crc-16 --algorithm table-driven --generate c -o crc.c`

`python pycrc.py --width=16 --poly=0x8005 --xor-in=0x0000 --reflect-in=True --reflect-out=True --xor-out=0x0000 --algorithm=table-driven --generate c -o crc.c`

I used this to check against strings:

`python pycrc.py --width=16 --poly=0x1021 --xor-in=0xffff --reflect-in=False --reflect-out=False --xor-out=0x0000 --algorithm=table-driven --check-string 123456789`
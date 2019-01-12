/*
    Marvin32
    ---------------
    Marvin32 implemented by bryc (github.com/bryc)
    
    Source:
    https://github.com/dotnet/coreclr/blob/master/src/System.Private.CoreLib/shared/System/Marvin.cs

    It's derived from .NET Framework 4.5 and is patented here:
    https://patents.google.com/patent/US20130262421
*/

function Marvin32(key, seed = 0, seed2 = 0) {
    var k, h1 = seed, h2 = seed2;

    for(var i = 0, b = key.length & -4; i < b; i += 4) {
        k = key[i+3] << 24 | key[i+2] << 16 | key[i+1] << 8 | key[i];
        h1 = h1 + k; h2 = h2 ^ h1;
        h1 = h1 << 20 | h1 >>> 12; h1 = h1 + h2;
        h2 = h2 << 9  | h2 >>> 23; h2 = h2 ^ h1;
        h1 = h1 << 27 | h1 >>> 5 ; h1 = h1 + h2;
        h2 = h2 << 19 | h2 >>> 13;
    }

    k = 128;
    switch (key.length & 3) {
        case 3: k = k << 8 | key[i+2];
        case 2: k = k << 8 | key[i+1];
        case 1: k = k << 8 | key[i];
    }

    h1 = h1 + k; h2 = h2 ^ h1;
    h1 = h1 << 20 | h1 >>> 12; h1 = h1 + h2;
    h2 = h2 << 9  | h2 >>> 23; h2 = h2 ^ h1;
    h1 = h1 << 27 | h1 >>> 5 ; h1 = h1 + h2;
    h2 = h2 << 19 | h2 >>> 13;

    h2 = h2 ^ h1;
    h1 = h1 << 20 | h1 >>> 12; h1 = h1 + h2;
    h2 = h2 << 9  | h2 >>> 23; h2 = h2 ^ h1;
    h1 = h1 << 27 | h1 >>> 5 ; h1 = h1 + h2;
    h2 = h2 << 19 | h2 >>> 13;

    return (h1 ^ h2) >>> 0;
}

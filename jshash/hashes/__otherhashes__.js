/* 
    Other hash implementations (bryc)
    -----------------------------------
    This is a compilation of more functions I implemented. Mostly simpler ones.

    Most of these are not good as general non-cryptographic hashes and probably
    designed for specialized input (e.g. short strings). I will be evaluating
    them for their suitability in general non-cryptographic purposes.

    Right off the bat, Jenkin's OAAT hash is quite good. It's distribution
    is even better than the original FNV1 and FNV1a it seems.
    Sadly it's one of the few here that pass my basic collision tests.

    Bret Mulvey's SBoxHash is also interesting and has good distrubtion.
    However it fails my rolling bit collision test and only reads one byte at a time.
    I don't see a quick solution to fix this flaw.
    Also, its speed doesn't seem that good in JS, but I could test that further.
    ----
    These passed 3 of 4 my simple collision tests, worth investigating:
    DJB2, SDBM, *JSHash, RSHash, *DEKHash, BKDRHash, *GPHash, hashCode

    These passed 3 of 4 of my simple distribution tests, worth investigating:
    *JSHash, *DEKHash, *GPHash

    These performed horribly in general and should be avoided:
    Adler-32, Fletcher-32, BPHash, APHash, ELFHash, PJWHash
    However, ELF/PJW might have some redeemable factors

*/

// Jenkins OneAtATime Hash - very decent, but slower than FNV in JS(?)
// Original function had initial value of 0, but this is bad and causes
// collisions when processing null bytes.

function OAATHash(data) {
    var hash = 1;
    for(var i = 0; i < data.length; i++) {
        hash += data[i];
        hash += hash << 10;
        hash ^= hash >>> 6;
    }
    hash += hash << 3;
    hash ^= hash >>> 11;
    hash += hash << 15;
    return hash >>> 0;
}

// Bret Mulvey's SBox hash. Unique approach.
// Table should be declared once.
// investigate: https://github.com/tildeleb/hashland/blob/master/sbox/sbox.go
// https://github.com/tildeleb/hashland/blob/master/mahash/mahash8v64.go
var sbox = [
    0xF53E1837, 0x5F14C86B, 0x9EE3964C, 0xFA796D53,
    0x32223FC3, 0x4D82BC98, 0xA0C7FA62, 0x63E2C982,
    0x24994A5B, 0x1ECE7BEE, 0x292B38EF, 0xD5CD4E56,
    0x514F4303, 0x7BE12B83, 0x7192F195, 0x82DC7300,
    0x084380B4, 0x480B55D3, 0x5F430471, 0x13F75991,
    0x3F9CF22C, 0x2FE0907A, 0xFD8E1E69, 0x7B1D5DE8,
    0xD575A85C, 0xAD01C50A, 0x7EE00737, 0x3CE981E8,
    0x0E447EFA, 0x23089DD6, 0xB59F149F, 0x13600EC7,
    0xE802C8E6, 0x670921E4, 0x7207EFF0, 0xE74761B0,
    0x69035234, 0xBFA40F19, 0xF63651A0, 0x29E64C26,
    0x1F98CCA7, 0xD957007E, 0xE71DDC75, 0x3E729595,
    0x7580B7CC, 0xD7FAF60B, 0x92484323, 0xA44113EB,
    0xE4CBDE08, 0x346827C9, 0x3CF32AFA, 0x0B29BCF1,
    0x6E29F7DF, 0xB01E71CB, 0x3BFBC0D1, 0x62EDC5B8,
    0xB7DE789A, 0xA4748EC9, 0xE17A4C4F, 0x67E5BD03,
    0xF3B33D1A, 0x97D8D3E9, 0x09121BC0, 0x347B2D2C,
    0x79A1913C, 0x504172DE, 0x7F1F8483, 0x13AC3CF6,
    0x7A2094DB, 0xC778FA12, 0xADF7469F, 0x21786B7B,
    0x71A445D0, 0xA8896C1B, 0x656F62FB, 0x83A059B3,
    0x972DFE6E, 0x4122000C, 0x97D9DA19, 0x17D5947B,
    0xB1AFFD0C, 0x6EF83B97, 0xAF7F780B, 0x4613138A,
    0x7C3E73A6, 0xCF15E03D, 0x41576322, 0x672DF292,
    0xB658588D, 0x33EBEFA9, 0x938CBF06, 0x06B67381,
    0x07F192C6, 0x2BDA5855, 0x348EE0E8, 0x19DBB6E3,
    0x3222184B, 0xB69D5DBA, 0x7E760B88, 0xAF4D8154,
    0x007A51AD, 0x35112500, 0xC9CD2D7D, 0x4F4FB761,
    0x694772E3, 0x694C8351, 0x4A7E3AF5, 0x67D65CE1,
    0x9287DE92, 0x2518DB3C, 0x8CB4EC06, 0xD154D38F,
    0xE19A26BB, 0x295EE439, 0xC50A1104, 0x2153C6A7,
    0x82366656, 0x0713BC2F, 0x6462215A, 0x21D9BFCE,
    0xBA8EACE6, 0xAE2DF4C1, 0x2A8D5E80, 0x3F7E52D1,
    0x29359399, 0xFEA1D19C, 0x18879313, 0x455AFA81,
    0xFADFE838, 0x62609838, 0xD1028839, 0x0736E92F,
    0x3BCA22A3, 0x1485B08A, 0x2DA7900B, 0x852C156D,
    0xE8F24803, 0x00078472, 0x13F0D332, 0x2ACFD0CF,
    0x5F747F5C, 0x87BB1E2F, 0xA7EFCB63, 0x23F432F0,
    0xE6CE7C5C, 0x1F954EF6, 0xB609C91B, 0x3B4571BF,
    0xEED17DC0, 0xE556CDA0, 0xA7846A8D, 0xFF105F94,
    0x52B7CCDE, 0x0E33E801, 0x664455EA, 0xF2C70414,
    0x73E7B486, 0x8F830661, 0x8B59E826, 0xBB8AEDCA,
    0xF3D70AB9, 0xD739F2B9, 0x4A04C34A, 0x88D0F089,
    0xE02191A2, 0xD89D9C78, 0x192C2749, 0xFC43A78F,
    0x0AAC88CB, 0x9438D42D, 0x9E280F7A, 0x36063802,
    0x38E8D018, 0x1C42A9CB, 0x92AAFF6C, 0xA24820C5,
    0x007F077F, 0xCE5BC543, 0x69668D58, 0x10D6FF74,
    0xBE00F621, 0x21300BBE, 0x2E9E8F46, 0x5ACEA629,
    0xFA1F86C7, 0x52F206B8, 0x3EDF1A75, 0x6DA8D843,
    0xCF719928, 0x73E3891F, 0xB4B95DD6, 0xB2A42D27,
    0xEDA20BBF, 0x1A58DBDF, 0xA449AD03, 0x6DDEF22B,
    0x900531E6, 0x3D3BFF35, 0x5B24ABA2, 0x472B3E4C,
    0x387F2D75, 0x4D8DBA36, 0x71CB5641, 0xE3473F3F,
    0xF6CD4B7F, 0xBF7D1428, 0x344B64D0, 0xC5CDFCB6,
    0xFE2E0182, 0x2C37A673, 0xDE4EB7A3, 0x63FDC933,
    0x01DC4063, 0x611F3571, 0xD167BFAF, 0x4496596F,
    0x3DEE0689, 0xD8704910, 0x7052A114, 0x068C9EC5,
    0x75D0E766, 0x4D54CC20, 0xB44ECDE2, 0x4ABC653E,
    0x2C550A21, 0x1A52C0DB, 0xCFED03D0, 0x119BAFE2,
    0x876A6133, 0xBC232088, 0x435BA1B2, 0xAE99BBFA,
    0xBB4F08E4, 0xA62B5F49, 0x1DA4B695, 0x336B84DE,
    0xDC813D31, 0x00C134FB, 0x397A98E6, 0x151F0E64,
    0xD9EB3E69, 0xD3C7DF60, 0xD2F2C336, 0x2DDD067B,
    0xBD122835, 0xB0B3BD3A, 0xB0D54E46, 0x8641F1E4,
    0xA0B38F96, 0x51D39199, 0x37A6AD75, 0xDF84EE41,
    0x3C034CBA, 0xACDA62FC, 0x11923B8B, 0x45EF170A,
];
function SBoxHash(key) {
    var hash = 0;
    for(var i = 0; i < key.length; i++) {
        hash = Math.imul(hash ^ sbox[key[i]], 3);
    }
    return hash >>> 0;
}

// GPHash - Hash found by G_enetic P_rogramming.
// This was described in a 2006 article:
// "Finding State-of-the-Art Non-cryptographic Hashes with Genetic Programming"
// Doesn't seem very state-of-the-art, since it fails a basic collision test.
// Might be implementing it wrong, its 4 lines of pseudocode is a bit wonky.
// Note: There are a number of other "GP" hashes in other articles. They actually
// seem worse than this one. One seems to be a 16-bit hash which is a bad choice by default.

function GPHash(key) {
    var m = 1828025797; 
    var h = 0;
    for(var i = 0, b = key.length & -4; i < b; i += 4) {
        h += key[i+3] << 24 | key[i+2] << 16 | key[i+1] << 8 | key[i];
        h = Math.imul(h, m);
        h = h << 14 | h >>> 18;
    }
    switch(key.length & 3) {
        case 3: h += key[i+2] << 16;
        case 2: h += key[i+1] << 8;
        case 1: h += key[i];
            h = Math.imul(h, m);
            h = h << 14 | h >>> 18;
    }
    h = Math.imul(h, m);
    return h >>> 0;
}

// JSHash -  Justin Sobel's bitwise hash
// >> or >>>?

function JSHash(data) {
    var hash = 0x4e67c6a7;
    for(var i = 0; i < data.length; i++) {
        hash ^= (hash << 5) + data[i] + (hash >> 2);
    }
    return hash;
}

// DEKHash - from 1973. Donald E. Knuth's book The Art Of Computer Programming Volume 3
// >> or >>>?

function DEKHash(data) {
    var hash = data.length;
    for(var i = 0; i < data.length; i++) {
        hash = ((hash << 5) ^ (hash >> 27)) ^ data[i];
    }
    return hash;
}

// Java's hashCode() - 31*hash = (hash<<5)-hash

function hashCode(data) {
    var hash = 0;
    for(var i = 0; i < data.length; i++) {
        hash = Math.imul(31, hash) + data[i] | 0; 
    }
    return h;
}

// Google Analytics URL domain name hash. Not that good. Still gotta clean it up though.
// >> or >>>?

function GAHash(key) {
        var b = 1;
        for (var c, char, b = 0, i = key.length - 1; 0 <= i; i--) {
            char = key[i];
            b = (b << 6 & 268435455) + char + (char << 14);
            c = b & 266338304; b = c != 0 ? b ^ c >> 21 : b;
        }
    return b;
}

// .NET GetHashCode() - original UTF-16 construction. Seems to rip off constants from DJB2 and MT19937.
// Note: This hash specifically uses signed numbers, so leave shifts as is.

function GetHashCode(key) {
    var hash1 = (5381 << 16) + 5381, hash2 = hash1;
    for(var i = 0; i < key.length; i += 4) {
        hash1 = (hash1 << 5) + hash1 + (hash1 >> 27) ^ (key[i+1] << 16 | key[i]);
        if(i > key.length-3) break;
        hash2 = (hash2 << 5) + hash2 + (hash2 >> 27) ^ (key[i+3] << 16 | key[i+2]);
    }
    return hash1 + Math.imul(hash2, 1566083941) | 0;
}

// .NET GetHashCode() - A more sane version reading two bytes at a time.

function GetHashCodeB(key) {
    var hash1 = (5381 << 16) + 5381, hash2 = hash1;
    for(var i = 0; i < key.length; i += 2) {
        hash1 = (hash1 << 5) + hash1 + (hash1 >> 27) ^ key[i];
        if(i === key.length-1) break;
        hash2 = (hash2 << 5) + hash2 + (hash2 >> 27) ^ key[i+1];
    }
    return hash1 + Math.imul(hash2, 1566083941) | 0;
}

// DJB2 - not sure which is which, but this was one of the DJB hashes?

function DJB2(data) {
    var hash = 5381;
    for(var i = 0; i < data.length; i++) {
        hash += (hash << 5) + data[i];
    }
    return hash;
}

// DJB2a - not sure which is which, but this was one of the DJB hashes?

function DJB2a(data) {
    var hash = 5381;
    for(var i = 0; i < data.length; i++) {
        hash = Math.imul(33, hash + data[i]);
    }
    return hash;
}

// BKDRHash : Brian Kernighan and Dennis Ritchie
// From 1988 2nd edition of K&R C Programming Language

function BKDRHash(data) {
    var hash = 0, seed = 131; // 31, 131, 1313 etc.
    for(var i = 0; i < data.length; i++) {
        hash = Math.imul(hash, seed) + data[i];
    }
    return hash;
}

// RSHash - Robert Sedgewick hash, 1990 book "Algorithms in C"

function RSHash(data) {
    var a = 63689, b = 378551, hash = 0;
    for(var i = 0; i < data.length; i++) {
        hash = Math.imul(hash, a) + data[i];
        a = Math.imul(a, b);
    }
    return hash >>> 0;
}

// SDBM Hash

function SDBM(data) {
    var hash = 0;
    for(var i = 0; i < data.length; i++) {
        hash = data[i] + (hash << 6) + (hash << 16) - hash;
    }
    return hash;
}

// SQLite3 Hash (is this even part of SQLite3?)

function SQLite3(data) {
    var hash = 0;
    for(var i = 0; i < data.length; i++) {
        hash = (hash << 3) ^ hash ^ data[i];
    }
    return hash;
}

// PJW Hash - Peter J. Weinberger hash.

function PJWHash(data) {
    var BitsInUnsignedInt = 32;
    var ThreeQuarters = (BitsInUnsignedInt*3)/4;
    var OneEighth = BitsInUnsignedInt/8;
    var HighBits = 0xFFFFFFFF << (BitsInUnsignedInt - OneEighth);
    var hash = 0;
    var test = 0;
    var i = 0;

    for(var i = 0; i < data.length; i++) {
        hash = (hash << OneEighth) + data[i];
        if((test = hash & HighBits) !== 0) {
            hash = ((hash ^ (test >>> ThreeQuarters)) & (~HighBits));
        }
    }
    return hash;
}

// ELF Hash (linux) - somehow related to PJW Hash
// Is this ELF-32?

function ELF(data) {
    var hash = 0, x = 0;
    for(var i = 0; i < data.length; i++) {
        hash = (hash << 4) + data[i];
        if((x = hash & 0xF0000000) != 0) {
            hash ^= x >> 24;
            hash &= ~x;
        }
    }
    return hash;
}

// APHash - Arash Partow hash

function APHash(data) {
    var hash = 0xAAAAAAAA;
    for(var i = 0; i < data.length; i++) {
        if((i & 1) === 0) {
            hash ^= (hash << 7) ^ Math.imul(data[i],hash >> 3);
        } else {
            hash ^= (~((hash << 11) + str[i] ^ (hash >> 5)));
        }
    }
    return hash;
}

// BPHash - Bruno R. Preiss string hashing function.
// Book: Data Structures and Algorithms with Object-Oriented Design Patterns in Java (2000)

function BPHash(data) {
    var hash = 0;
    for(var i = 0; i < data.length; i++) {
        hash = (hash << 7) ^ data[i];
    }
    return hash;
}

// Adler-32 - Mark Adler's checksum function

function Adler32(data) {
    var a = 1, b = 0;
    for (var i = 0; i < data.length; i++)  {
        a = (a + data[i]) % 65521;
        b = (b + a) % 65521;
    }
    return a | (b << 16);
}

// Fletcher-32 - Checksum function

function Fletcher32(data) {
    var _sum1 = 0xffff, _sum2 = 0xffff;
    var words = data.length;
    var dataIndex = 0;
    while (words) {
        var tlen = words > 359 ? 359 : words;
        words -= tlen;
        do {
            _sum2 += _sum1 += data[dataIndex++];
        } while (--tlen);
        _sum1 = ((_sum1 & 0xffff) >>> 0) + (_sum1 >>> 16);
        _sum2 = ((_sum2 & 0xffff) >>> 0) + (_sum2 >>> 16);
    }
    _sum1 = ((_sum1 & 0xffff) >>> 0) + (_sum1 >>> 16);
    _sum2 = ((_sum2 & 0xffff) >>> 0) + (_sum2 >>> 16);
    return ((_sum2 << 16) >>> 0 | _sum1) >>> 0;
}

// Fletcher-16A (?) - Checksum function

function Fletcher16a(buf) {
    var sum1 = 0xff, sum2 = 0xff;
    var i = 0;
    var len = buf.length;

    while (len) {
        var tlen = len > 20 ? 20 : len;
        len -= tlen;
        do {
            sum2 += sum1 += buf[i++];
        } while (--tlen);
        sum1 = (sum1 & 0xff) + (sum1 >> 8);
        sum2 = (sum2 & 0xff) + (sum2 >> 8);
    }
    sum1 = (sum1 & 0xff) + (sum1 >> 8);
    sum2 = (sum2 & 0xff) + (sum2 >> 8);
    return sum2 << 8 | sum1;
}

// Fletcher-16 (?) - Checksum function

function Fletcher16(data) {
  var a = 0, b = 0;
  for (var i = 0; i < data.length; i++) {
    a = (a + data[i]) % 255;
    b = (b + a) % 255;
  }

  return a | (b << 8);
}

// BSD-16 - A 16-bit checksum code related to BSD.

function BSD16(data) {
    for(var i = 0, c = 0; i < data.length; i++) {
        c = (c>>1) + ((c&1) << 15);
        c += data[i];
        c &= 0xffff;
    }
    return c;
}

// IPv4 checksum - simple checksum using one's complement addition, described in Internet Protocol document.

function IPv4(data) {
    for(var sum = 0, i = 0; i < data.length; i += 2)
    {
        var digit = data[i+1] !== undefined ? (data[i] << 8) + data[i + 1] : data[i];
        sum = (sum + digit);
    }
    return (~sum) >>> 0;
}

// Sum - simple additve checksum - only here for comparative purposes. In-depth checksum codes are best studied in C.

function Sum(data) {
    var sum = 0;
    for(var i = 0; i < data.length; i++) {
        sum += data[i]; // for xor: sum ^= data[i];
    }
    return sum;
}

# Hash function implementations in JavaScript

I've ported a bunch of hash functions to JS. This is a showcase of some of the better functions that play nicely in JavaScript. Performance is the main consideration here.

Also see: [CRC functions](CRC.md)

|       Algorithm      |   Bit_width |      Speed     |    Notes   |
|----------------------|---------|-----------------|---------------------------------------------------------------------------------|
| [MurmurHash1](murmurhash1.js) | 32-bit  | 999,999 ops/sec |  |
| [MurmurHash2_x86_32](murmurhash2.js) | 32-bit  |                 |  |
| [MurmurHash2_x86_32_A](murmurhash2a.js) | 32-bit  |                 | Fixes a flaw in MurmurHash2. Uses Merkle–Damgård construction. |
| [MurmurHash2_x86_64](murmurhash2_64b.js) | 64-bit  |                 | Produces two correlated 32-bit hashes. Contains a flaw - alternate version. |
| ~~MurmurHash2_x64_64~~ | 64-bit  |                 | Requires slow 64-bit arithmetic |
| [MurmurHash2_160](murmurhash2_160.js) | 160-bit |                 | Unofficial modification that outputs five 32-bit hash states |
| [MurmurHash3_x86_32](murmurhash3.js) | 32-bit  |                 |  |
| [MurmurHash3_x86_128](murmurhash3_x86_128.js) | 128-bit |                 | Contains a possible flaw - alternate version. |
| ~~MurmurHash3_x64_128~~  | 128-bit |                 | Requires slow 64-bit arithmetic |
| [xxHash_x86_32](xxhash_32.js) | 32-bit  |                 |   |
| ~~xxHash_x64_64~~ | 64-bit  |                 | Requires slow 64-bit arithmetic |
| [Lookup3_x86](lookup3.js) | 32/64-bit  |                 | 32/64-bit. 96 is possible but with worse statistics. |
| [Lookup2_x86](lookup2.js) | 32-bit  |                 | (_Obsolete_) 32-bit. 64/96 is possible but with worse statistics. |
| [FNV_x86](FNV.js) | 32-bit  |                 | FNV-0, FNV-1, FNV-1a, FNV-1a_BM |

# Other functions
1. [CRC32C](http://www.evanjones.ca/crc32c.html) - [faster](https://stackoverflow.com/questions/17645167/implementing-sse-4-2s-crc32c-in-software/17646775) CRC32? 8 bytes at a time
1. [lookup2.c](http://burtleburtle.net/bob/c/lookup2.c) - I have a JS version but it's slow, would be nice to see if it can be fixed.
2. [t1ha](https://github.com/leo-yuriev/t1ha) - supposedly super fast, and has 32-bit modes, but seems a bit weird to port.
3. SpookyHash - 128bit hash. low priority, but already have some JS code to study. Spooky32?
4. SipHash - 64bit hash, supposedly fast (doesn't seem that way). low priority. Have code to study it. There is a halfsiphash version (32-bit?) - its a MAC algorithm.
5. SlashHash - 64bit, supposedly fast. low priority, but have code.
6. [BeagleHash](https://github.com/demerphq/BeagleHash) - 64-bit but has some 32-bit stuff, might have potential.
7. Johannes Baagøe's Mash function - see what the big deal is.
8. CityHash32, part of CityHash might be worth seeing. What about FarmHash32? HighwayHash?
9. SuperFastHash - never messed with it.
10. [SeaHash](https://github.com/jroivas/seahash) - forgot about this one, got buried.
11. [FNVPlus](https://github.com/tjwebb/fnv-plus) - enhanced JS version worth looking into. 

# Benchmarks

1. https://jsbench.me/fyjfja4xih/1 - MurmurHash3 benchmarks
2. https://jsbench.me/2hjfj9oscd/1 - xxHash benchmarks
3. https://jsbench.me/isjfj2rpkx/1 - comparison of available implementations
4. https://jsbench.me/tgjfegz4er/1 - the guds
5. https://jsbench.me/zrjfehfwgu/1 - the not-so-guds

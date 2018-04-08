# Hash function implementations in JavaScript

I've ported a bunch of hash functons to JS. These are all highly optimized for speed, and make use of ES6 features like `Math.imul` and default parameters. Sadly, only algorithms made for 32-bit architectures get good performance in JS. Emulating 64-bit math can decrease performance by 80-90%.

Also see: [CRC functions](CRC.md)

## 32-bit
| Algorithm | Hash size | Speed | Notes |
| --------- | --------- | ----- | ----- |
| [FNV](FNV.js) | 32-bit  | | variants: FNV-0, FNV-1, FNV-1a, FNV-1a_BM |
| [MurmurHash1](murmurhash1.js) | 32-bit | | Original version. |
| [MurmurHash2](murmurhash2.js) | 32-bit | | aka `MurmurHash2_x86_32` |
| [MurmurHash2A](murmurhash2a.js) | 32-bit | | Fixes a flaw in MurmurHash2. Uses Merkle–Damgård construction. |
| [MurmurHash3](murmurhash3.js) | 32-bit | | aka `MurmurHash3_x86_32` |
| [xxHash](xxhash_32.js) | 32-bit | | |

## 64-bit or higher

| Algorithm | Hash size | Speed | Notes |
| --------- | --------- | ----- | ----- |
| [Lookup2_x86](lookup2.js) | 32-bit | | (_Obsolete_) 32-bit. 64/96-bit is _possible_ but with worse statistics. |
| [Lookup3_x86](lookup3.js) | 32/64-bit | | 32/64-bit. 96 is _possible_ but with worse statistics. |
| [MurmurHash2_x86_64](murmurhash2_64b.js) | 64-bit | | Produces two _correlated_ 32-bit hashes (has a flaw), see comments. |
| [MurmurHash3_x86_128](murmurhash3_128.js) | 128-bit | | Modified version. Contains a possible flaw, see comments. |
| [MurmurHash2_160](murmurhash2_160.js) | 160-bit | | Unofficial modification that outputs five 32-bit hash states. |

## Emulated 64-bit hash functions

_I will put ports of 64-bit arithmetic hash functions here, but expect them to be extremely slow._

****

# Notes/TODO
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

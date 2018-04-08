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
_If WebAssembly becomes viable that can be useful for 64-bit hash functions._

****

# Notes/TODO
* SuperFastHash - never messed with it.
* Employ ideas from BulatZZH to improve XXH32.
* Johannes Baagøe's Mash function - see what the big deal is.
* [FNVPlus](https://github.com/tjwebb/fnv-plus) - enhanced JS version worth looking into. 
* [CRC32C](http://www.evanjones.ca/crc32c.html) - [faster](https://stackoverflow.com/questions/17645167/implementing-sse-4-2s-crc32c-in-software/17646775) CRC32? 8 bytes at a time
* **U64** [t1ha](https://github.com/leo-yuriev/t1ha) - supposedly super fast, but seems most is for 64-bit arch.
* **U64** [BeagleHash](https://github.com/demerphq/BeagleHash) - 64-bit but has some 32-bit stuff, might have potential.
* **U64** CityHash, FarmHash, HighwayHash - Google's functions. CityHash32 might be the only viable option.
* **U64** SipHash - security-focused 64-bit MAC hash. Some say its fast, some say its slow. Only _[halfsiphash.c](https://github.com/veorq/SipHash/blob/master/halfsiphash.c)_ is viable in JS.
*  **U64** [SeaHash](https://github.com/jroivas/seahash) - forgot about this one - 64-bit arch only.
* **U64** SlashHash - 64bit, supposedly fast but only 64-bit arch.
* **U64** SpookyHash - 128bit hash, fast but 64-bit arch only.

# Misc benchmarks
*  https://jsbench.me/fyjfja4xih/1 - MurmurHash3 benchmarks
*  https://jsbench.me/2hjfj9oscd/1 - xxHash benchmarks
*  https://jsbench.me/isjfj2rpkx/1 - comparison of available implementations
*  https://jsbench.me/tgjfegz4er/1 - the guds
*  https://jsbench.me/zrjfehfwgu/1 - the not-so-guds

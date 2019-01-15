# Hash function implementations in JavaScript

I've ported a bunch of hash functons to JS. These are all highly optimized for speed, and make use of ES6 features like `Math.imul` and default parameters. Sadly, only algorithms made for 32-bit architectures get good performance in JS. Emulating 64-bit math can decrease performance by 80-90%.

Also see: [CRC functions](CRC.md)

## 32-bit
| Algorithm | Hash size | Speed | Notes |
| --------- | --------- | ----- | ----- |
| [FNV](FNV.js) | 32-bit  | 3041/2649  | variants: FNV-0, FNV-1, FNV-1a, FNV-1a_BM |
| [MurmurHash1](murmurhash1.js) | 32-bit | **3296**/2822 | Original version. Super fast. |
| [MurmurHash2](murmurhash2.js) | 32-bit | 3027/2518 | aka `MurmurHash2_x86_32` |
| [MurmurHash2A](murmurhash2a.js) | 32-bit | 3053/2484 | Fixes a flaw in MurmurHash2. Uses Merkle–Damgård construction. |
| [MurmurHash3](murmurhash3.js) | 32-bit | 3090/2515 | aka `MurmurHash3_x86_32` |
| [xxHash](xxhash_32.js) | 32-bit | 2968/2492 | not as fast as you'd think, but still good |
| CRC-32 | 32-bit | 147/575 | For speed reference (it's pretty slow) |
| [SuperFastHash](superfasthash.js) | 32-bit | -/- | Higher collision rates in some cases: 90 of 131072<br> (vs. Murmur3=0, Lookup2=2, Lookup3=3, xxHash=4) |
| [Marvin32](marvin32.js) | 32-bit | -/- | Obscure function, but seems decent. Almost as fast as MurmurHash3. |
| [CityHash32](cityhash32.js) | 32-bit | -/- | The only 32-bit variant in Google's City/Farm families. Not recommended, it's just a slower Murmur3 clone. |

## 64-bit or higher

| Algorithm | Hash size | Speed | Notes |
| --------- | --------- | ----- | ----- |
| [Lookup2_x86](lookup2.js) | 32-bit | 2412/1985 | (_Obsolete_) 32-bit. 64/96-bit is _possible_ but with worse statistics. |
| [Lookup3_x86](lookup3.js) | 32/64-bit | **2553**/1038 | 32 or 64-bit. 96 is _possible_ but with weaker statistics. |
| [MurmurHash2_x86_64](murmurhash2_64b.js) | 64-bit | 2759/2406 | Slightly modified to avoid a flaw in the original, see comments. |
| [MurmurHash3_x86_128](murmurhash3_128.js) | 128-bit | **2498**/2162 | Modified version. Contains a possible flaw, see comments. |
| [MurmurHash2_160](murmurhash2_160.js) | 160-bit | 1968/1590 | Unofficial mod that outputs five 32-bit hash states. |
| [HalfSipHash](halfsiphash.js) | 32/64-bit | -/- | 32-bit version of SipHash. Can output a 64-bit hash. Kind of slow. |
| CybBeta2 | 64-bit | 2853/2546 | Experimental 64-bit |
| CybBeta0 | 32-bit | **3311**/2891 | Experimental 32-bit |

## Performance notes

Legend (for *Speed*): 256 / 31488 (InputLength)

These numbers don't really mean much, just a quick comparison. They're all pretty fast. My fastest table CRC-32 is still ~75% slower than `MurmurHash2_160`, which is the slowest in the table above.

* `MurmurHash3_x86_128` seems really fast considering it outputs 4 hashes, possibly one of the best choices for >32-bit.
* `MurmurHash1` is fastest 32-bit hash in JS. `MurmurHash3` and `xxHash` are also very good for high quality hash.
* If `xxHash` can be modified to properly mix v0-v4, this might be an efficient hash >32-bit. 
* `lookup2` produces 3 hahses, but its quality is only ensured for one of them.
* `lookup3` is faster for 256, but is **REALLY SLOW** for 31488 (investigate). Unlike `lookup2`, its quality is ensured for 64-bit.
* I cannot recommend `MurmurHash2_x86_64` because of its flaw, and my modification that attempts to fix it needs to be benchmarked.
* `MurmurHash2_160` is only one more 32-bit hash larger than `MurmurHash3_x86_128` but is quite slower. And cannot downscale without possibly hurting quality.
* `CybBeta2` is my custom 64-bit hash. Decent speed, but not much faster than `MurmurHash2_x86_64` and has untested hash quality.
* `CybBeta0` is my custom 32-bit hash. Only slightly faster than `MurmurHash1` and has untested hash quality.

## Emulated 64-bit hash functions

_I will put ports of 64-bit arithmetic hash functions here, but expect them to be extremely slow._
_If WebAssembly becomes viable that can be useful for 64-bit hash functions._
_BigInt does not currently seem to be a performant option._

****

# Notes/TODO
* **U32** [FunnyHash](https://github.com/funny-falcon/funny_hash/blob/master/funny_hash.h) - Try to implement this one.
* **U32** [Zaphod32](https://github.com/demerphq/BeagleHash/blob/master/zaphod32_hash.h) - Try to implement this one.
* **U32** [PhatHash](https://github.com/demerphq/BeagleHash/blob/master/phat_hash.h) - Try to implement this one.
* Johannes Baagøe's Mash function - see what the big deal is.
* [FNVPlus](https://github.com/tjwebb/fnv-plus) - enhanced JS version worth looking into. 
* [CRC32C](http://www.evanjones.ca/crc32c.html) - [faster](https://stackoverflow.com/questions/17645167/implementing-sse-4-2s-crc32c-in-software/17646775) CRC32? 8 bytes at a time. Might be HW/SSE4.2 only though.
* **U64** [t1ha](https://github.com/leo-yuriev/t1ha) - supposedly super fast, but requires 64-bit arithmetic.
* **U64** SlashHash - 64bit, supposedly fast but only 64-bit arch. Possibly viable in WebAssembly.
* **U64** SpookyHash - 128bit hash, fast but 64-bit arch only. WebAssembly port?
* **U64** [SeaHash](https://github.com/jroivas/seahash) - forgot about this one - 64-bit arch only.

# Misc benchmarks
*  https://jsbench.me/fyjfja4xih/1 - MurmurHash3 benchmarks
*  https://jsbench.me/2hjfj9oscd/1 - xxHash benchmarks
*  https://jsbench.me/isjfj2rpkx/1 - comparison of available implementations
*  https://jsbench.me/tgjfegz4er/1 - the guds
*  https://jsbench.me/zrjfehfwgu/1 - the not-so-guds

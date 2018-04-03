# Hash functions in JavaScript

## Why JavaScript

JavaScript just seems to have very few suitable libraries/functions for hashing. Some are bloated or needlessly complicated, some are slow or inefficiently implemented. Some contain code specific to Node.js, so a total rewrite would be required to run the same code in a browser. 

There is also the fact that most hash functions are implemented in compiled languages such as C/C++, and use 64-bit arithmetic. JavaScript is limited to 32-bit bitwise operations and can only resolve integers _safely_ up to 52-bits. And the performance benchmark claims from C versions can be thrown out of the window, because JS typically has very different performance.

All in all, no one is making good, performant hash functions for JavaScript.

## Goals

1. [Implement hash functions of all types in JavaScript](hashes/README.md), measure their performance/quality. 
2. [Create my own experimental hash functions](experimental/README.md), trying to beat the performance of existing implementations while retaining comparable quality benchmarks.

## What is a hash function

There seems to be a lot of confusion as to what hashing is. A hash function to a cryptographer would be something like MD5 or SHA2; a function characterized by security features designed to thwart attackers. A computer scientist might think of hash functions for use in hash tables, such as FNV, MurmurHash, or SipHash. There are an endless amount of these types of functions, each with wildly variable properties. Finally, a computer engineer might think of hash functions as a parity bit, checksum or cyclic redundancy check.

But the fact of the matter is, they are all hash functions. Hashing just means mapping/condensing data to a fixed size.

### Example 1: Typical hash functions

The cryptographically strong SHA256 produces this for a string of "bryc":
`741177fae5da4421a95f77802034a396581c169811c62951022db53082140abd`
The faster, non-cryptographic MurmurHash3_x86_128 produces this for "bryc":
`e87e2554db409442db409442db409442`
Again using non-cryptographic FNV1a_256 for "bryc":
`e46ddd4ed460b2208b81e2459f2a8e9d123f79d831721584cc463c351cc02a85`

Here is a comparison of hash outputs for a single ASCII character "0":

DJB: `0002b5d5`
Adler32: `00310031`
FNV0: `00000030`
CRC32: `9a3ad224`
FNV1a_32: `350ca8af`

This shows the difference in avalance effect: some hash functions make no attempt to mix all bits of the output, so high bits will be 0 for small inputs. Even a function like FNV1a that appears to avalanche, actually fails the 'strict avalanche criterion' shown through more vigorous testing. 

### Example 2: Checksum

An additive checksum might sum a number of bytes, `201+68+3+20` to produce 292. Depending on implementation, it could be stored in an 8-bit word (and would overflow), or 16 or 32 bit word sizes. A checksum could subtract from a constant, or sum 16-bit words, or employ Modulo or one's or two's compliment.  In fact, **scientific articles** have been published comparing the efficacy of even these simple checksums. The definition of a checksum could also be stretched to include more complicated algorithms (Fletcher/Adler), CRCs or general hash functions themselves.

In fact, in the 1978 edition of 'The C Programimng Language', a simple additive checksum is described as a hash function:

> The hashing function, which is used by both lookup and install, simply adds up the character values in the string and forms the remainder modulo the array size.

### Example 3: Bit parity

In odd bit parity, a parity bit of 1 is computed from the message 10010010001, to ensure there are an odd number of bits. Then final message is then 10010010001<b><u>1</u></b>. A receiver would then simply check whether there are an odd number of bits. The parity bit in this case is a hash because it is a value derived from the hash.

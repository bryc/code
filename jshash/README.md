# Hash functions in JavaScript

## Goals of this project

1. [Implement hash functions in JavaScript](hashes/README.md), measure their performance/quality. 
2. [Create my own experimental hash functions](experimental/README.md), trying to beat the performance of existing implementations while retaining comparable quality benchmarks.

### Extended

3. [Implement PRNGs in JavaScript](PRNGs.md), measure their performance/quality.
4. Study the differences between checksums and hash functions, as well as analyze the different approaches. For example: 
5. Implement stream ciphers in JavaScript (encryption). I've already done RC4 / RC4a.

## Why JavaScript

JavaScript has few suitable libraries/functions for hashing. Some are bloated or needlessly complicated, some are slow or inefficient. Some contain code specific to Node.js, so a total rewrite would be required to run the same code in a browser. 

There is also the fact that most hash functions are implemented in compiled languages such as C/C++, and use 64-bit arithmetic. JavaScript is limited to 32-bit bitwise operations and can only resolve integers _safely_ up to 52-bits. And the performance benchmark claims from C versions can be thrown out of the window, because JS typically has very different performance.

All in all, no one is making good, performant hash functions for JavaScript.

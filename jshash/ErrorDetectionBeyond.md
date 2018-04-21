# Error Detection and Beyond

A conditional jump is arguably the most important aspects in computations. It is what powers the `if` keyword in almost all programming languages. A programmer uses logical comparisons to determine which situations are valid and which are not. This is only possible when there are clear rules to follow. When you know the expected input or output, you can enforce it.

For example, an error is typically displayed if you try to divide by zero on a calculator. This is because division by zero is not mathematically possible. Calculators use conditions to catch this situation, otherwise bad things might happen. Text files on the other hand, like this document, are more ambiguous. It is difficult to differentiate a bunch of ASCII characters from random binary data. A UTF-encoded file sidesteps this problem by checking for a special code known as a **byte order mark** at the start of every UTF-8 sequence. This allows the receiving end to verify that a data stream is indeed UTF data, making heuristic detection unnecessary. 

In general terms, the UTF byte order mark is known as a **magic number**, an expected numerical result to pass an application's condition check. When programmers design binary file formats such as a Microsoft Office .doc file, these values are typically the first step of file parsing, allowing an acceptable confidence level before committing to more expensive parsing steps. Text-based files often use strings for this purpose such as `<!DOCTYPE html>` and `<?xml version="1.0"?>`, usually on the first line of the file.

Most files have well-defined underlying formats, however sometimes a format is so simple (such as a configuration bit field or data packet) that no strong assertions can be made through parsing alone. In these situations we use **error detection codes** (EDC). Error detection codes work by calculating a numerical value based on some data, irrespective of the contents of the data, then including it with the data. The receiving end recalculates the EDC and verifies that it matches the one previously sent.

The concept of mapping arbitrary length data to a fixed length is known as **hash functions**, an umbrella term with many specialized fields and uses, of which error detection codes are no doubt a part of. Hash functions often have wildly different properties that suit it for one purpose and not the other. We will explore various hash functions in the context of error-detection and collision resistance, starting with simple **checksums**, all the way up to **cryptographically-secure hash functions**. 


## Checksum


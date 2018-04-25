# Error Detection and Beyond

A conditional jump is arguably the most important part of computer programs. It is what powers the `if` keyword in almost all programming languages. A programmer uses logical comparisons to determine which situations are valid and which are not. This is only possible when there are definite rules to follow. When you know the expected input or output, you can enforce it.

For example, an error is typically displayed if you try to divide by zero on a calculator. This is because division by zero is not mathematically possible. Calculators use conditions to check for this situation, otherwise bad things might happen (world might explode). Text files on the other hand, like this document, are more ambiguous. It is difficult to differentiate a bunch of ASCII characters from random binary data. With Unicode, this problem is mitigtated by checking for a special code known as a **byte order mark** at the start of every UTF sequence. This allows the receiving end to verify that a data stream is indeed UTF data, making heuristic detection unnecessary. 

In general terms, the UTF byte order mark is known as a **magic number**, an expected numerical result needed to pass an application's condition check. When a programmer designs binary file formats such as a Microsoft Office .doc file, these values are typically the first step of file parsing, allowing an acceptable level of confidence before committing to more expensive parsing steps. Text-based files often use strings for this purpose such as `<!DOCTYPE html>` in HTML5 and `<?xml version="1.0"?>` in XML, usually on the first line of the file.

Most files have well-defined underlying formats, however sometimes a format is so simple (such as a configuration bit field or data packet) that no strong assertions can be made through parsing alone. In these situations we use **error detection codes** (EDC). Error detection codes work by calculating a numerical value based on some data, irrespective of the contents of the data, then including it with the data. The receiving end recalculates the EDC and verifies that it matches the one previously sent. This is intended for detecting data corruption.

The concept of mapping arbitrary length data to a fixed length is known as **hash functions**, an umbrella term with many specialized fields and uses, of which error detection codes are no doubt a part of. Hash functions often have wildly different properties that suit it for one purpose and not the other. We will explore various hash functions in the context of error-detection and collision resistance, starting with simple **checksum**, all the way up to **cryptographically-secure hash functions**. 


## Checksum

A checksum is simply the sum (addition) of a bunch of **words**. Usually it is a sum of 8-bit bytes, but it can often be a sum of 16-bit words (shorts), or 32, 64. Take the ASCII string "Hello World!" for example:

    "Hello World!" => {72, 101, 108, 111, 32, 87, 111, 114, 18, 100, 33}

The sum of these bytes: 1085

The checksum is typically sent along with the data, and the receiving end repeats the original calculation and compares the result to the stored value. If it matches, the validation check is passed.

### Overflow

The number 1085 requires 11 bits. A single byte only has 8 bits (256 possible values). Two bytes (16-bit) can represent up to 65536 values. Thus, a 16-bit number can only reliably sum up to 257 bytes. A 32-bit number can sum up to 16 megabytes of data. The more bits in a checksum, the better it is at detecting errors. However sometimes storage space is a concern, and only an 8-bit number can be used to store the checksum. In this case, any bits higher than the 7th bit is discarded in a process known as integer overflow.

    The sum above (1085) in hexadecimal is 0x043D. If stored as an 8-bit checksum it will be 0x3D.

This is also known as **modulo 256**. Modulo is essentially a division remainder that is often used in checksums or check digits on credit cards and barcodes.

```c
#include <stdio.h>

int main() {
  unsigned char data[] = {
    72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33
  };
  
  unsigned char sum = 0;
  for(int i = 0; i < sizeof(data); i++) {
    sum += data[i];
  }
  
  printf("%04X\n", sum); // result is '003D'
}
```

The above is C code that calculates a simple 8-bit checksum. The `unsigned char` is what restricts the result to 8-bits. 
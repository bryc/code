(article is wip)

# Error Detection and Beyond

Arguably the most important instruction used in computer programs are conditional jumps. They are what powers the `if` keyword in almost all programming languages. When writing code, a programmer uses logical comparisons to determine which situations should be allowed and which should not. This is possible because there are definite rules to follow. When you know the expected input or output, you can enforce it.

For example, an error is typically displayed if you try to divide by zero on a calculator. This is because division by zero is not mathematically possible. Calculators use conditions to check for this situation, otherwise bad things might happen (world might explode). Text files on the other hand, like this document, are more ambiguous. It is difficult to differentiate a bunch of ASCII characters from random binary data. With Unicode, this problem is mitigtated by checking for a special code known as a **byte order mark** at the start of every UTF sequence. This allows the receiving end to verify that a data stream is indeed UTF data, making heuristic detection unnecessary. 

In general terms, the UTF byte order mark is known as a **magic number**, an expected numerical result needed to pass an application's condition check. When a programmer designs binary file formats such as a Microsoft Office .doc file, these values are typically the first step of file parsing, allowing an acceptable level of confidence before committing to more expensive parsing steps. Text-based files often use strings for this purpose such as `<!DOCTYPE html>` in HTML5 and `<?xml version="1.0"?>` in XML, usually on the first line of the file.

Most files have well-defined underlying formats, however sometimes a format is so basic (such as a configuration bit field, data packet or credit card number) that no strong assertions can be made through parsing alone. In these situations we use **error detection codes** (EDC) to detect errors or corruptions in data. Error detection codes work by calculating a numerical value based on some data, irrespective of the contents of the data, then include it with the data. The receiving end recalculates the EDC and verifies that it matches the one previously sent.

The concept of mapping arbitrary length data to a fixed length is known as **hash functions**, an umbrella term with many specialized fields and uses, of which error detection codes are no doubt a part of. Hash functions often have wildly different properties that suit it for one purpose and not the other. We will explore various hash functions in the context of error-detection and collision resistance, starting with simple **checksum**, all the way up to **cryptographically-secure hash functions**. 


## Checksum

A checksum is simply the sum (addition) of a bunch of **words**. Usually it is a sum of 8-bit bytes, but it can often be a sum of 16-bit words (shorts), or other lengths. Take the ASCII string "Hello World!" for example:

    Summation of 12 x 8-bit words:
    "Hello World!" => {72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33}
    The sum of these bytes: 1085

    Summation of 6 x 16-bit words (little-endian):
    "Hello World!" => {25928, 27756, 8303, 28503, 27762, 8548}
    The sum of these bytes: 126800

The checksum is typically sent along with the data, and the receiving end repeats the original calculation and compares the result to the stored value. If it matches, the validation check is passed.

### Overflow

The result of the 8-bit summation, 1085, requires 11 bits. A single byte only has 8 bits (256 possible values). Two bytes (16-bits) can represent up to 65536 possible values. Thus, a 16-bit number can only reliably sum up to 257 8-bit bytes without **overflow**. A 32-bit number can sum up to 16 megabytes of data without overflow. The general rule is, the more bits used in a checksum, the better it is at detecting errors (however not all algorithms are made equal). However sometimes storage space is a concern, and only 8 bits can be reserved for the checksum. In this case, any bits higher than the 7th bit is discarded in a process known as integer overflow.

    The sum above (1085) in hexadecimal is `0x043D`. If stored as an 8-bit checksum it will be 0x3D.

This is also known as a **modulo 256** checksum. Modulo is essentially the remainder of a division, often used in checksums or check digits on credit cards and barcodes.

The following C code calculates a simple 8-bit checksum. The `unsigned char` is what restricts the result to 8-bits. 

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

Now, looking at our 16-bit result, 126800 (`0x1EF50`). This requires 17 bits, and has a potential maximum of 19 bits for six 16-bit numbers. Overflow still applies here unless one uses a 32-bit sum. 

The following C code calculates a 16-bit checksum. Using `unsigned short` restricts the result to 16-bits.

```c
#include <stdio.h>

int main() {
  unsigned short data[] = {
    25928, 27756, 8303, 28503, 27762, 8548
  };
  
  unsigned short sum = 0;
  for(int i = 0; i < sizeof(data) / sizeof(data[0]); i++) {
    
    sum += data[i];
  }
  
  printf("%04X\n", sum); // result is 'EF50'
}
```

### XOR

Checksums can use operations other than addition. Exclusive or (XOR) is often used as a more efficient (but statistically less reliable) alternative. XOR works by comparing two numbers, and setting the bit to 1 in each position if they are different. For example `11110000 XOR 00000111 = 11110111`. In the result, differing bits are 1, common bits are 0. Because of the reversible nature of XOR it is useful in ciphers and checksums.

    XOR Summation of 12 x 8-bit words:
    72 ^ 101 ^ 108 ^ 108 ^ 111 ^ 32 ^ 87 ^ 111 ^ 114 ^ 108 ^ 100 ^ 33 = 1

    XOR Summation of 6 x 16-bit words (little-endian):
    25928 ^ 27756 ^ 8303 ^ 28503 ^ 27762 ^ 8548 = 2826

One of the disadvantages of XOR (or advantages depending on your outlook) is that the result is only as big as the size of the operands. Addition has carrying which allows growing in significant digits. However this can be averted by combining XOR with shift operations in more complex algorithms.

Here is C code of a simple 8-bit XOR checksum:

```c
#include <stdio.h>

int main() {
  unsigned char data[] = {
    72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33
  };
  
  unsigned char sum = 0;
  for(int i = 0; i < sizeof(data); i++) {
    sum ^= data[i];
  }
  
  printf("%04X\n", sum); // result is '0001'
}
```

### A clever optimization for verifying checksums.

Some smart engineers figured out that calculating a checksum, then comparing for equality was a bit inefficient and they could do better. Instead of comparing two values, they figured out a way to **force a the result to zero** if it is valid, and anything non-zero would be invalid.

    Step 1. Calculate 8-bit sum: 72 + 101 + 108 + 108 + 111 + 32 + 87 + 111 + 114 + 108 + 100 + 33 = 0x3D
    Step 2. XOR it with 0xFF (flip every bit) = 0xC2
    Step 3. Include the checksum in the actual calculation. 
            72 + 101 + 108 + 108 + 111 + 32 + 87 + 111 + 114 + 108 + 100 + 33 + 0xC2 = 0xFF
    Step 4. XOR it with 0xFF (flip every bit) = 0x00

The "XOR 255" operation is equivalent to a bitwise NOT, or one's complement operation, which would be the most efficient way to do the task at the instruction-level. 

I'm not exactly sure why this is more efficient - perhaps it uses less CPU cycles, but the most convicing possibility is that this method exploits the **zero flag** present in most CPU architectures status register.

### One's complement and Two's complement addition

This is a bit of a confusing section. I already mentioned that one's complement or bitwise NOT is used to optimize the process of validating checksums. However, when doing addition, some checksum algorithms retain the carry bits rather than discard them. These carry bits are then added back to the final sum, preferrably at the end of the chain. Modulo 65535 arithmetic appears to work the same way as One's complement / Add with carry addition.

The Internet Checksum makes use of this concept, which is part of the TCP/UDP protocol. A quick example of it:

`~(0x4500+0x0073+0x0000+0x4000+0x4011+0xc0a8+0x0001+0xc0a8+0x00c7) % 0xFFFF & 0xFFFF = 0xb861`

```js
/*
	Internet Protocol Header Checksum
 
	Implements the checksum algorithm used in IPv4 packets (TCP/UDP). Has the 
	property of being able to verify data quickly by summing the block
	that includes the checksum. Result ends up being 0xFFFF, which
	historically was compared against 0 for performance reasons.
 
    "    The checksum algorithm is:
 
      The checksum field is the 16 bit one's complement of the one's
      complement sum of all 16 bit words in the header.  For purposes of
      computing the checksum, the value of the checksum field is zero."
 
      From: https://tools.ietf.org/html/rfc760#page-11
      More info: https://en.wikipedia.org/wiki/IPv4_header_checksum
      https://tools.ietf.org/html/rfc1071
*/
var data = [ // checksum: 0xb861
	0x45, 0x00, 0x00, 0x73, 0x00, 0x00, 0x40, 0x00,
	0x40, 0x11, 0xc0, 0xa8, 0x00, 0x01, 0xc0, 0xa8, 0x00, 0xc7
];
 
function IPv4(data) {
	for(var sum = 0, i = 0; i < data.length; i += 2)
	{
		var digit = (data[i] << 8) + data[i + 1];
		sum = (sum + digit) % 65535;
	}
	// a bitwise method of carrying the bits:
	//while (sum >> 16) sum = (sum & 0xFFFF)+(sum >> 16);
	return (~sum) & 0xFFFF;
}
```

As for **two's complement addition**.. well modern CPUs apparently use two's complement addition internally. At first glance, it appears to be an alternative optimization trick to force the result to zero. But there may be more to it. essentially an 8-bit two's complement is `256 - (1 + 2 + 3) & 0xFF`. This appears to be the result of bitwise `NOT` minus one. Or "256 - val" / "0 - val". It could be related to the term "Longitudinal parity check".


<-- 
In outline, the Internet checksum algorithm is very simple:

   (1)  Adjacent octets to be checksummed are paired to form 16-bit
        integers, and the 1's complement sum of these 16-bit integers is
        formed.

   (2)  To generate a checksum, the checksum field itself is cleared,
        the 16-bit 1's complement sum is computed over the octets
        concerned, and the 1's complement of this sum is placed in the
        checksum field.

   (3)  To check a checksum, the 1's complement sum is computed over the
        same set of octets, including the checksum field.  If the result
        is all 1 bits (-0 in 1's complement arithmetic), the check
        succeeds.

        Suppose a checksum is to be computed over the sequence of octets

All values are stored "little endian" (low byte followed by high byte), just like the
PDP-11's memory architecture.

After the data bytes, there is a single checksum byte.  The 8-bit sum of all the bytes in
the block (including the header bytes and checksum byte) should be zero.
-=-=---

mod11 = http://www.pgrocer.net/Cis51/mod11.html
mod10 = https://en.wikipedia.org/wiki/Luhn_algorithm 
mod97 = https://en.wikipedia.org/wiki/ISO_7064 MOD-97-10 as per ISO/IEC 7064:2003
mod43 = https://www.hibc.de/images/documents/guidelines/MOD_43_Calculation-E.pdf
mod256= aka 8-bit checksum
other = https://www.activebarcode.com/codes/checkdigit/modulo16.html



Effectiveness of different checksums: https://users.ece.cmu.edu/~koopman/thesis/maxino_ms.pdf



TODO. These are simply different ways of doing binary arithmetic which sometimes results in more favorable error-detection statistics. I assume these started out on CPUs that were specifically one's complement or two's complement - and in order to achieve the same results additional operations must be performed. -->

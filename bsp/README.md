## BSP

This is a synth player I've been working for a while now. It uses the Web Audio API to generate music. You can [see the live version here]([https://bryc.github.io/code/bsp/](https://bryc.github.io/code/bsp/)) and listen to some music it can do.

Unfortunately I didn't anticipate many of the restrictions of the API, and it turns out many of the things I want to do just can't be done easily with what I have. That includes even simple drum sounds and [instrument envelopes](https://en.wikipedia.org/wiki/Envelope_(music)), which is important for synth expressiveness.

The best that can be done are simple ON/OFF sounds with some LFO modulation, and extremely simple white noise percussion (with a fixed 1 step length). I archived BSP2 in the 'old-code' section which contains some ideas for further enhancement (with better LFO control over parameters), but to me it's almost not worth pursuing if I can't do percussion sounds.

So this project is kinda on hold until I can figure out more flexible ways to implement the sequencer timer, and rewrite the code. 
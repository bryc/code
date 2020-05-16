# Sudoku
This is Sudoku implemented in JS, as a reference for studying relevant algorithms. 

Here are my main goals:

- An encoder/decoder that can compress a sudoku board as _small as possible_.
- Shortest possible code for generating acceptable Sudoku puzzles. 16-bit seed (65536 possible puzzles).
- Valdiating a Sudoku board, and giving it color for givens or invalids, etc.
- No support for "notes" in the save data, unless it can be optimized heavily.

### TODO
1. Sudoku state validation
2. Simple user experience improvements. _(maybe)_ Click cells to cycle through numbers (Left and Right click - arrow keys as well?)

## Solver/generator: 
- https://github.com/jalbam/yasminoku/blob/master/yasminoku_025a_english/index.htm (study encoding)
- http://www.sudokuwiki.org/sudoku.htm (original online solver)
- https://codepen.io/pavlovsk/pen/XmjPOE
- https://github.com/pocketjoso/sudokuJS
- https://github.com/robatron/sudoku.js
- https://attractivechaos.github.io/plb/kudoku.html
- https://www.codefellows.org/blog/sudoku-solver-from-scratch-in-javascript-tdd-style-a-tutorial/
- https://stackoverflow.com/questions/42736648/sudoku-solver-in-js
- https://20js.devpost.com/submissions/33526-sudoku-solver  <-- 20 lines of code only
- http://moriel.smarterthanthat.com/tips/javascript-sudoku-backtracking-algorithm/
- http://www.kernel-panic.it/software/sudokiller/sudokiller.js.html
- http://www.emanueleferonato.com/2015/06/23/pure-javascript-sudoku-generatorsolver/
-  https://curiosity-driven.org/sudoku-solver <-- also kinda short but is it full code?
- https://gist.github.com/p01/1230481/95f6facb74f51d089bea87eba0f470cf3bbed83a <-- 140 byte hyper small p01 demoscene sudoku solver... maybe good?! but slow
- http://lahiri.me/fapanosss.html?#
- https://www.openhub.net/p/sudoku_js
- https://scriptographer.org/scripts/general-scripts/sudoku-generator-solver/   (ADOBE ILLUSTRATOR ONLY)

## validator
- https://medium.com/@0xsven/sudoku-validation-with-javascript-1297712093bf (article on validation)
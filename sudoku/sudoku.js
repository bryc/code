function generate() {
    function* solver(board) {
        const masks = [0,1,2,4,8,16,32,64,128,256],
        rows = [0,0,0,0,0,0,0,0,0],
        cols = [0,0,0,0,0,0,0,0,0],
        blks = [0,0,0,0,0,0,0,0,0],
        row = function(n){return 0|n/9},
        col = function(n){return n%9},
        blk = function(n){return 3*(0|n/27) + (0|n%9/3)};

        for(var i = 0; i < 81; i++) {
            const mask = masks[board[i]];
            rows[row(i)] |= mask, cols[col(i)] |= mask, blks[blk(i)] |= mask;
        }
        function* solve(i) {
            if(i === 81) return yield board;
            if(board[i] !== 0) return yield* solve(i + 1);
            const r = row(i), c = col(i), b = blk(i), used = rows[r] | cols[c] | blks[b];
            for(var v = 1; v <= 9; v++) {
                const mask = masks[v];
                if(used & mask) continue;
                rows[r] |= mask, cols[c] |= mask, blks[b] |= mask; board[i] = v;
                yield* solve(i + 1);
                rows[r] &= ~mask, cols[c] &= ~mask, blks[b] &= ~mask; board[i] = 0;
            }
        }
        yield* solve(0);
    }
    function sample(list, num) {
        var newl = list, picks = [], pick;
        for(var i = 0; i < num; i++) {
            pick = 0 | Math.random() * newl.length;
            picks.push(newl[pick]), newl.splice(pick, 1);
        }
        return picks.sort();
    }
    function swapRows(puz, fro, to) {
        var a1 = fro*9, a2 = a1+9, b1 =  to*9, b2 = b1+9;
        for(var i = 0, newp = []; i < puz.length; i++) {
            i >= a1 && i < a2 ? newp.push(puz[i - a1 + b1]) :
            i >= b1 && i < b2 ? newp.push(puz[i - b1 + a1]) :
            newp.push(puz[i]);
        }
        return newp;
    }
    function swapCols(puz, fr, to) {
        var fCol = [], tCol = [];
        for(var i = fr; i < fr + 81; i += 9) fCol.push(puz[i]);
        for(var i = to; i < to + 81; i += 9) tCol.push(puz[i]);
        for(var i = 0, newp = []; i < puz.length; i++) {
            i % 9 === fr ? newp.push(tCol[i / 9 | 0]) :
            i % 9 === to ? newp.push(fCol[i / 9 | 0]) :
            newp.push(puz[i]);
        }
        return newp;
    }

    
var puzzle = Math.random() > .5 ?
[1,2,7,9,8,6,5,3,4,8,6,5,4,3,1,9,2,7,9,3,4,2,7,5,6,8,1,3,4,8,6,1,7,2,5,9,5,1,2,3,4,9,7,6,8,6,7,9,5,2,8,4,1,3,2,9,3,8,5,4,1,7,6,4,5,1,7,6,3,8,9,2,7,8,6,1,9,2,3,4,5]:
[1,6,7,9,8,5,2,3,4,8,4,5,2,3,1,9,6,7,9,3,2,4,7,6,5,8,1,3,5,9,1,4,8,6,7,2,4,2,1,6,5,7,8,9,3,7,8,6,3,2,9,4,1,5,2,9,8,7,1,4,3,5,6,5,1,3,8,6,2,7,4,9,6,7,4,5,9,3,1,2,8];

    for(var i = 0; i < 20; i++) {
        for(var j = 0; j < 3; j++) {
            var swaps = sample([j*3, j*3 + 1, j*3 + 2], 2);
            if(Math.random() > .5) puzzle = swapRows(puzzle, swaps[0], swaps[1]);
            else puzzle = swapCols(puzzle, swaps[0], swaps[1]);
        }
    }

    function mask(puzzle) {
        var ct = 0, ls = [...Array(81).keys()].map((a)=>[Math.random(),a]).sort((a,b)=>a[0]-b[0]).map((a)=>a[1]),
        npuzz = puzzle.slice();
        for(var i = 0; i < 41; i++) npuzz[ls[i]] = 0;
        for(var sol of solver(npuzz, 0)) if(ct++, ct > 1) break;
        return ct === 1 ? npuzz : mask(puzzle);
    }

    var outp = mask(puzzle), outt = document.querySelectorAll(".sudoku td");
    for (var i = 0; i < outt.length; i++) {
        outt[i].innerHTML = outp[i] ? outp[i] : "";
        outt[i].style.color = outp[i] ? "#888" : "";
        outt[i].style.fontWeight = outp[i] ? "bold" : "";
        outt[i].contentEditable = outp[i] ? false : true;
    }
    console.log('Sudoku Generated:', outp.toString().replace(/,/g, ''));
    loadPuzzle(savePuzzle());
}

/* 
    pixicon: a sexy hashicon generator (work in progress)
    by @bryc (github.com/bryc)
 */
function pixicon(t, scale, seed, pixels) {
    // HSL color generator.
    function HSL(t, r, e, i=0) {
        var set = [
            [(999*t)%360, 24+80*r%40, 26+70*e%40],
            [(999*t)%360, 9*r%10, 15+36*e%50],
            [(999*t)%360, 14*r%40, 33+36*e%40],
        ];
        return "hsl("+~~set[i][0]+","+~~set[i][1]+"%,"+~~set[i][2]+"%)";
    }
    // Pseudorandom number generator.
    function sfc32(a, b, c, d) {
        return function() {
          a |= 0; b |= 0; c |= 0; d |= 0; 
          var t = (a + b | 0) + d | 0;
          d = d + 1 | 0;
          a = b ^ b >>> 9;
          b = c + (c << 3) | 0;
          c = c << 21 | c >>> 11;
          c = c + t | 0;
          return (t >>> 0) / 4294967296;
        }
    }
    // transform a base HSL color into an alternate color
    function modHSL(str,mode = 0){
    var arr = str.replace(/[^\d,.%]/g, '').split(',').map(x => Number.parseFloat(x, 10));
    return `hsl(${arr[0]+(mode?-20:-20)},${arr[1]+(mode?-10:-10)}%,${arr[2]+(mode?12:-8)}%)`;
    }
    // pixel array rotation/flip
    // 0 = x flip, 1 = y flip, 2 = 90° rot
    // 3 = 180° rot OR xy flip, 4 = 270° rot
    function rota(arr, mode, w, h) {
        if(mode===3) var arr2 = arr.slice().reverse();
        if(mode===0 || mode===1) { // horizontal flip
            for(var i = 0, arr2 = []; i < arr.length; i++)
                arr2[i] = arr[i-2*(i%w)+w-1];
        }
        if(mode===2 || mode===4) { // rotate 90° CW
            for(var i = 0, arr2 = []; i < arr.length; i++)
                arr2[i] = arr[0|(h-1)*w-((i%h)*w)+i/h];
        }
        if(mode===1||mode===4) arr2.reverse();

        return arr2;
    }
    // swap values for triangles for rotation. TODO: make this less long and support other shapes.
    function trirot(arr, mode) {
        var arr2 = arr.slice();
        for(var i = 0; i < arr.length; i++) {
            switch(mode) {
                case 0:
                if(arr[i]===2)  (arr2[i] = 5);
                if(arr[i]===3)  (arr2[i] = 4);
                if(arr[i]===4)  (arr2[i] = 3);
                if(arr[i]===5)  (arr2[i] = 2);
                break;
                case 1:
                if(arr[i]===2)  (arr2[i] = 4);
                if(arr[i]===3)  (arr2[i] = 5);
                if(arr[i]===4)  (arr2[i] = 2);
                if(arr[i]===5)  (arr2[i] = 3);
                break;
                case 2:
                if(arr[i]===2)  (arr2[i] = 4);
                if(arr[i]===3)  (arr2[i] = 5);
                if(arr[i]===4)  (arr2[i] = 3);
                if(arr[i]===5)  (arr2[i] = 2);
                break;
                case 3:
                if(arr[i]===2)  (arr2[i] = 3);
                if(arr[i]===3)  (arr2[i] = 2);
                if(arr[i]===4)  (arr2[i] = 5);
                if(arr[i]===5)  (arr2[i] = 4);
                break;
                case 4:
                if(arr[i]===2)  (arr2[i] = 5);
                if(arr[i]===3)  (arr2[i] = 4);
                if(arr[i]===4)  (arr2[i] = 2);
                if(arr[i]===5)  (arr2[i] = 3);
                break;
                case 5:
                if(arr[i]===2)  (arr2[i] = 3);
                if(arr[i]===3)  (arr2[i] = 2);
                if(arr[i]===4)  (arr2[i] = 4);
                if(arr[i]===5)  (arr2[i] = 5);
                break;
            }
        }
        return arr2;
    }
    // paint the patterns on the canvas. TODO: shorten code for more shapes like Don Park.
    function paint(arr, x, y, cnt, w = 5, WW = 5) {
        var o = (t.width) / n;
        for(var i = 0, j = 0, k = 0; i < cnt; i++, k++) {
            if((k === w)) {
                j++, k = 0;
                if(j === WW) break;
            }
            if(arr[i]) {
            c.beginPath();
            switch(arr[i]) { // 1=square, 2-5=triangles
                case 1:
                    c.fillRect(x*o + k*o, y*o+ j*o, o, o);
                    break;
                case 2:
                    c.moveTo(x*o + o*k,     y*o + o*j);
                    c.lineTo(x*o + o*k + o, y*o + o*j);
                    c.lineTo(x*o + o*k + o, y*o + o*j + o);
                    break;
                case 3:
                    c.moveTo(x*o+o*k,     y*o + o*j);
                    c.lineTo(x*o+o*k,     y*o + o*j + o);
                    c.lineTo(x*o+o*k + o, y*o + o*j + o);
                    break;
                case 4:
                    c.moveTo(x*o+o*k + o, y*o + o*j);
                    c.lineTo(x*o+o*k,     y*o + o*j + o);
                    c.lineTo(x*o+o*k + o, y*o + o*j + o);
                    break;
                case 5:
                    c.moveTo(x*o+o*k + o, y*o + o*j);
                    c.lineTo(x*o+o*k,     y*o + o*j);
                    c.lineTo(x*o+o*k,     y*o + o*j + o);
                    break;
            }
            c.fill();
            }
        }
    }
    var 
        c   = t.getContext("2d"),
        n   = 11,
        rng = sfc32(seed[0], seed[1], seed[2], seed[3]),
        symMode = rng()*2|0,
        pix = !pixels ? 1 : 5,
        diagMode = 1; // use diagonal symmetry inner patterns.

    // HSL Palette presets
    var colz = [
        [`48,31,21`,`57,24,33`,`20,56,47`,`0,68,65`],
        [`184,24,19`,`117,34,30`,`57,20,57`,`0,70,70`],
        [`0,24,29`,`55,34,48`,`75,78,59`,`99,96,63`],
        [`140,23,24`,`86,21,37`,`33,31,47`,`0,73,72`],
        [`0,30,27`,`37,33,45`,`52,70,58`,`86,72,61`],
        [`71,47,23`,`69,28,38`,`41,40,56`,`0,100,79`],
        [`0,43,33`,`0,65,55`,`22,100,61`,`53,100,69`],
        [`219,29,30`,`256,15,38`,`0,45,59`,`31,81,71`],
        [`0,79,29`,`27,53,47`,`42,76,51`,`58,68,69`],
        [`40,29,22`,`0,100,27`,`40,24,33`,`11,49,73`],
        [`0,5,20`,`4,5,35`,`93,22,57`,`41,63,77`],
        [`279,14,23`,`0,20,42`,`47,47,57`,`89,73,72`],
        [`0,97,15`,`39,28,30`,`91,34,40`,`121,97,65`],
        [`0,40,34`,`33,47,49`,`57,82,66`,`70,98,69`],
        [`44,31,32`,`26,72,58`,`81,47,64`,`0,79,70`],
        [`0,100,14`,`57,100,28`,`79,83,60`,`99,80,64`],
        [`29,36,25`,`0,41,45`,`19,86,56`,`125,60,75`],
        [`0,33,28`,`45,37,53`,`56,69,63`,`85,88,70`],
        [`0,97,16`,`39,28,30`,`91,34,40`,`121,97,61`],
        [`29,39,28`,`243,74,46`,`20,60,61`,`0,60,70`],
        [`0,63,28`,`0,59,47`,`86,45,61`,`54,99,71`],
        [`0,47,28`,`13,44,40`,`39,73,54`,`52,98,73`],
        [`0,9,40`,`20,14,53`,`47,31,67`,`63,69,74`],
        [`314,40,34`,`0,14,41`,`71,40,58`,`82,88,69`],
    ]
    // Choose random color scheme, then randomize hue
    var cols = colz[colz.length*rng()|0];
    for(var i = 0, hue = rng()*360; i < cols.length; i++) {
        var cc = cols[i].split(',').map(a=>parseInt(a));
        cols[i] = `${cc[0]+hue},${cc[1]}%,${cc[2]}%`;
    }
    // Shuffle palette
    for(var v, s = 4; s;) {
        v = 0|rng() * s--;
        [cols[s], cols[v]] = [cols[v], cols[s]];        
    }

    // Erase anything previously on the canvas context.
    c.clearRect(0, 0, t.width, t.height);
    // Set canvas dimensions if not already set.
    // Condition improves performance on subsequent calls to existing canvas (Firefox).
    if(t.width !== n*scale) t.width = t.height = n*scale;

    // Generate a background of random size
    var bg0 = (rng()*4|0)+1, bg1 = [9,7,5,3,1][bg0-1];
    if(bg0 < 3 && rng() > 0.5) {
        c.lineWidth = bg0*t.width/11;
        c.strokeStyle = `hsl(${cols[3].toString()})`,
        c.strokeRect(bg0*t.width/11+(c.lineWidth/2), bg0*t.width/11+(c.lineWidth/2), bg1*t.width/11-(c.lineWidth), bg1*t.height/11-(c.lineWidth));
    } else {
        c.fillStyle = `hsl(${cols[3].toString()})`,c.fillRect(bg0*t.width/11, bg0*t.width/11, bg1*t.width/11, bg1*t.height/11);  
    }
    // Multiple passes (only two)

    var num = 0; while(num < 2) {
    // Set fill color for pixels. TODO: make sure no two colors are similar
    var color1 = `hsl(${cols[num].toString()})`;
    var color2 = color1;
    var color2a = `hsl(${cols[2].toString()})`;
    c.fillStyle = color1;

    // - PATTERN ONE -
    // Generate the number of pixels to occupy (threshold: within 25%-75%).
    var divisor = 2.5;
    var r = rng(), u = 0|((2*r*100+8*r+100)*.125) / divisor;
    // Populate array with an amount of pixels (within threshold).
    for(var pt1=[], s = 0; s < u; s++)
        pt1[s] = 1 + rng()*pix|0;
    // Shuffle pixel array (Fisher–Yates).
    // !!! NOTE: |0 is required to prevent an infinite loop in odd sizes. !!!
    for(var v, s = 25; s;)
        v = 0|rng() * s--,
        [pt1[s], pt1[v]] = [pt1[v], pt1[s]];
    // - PATTERN TWO -
    var r = rng(), u = 0|((2*r*100+8*r+100)*.125) / divisor;
    for(var pt2=[], s = 0; s < u; s++)
        pt2[s] = 1 + rng()*pix|0;
    for(var v, s = 25; s;)
        v = 0|rng() * s--,
        [pt2[s], pt2[v]] = [pt2[v], pt2[s]];
    // - PATTERN THREE - 
    for(var pt3=[], s = 0; s < 6; s++)
    pt3[s] = rng()*2|0;

    // Toggle diagonal inner symmetry
    if(diagMode) {
        var goodlist0 = [1,2,3,4,7,8,9,13,14,19];
        var mask0 = pt1.slice(), mask1 = pt2.slice();
        for(var i = 0; i < 25; i++) {
            if(!goodlist0.includes(i)) mask0[i] = mask1[i] = 0;
        }
        mask0 = trirot(mask0,5); // rotate tris for diagMode
        mask1 = trirot(mask1,5); // rotate tris for diagMode
        pt1 = rota(pt1,2,5,5), pt1 = rota(pt1,0,5,5);
        pt2 = rota(pt2,2,5,5), pt2 = rota(pt2,0,5,5);  
        for(var i = 0; i < 25; i++) {
            if(goodlist0.includes(i)) pt1[i] = mask0[i], pt2[i] = mask1[i];
        }
        // force diagonal shapes to be squares for symmetry
        var goodlist2 = [0,6,12,18,24];
        for(var i = 0; i < 5; i++) {
            var nm = goodlist2[i];
            if(pt1[nm]) pt1[nm] = 1;
            if(pt2[nm]) pt2[nm] = 1;
        }
    }

    // produce final pixel array.
    var fin = [];
     // using two random buffers can look bad - so only use it when diagmode is used
    var usept2 = diagMode && rng()>0.5;
    switch(symMode) {
        case 0:  // Snowflake (Reflected-4)
        fin[0] = (pt1);
        fin[1] = trirot(rota(usept2?pt2:pt1,1, 5,5),1);
        fin[2] = trirot(rota(usept2?pt2:pt1,0, 5,5),0);
        fin[3] = trirot(rota(pt1,3, 5,5),3);
        break;
        case 1: // Snowflake (Rotated-4)
        fin[0] = (pt1);
        fin[1] = trirot(rota(usept2?pt2:pt1,4, 5,5),4);
        fin[2] = trirot(rota(usept2?pt2:pt1,2, 5,5),2);
        fin[3] = trirot(rota(pt1,3, 5,5),3);
        break;
    }

    if(rng()>0.5) [fin[1], fin[2]] = [fin[2], fin[1]];
    paint(fin[0], 0,0, 25); // T-L
    paint(fin[1], 0,n===11?6:5, 25); // B-L
    c.fillStyle = color2;
    paint(fin[2], n===11?6:5,0, 25);// T-R
    paint(fin[3], n===11?6:5,n===11?6:5, 25); // B-R

    if(rng()>0.3 && n === 11) {
        c.fillStyle = color2a;
        paint(pt3, 0,5, 6, 6); // >
        paint(rota(pt3,0,5), 6,5, 5, 5); // <
        paint(pt3, 5,0, 5, 1); // V
        paint(rota(pt3,0,5), 5,6, 5, 1); // ^
    }
    num++;
    }
}

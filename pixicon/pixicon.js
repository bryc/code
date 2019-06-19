/* 
    pixicon: a sexy hashicon generator (work in progress)
    by @bryc (github.com/bryc)
 */
function pixicon(t, scale, seed, pixels) {
    // HSL color generator.
    function HSL(t, r, e, i=0) {
        var set = [
            [24+80*r%40, 26+70*e%40],
            [9*r%10, 15+36*e%50],
            [14*r%40, 33+36*e%40],
        ];
        return "hsl("+~~((999*t)%360)+","+~~set[i][0]+"%,"+~~set[i][1]+"%)";
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
        var arr2 = arr.slice(), t;
        switch(mode) {
            case 0: t=[5,4,3,2]; break;
            case 1: t=[4,5,2,3]; break;
            case 2: t=[4,5,3,2]; break;
            case 3: t=[3,2,5,4]; break;
            case 4: t=[5,4,2,3];
        }
        for(var i = 0; i < arr.length; i++) {
            var r=arr[i]-2;
            if(r<0||r>3) continue;
            arr2[i]=t[r];
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
        pix = pixels ? 1 : 5,
        diagMode = rng()*2|0; // use diagonal symmetry inner patterns.

    // Erase anything previously on the canvas context.
    c.clearRect(0, 0, t.width, t.height);
    // Set canvas dimensions if not already set.
    // Condition improves performance on subsequent calls to existing canvas (Firefox).
    if(t.width !== n*scale) t.width = t.height = n*scale;

    // Multiple passes (only two)

    var num = 0; while(num < 2) {
    // Set fill color for pixels. TODO: make sure no two colors are similar
    var color1 = HSL(rng(), rng(), rng(), rng()*1|0);
    var color2 = modHSL(color1);
    var color2a = modHSL(color1, 1);
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
    switch(symMode) {
        case 0:  // Snowflake (Reflected-4)
        fin[0] = (pt1);
        fin[1] = trirot(rota(pt1,1, 5,5),1);
        fin[2] = trirot(rota(pt1,0, 5,5),0);
        fin[3] = trirot(rota(pt1,3, 5,5),3);
        break;
        case 1: // Snowflake (Rotated-4)
        fin[0] = (pt1);
        fin[1] = trirot(rota(pt1,4, 5,5),4);
        fin[2] = trirot(rota(pt1,2, 5,5),2);
        fin[3] = trirot(rota(pt1,3, 5,5),3);
        break;
    }

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

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
        pix = pixels ? 1 : 5,
        diagMode = rng()*2|0; // use diagonal symmetry inner patterns.

    // Generate random colors
    var colz = [
    [`209,31,21`,`218,24,33`,`181,56,47`,`161,68,65`],    //0 medium, NICE
    [`244,24,19`,`177,34,30`,`117,20,57`,`60,70,70`],     //1 desaturated, but NICE contrast
    [`291,24,29`,`346,34,48`,`6,78,59`,`30,96,63`],       //2 very NICE tones and contrast
    [`182,23,24`,`128,21,37`,`75,31,47`,`42,73,72`],      //3 NICE tones but desaturated, kinda like gameboy
    [`301,30,27`,`338,33,45`,`353,70,58`,`27,72,61`],     //4 NICE tones, higher saturation
    [`184,47,23`,`182,28,38`,`154,40,56`,`113,100,79`],   //5 decent desaturated tones NICE?
    [`0,43,33`,`0,65,55`,`22,100,61`,`53,100,69`],        //6 NICE , but.. too bright and maybe too saturated
    [`237,29,30`,`274,15,38`,`18,45,59`,`49,81,71`],      //7 Slightly desaturated, but has NICE tones
    [`333,79,29`,`0,53,47`,`15,76,51`,`31,68,69`],        //8 Monotone, but with a decent hue-shift.  NICE.
    [`223,29,22`,`183,100,27`,`223,24,33`,`194,49,73`],   //9 Not bad but some colors are a little too bright. Could be NICE.
    [`20,5,20`,`24,5,35`,`113,22,57`,`61,63,77`],         //10 Desaturated colors with some darks. NICE actually
    [`229,14,23`,`310,20,42`,`357,47,57`,`39,73,72`],     //11 Desaturated, medium brightness - NICE?
    [`239,97,15`,`278,28,30`,`330,34,40`,`0,97,65`],      //12 NICE neon tones, but a bit too bright? Try to adjust
    [`303,40,34`,`336,47,49`,`0,82,64`,`13,98,69`],       //13 Soft, bright candy colors. Not bad. NICE maybe try to adjust?
    [`14,31,32`,`356,72,58`,`51,47,64`,`330,79,70`],      //14 A bit bright, but colors look nice. Adjusting brightness could be NICE.
    [`273,100,14`,`330,100,28`,`352,83,60`,`12,80,64`],   //15 High saturation/contrast but colors look NICE. Could be adjusted.
    [`29,36,25`,`0,41,45`,`19,86,56`,`125,60,75`],        //16 NICE interesting results, a bit bright in some cases however.
    [`304,33,28`,`349,37,53`,`0,69,63`,`29,88,70`],       //17 NICE tones, but greens are a bit too bright
    [`239,97,16`,`278,28,30`,`330,34,40`,`0,97,61`],      //18 A bit dark in some cases and too bright in others (Green), but NICE.
    [`201,39,28`,`55,74,46`,`192,60,61`,`172,60,70`],     //19 Too bright might be ok if adjusted -20 -20. NICE
    [`0,63,28`,`0,59,47`,`86,45,61`,`54,99,71`],          //20 NICE candy colors. Could work with this
    [`347,47,28`,`0,44,40`,`26,73,54`,`39,98,73`],        //21 NICE also very acceptable candy colors - green a bit bright.
    [`0,9,40`,`20,14,53`,`47,31,67`,`63,69,74`],          //22 Milky bright desaturated colors. Could be good I think +5,-19
    [`225,40,34`,`271,14,41`,`342,40,58`,`353,88,69`],    //23 Interesting one contrasting tones. NICE, I'll try it.
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
    c.fillStyle = `hsl(${cols[3].toString()})`,c.fillRect(bg0*t.width/11, bg0*t.width/11, bg1*t.width/11, bg1*t.height/11);
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

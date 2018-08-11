function pixicon(t, yy, r) {
    // HSL color generator.
    function HSL(t, r, e, i=0) {
        var set = [
            [999*t%360, 24+80*r%40, 26+70*e%40],
            [999*t%360, 9*r%10, 15+36*e%50],
            [999*t%360, 14*r%40, 33+36*e%40],
        ];
        return "hsl("+~~set[i][0]+","+~~set[i][1]+"%,"+~~set[i][2]+"%)";
    }
    // LCG pseudorandom number generator.
    function LCG(seed) {
        function lcg(a) {return a * 48271 % 2147483647}
        seed = seed ? lcg(seed) : lcg(Math.random());
        return function() {return (seed = lcg(seed)) / 2147483648}
    }
    // transform a base HSL color into an alternate color
    function modHSL(str){
    var arr = str.replace(/[^\d,.%]/g, '').split(',').map(x => Number.parseFloat(x, 10));
    return `hsl(${arr[0]-20},${arr[1]-10}%,${arr[2]-7}%)`;
    }
    // pixel array rotation/flip
    // 0 = x flip, 1 = y flip, 2 = 90° rot
    // 3 = 180° rot OR xy flip, 4 = 270° rot
    function rota(arr, mode, w, h) {
        if(mode===3) return arr.slice().reverse();
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

    var 
        c   = t.getContext("2d"),
        n   = 10,
        q   = n*yy,
        l   = n*n,
        a   = [],
        rng = LCG(r),
        symmode = rng()*4|0,
        newMode = rng() > .5;

    if(!newMode) symmode = 2 + symmode%1; //limit symmode if newmode is enabled

    // Erase anything previously on the canvas context.
    c.clearRect(0, 0, t.width, t.height);
    // Reset transformation (for consistent rotation results).
    c.setTransform(1, 0, 0, 1, 0, 0);
    // Set canvas dimensions if not already set.
    // Condition improves performance on subsequent calls to existing canvas (Firefox).
    if(t.width !== q) {
        t.width = t.height = q;
        // Disable filtering when scaling canvas.
        t.style.imageRendering = "-moz-crisp-edges";
        t.style.imageRendering = "pixelated";
    }

    // Multiple passes (only two)
    var num = 0; while(num < 2) {

    // Set fill color for pixels. TODO: make sure no two colors are similar
    var color1 = num ? HSL(rng(), rng(), rng(), rng()*1|0) : HSL(rng(), rng(), rng(), rng()*1|0);
    var color2 = modHSL(color1);
    c.fillStyle = color1;

    // - PATTERN ONE -
    // Generate the number of pixels to occupy (threshold: within 25%-75%).
    var divisor = symmode===3 ? 2 : 2.7;
    var r = rng(), u = 0|((2*r*l+8*r+l)*.125) / divisor;
    // Populate array with an amount of pixels (within threshold).
    for(var s = 0; s < u; s++)
        a[s] = 1 + rng()*1|0;
    // Shuffle pixel array (Fisher–Yates).
    // !!! NOTE: |0 is required to prevent an infinite loop in odd sizes. !!!
    for(var v, s = 0|l/4; s;)
        v = 0|rng() * s--,
        [a[s], a[v]] = [a[v], a[s]];
    var pt1 = a.slice(); a = [];

    // - PATTERN TWO -
    var r = rng(), u = 0|((2*r*l+8*r+l)*.125) / divisor;
    for(var s = 0; s < u; s++)
        a[s] = 1 + rng()*1|0;
    for(var v, s = 0|l/4; s;)
        v = 0|rng() * s--,
        [a[s], a[v]] = [a[v], a[s]];
 
    var pt2 = a.slice(); a = [];


    ////////new mode (inner symmetries method)
   
    if(newMode) {
        var goodlist0 = [1,2,3,4,7,8,9,13,14,19];
        var mask0 = pt1.slice();
        var mask1 = pt2.slice();
        for(var i = 0; i < 25; i++) {
            if(!goodlist0.includes(i)) {
                mask0[i] = undefined;
                mask1[i] = undefined;
            }
        }
        pt1 = rota(pt1,2,5,5);
        pt1 = rota(pt1,0,5,5);
        pt2 = rota(pt2,2,5,5);
        pt2 = rota(pt2,0,5,5);
        //mask = rota(mask,3,25,25);    
        for(var i = 0; i < 25; i++) {
            if(goodlist0.includes(i)) {
                pt1[i] = mask0[i];
                pt2[i] = mask1[i];
            }
        }
    }

    // produce final pixel array.

    var fin = [];
    switch(symmode) {
        case 0:  // Snowflake 3 (Reflected)
        fin = fin.concat(pt1);
        fin = fin.concat(rota(pt1,1,n/2,n/2));
        fin = fin.concat(rota(pt1,0,n/2,n/2));
        fin = fin.concat(rota(pt1,3,n/2,n/2));
        //fin = fin.concat(rota(pt2,3,n/2,n/2));
        break;
        case 1: // Snowflake 2 (dual) - rand patterns look bad
        fin = fin.concat(pt1);
        fin = fin.concat(rota(pt2,4,n/2,n/2));
        fin = fin.concat(rota(pt2,2,n/2,n/2));
        fin = fin.concat(rota(pt1,3,n/2,n/2));
        break;
        case 2: // Snowflake 1
        fin = fin.concat(pt1);
        fin = fin.concat(rota(pt1,4,n/2,n/2));
        fin = fin.concat(rota(pt1,2,n/2,n/2));
        fin = fin.concat(rota(pt1,3,n/2,n/2));
        break;
        case 3: // Robot (horizontal only)
        fin = fin.concat(pt1);
        fin = fin.concat(pt2);
        fin = fin.concat(rota(pt1,0,n/2,n/2));
        fin = fin.concat(rota(pt2,0,n/2,n/2));
        break;
        case 4:  // xxxx
        break;
    }

    var boop = false, Q = 0;
    for(var o = t.width/n, d=y=s= 0; s < l; s++, d = (s%(n/2))) {
        // Change color at halfway point.
        // NOTE: |0 is required for odd size multiples.
        (s === (0|l/2)) && (boop=true,Q+=q/2,y=-1),
        // Increment y axis.
        (s && !d) && y++;
        // Fill a square (pixel) on the canvas (x, y, width, height).
        if(fin[s]) {
            c.beginPath();
            if(boop) {
                c.fillStyle = color2;
            } else {
                c.fillStyle = color1;
            }
        c.fillRect(Q+o*d, o*y, o, o);
        c.fill();
        }
    }
    //end
    num++;
    }

}
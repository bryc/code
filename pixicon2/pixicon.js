function pixicon(t, yy, r) {
    // HSL color generator.
    function HSL(t, r, e, i=0) {
        var set = [
            [999*t%360, 24+80*r%40, 26+70*e%40],
            [999*t%360, 9*r%10, 15+36*e%50],
            [999*t%360, 14*r%40, 37+36*e%40],
        ];
        return "hsl("+~~set[i][0]+","+~~set[i][1]+"%,"+~~set[i][2]+"%)";
    }
    // LCG pseudorandom number generator.
    function LCG(seed) {
        function lcg(a) {return a * 48271 % 2147483647}
        seed = seed ? lcg(seed) : lcg(Math.random());
        return function() {return (seed = lcg(seed)) / 2147483648}
    }

    function modHSL(str){
    var arr = str.replace(/[^\d,.%]/g, '').split(',').map(x => Number.parseFloat(x, 10));
    return `hsl(${arr[0]-25},${arr[1]-10}%,${arr[2]-7}%)`;
    }

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

    var c   = t.getContext("2d"), first;
    // Erase anything previously on the canvas context.
    c.clearRect(0, 0, t.width, t.height);
    // Reset transformation (for consistent rotation results).
    c.setTransform(1, 0, 0, 1, 0, 0);

    var num = 0; while(num < 2) {

    var n   = 10,
        q   = n*yy,
        l   = n*n,
        a   = [],
        rng = LCG(r);

    if(!first) {
        // Determine pixel symmetry mode
        var symmode = rng() > .5;
    }

    // Set canvas dimensions if not already set.
    // Condition improves performance on subsequent calls to existing canvas (Firefox).
    if(t.width !== q) {
        t.width = t.height = q;
        // Disable filtering when scaling canvas.
        t.style.imageRendering = "-moz-crisp-edges";
        t.style.imageRendering = "pixelated";
    }

    // Set fill color for pixels.
    var color1 = num ? HSL(rng(), rng(), rng(), rng()*1|0) : HSL(rng(), rng(), rng(), rng()*1|0);
    var color2 = modHSL(color1);
    c.fillStyle = color1;

    // Generate the number of pixels to occupy (threshold: within 25%-75%).
    var r = rng(), u = 0|((2*r*l+8*r+l)*.125) / 2.4;
    //console.log(u)
    // Populate array with an amount of pixels (within threshold).
    for(var s = 0; s < u; s++)
        a[s] = 1 + rng()*1|0;
    //console.log(u, a.length)
    // Shuffle pixel array (Fisher–Yates).
    // !!! NOTE: |0 is required to prevent an infinite loop in odd sizes. !!!
    for(var v, s = 0|l/4; s;)
        v = 0|rng() * s--,
        [a[s], a[v]] = [a[v], a[s]];


    var pt1 = a.slice();

    a = [];
    var r = rng(), u = 0|((2*r*l+8*r+l)*.125) / 2.4;
    for(var s = 0; s < u; s++)
        a[s] = 1 + rng()*1|0;
    for(var v, s = 0|l/4; s;)
        v = 0|rng() * s--,
        [a[s], a[v]] = [a[v], a[s]];
 

    var pt2 = a.slice();
    a = [];
    var fin = [];
    //symmode = 0
    if(symmode) {
        fin = fin.concat(pt1);
        fin = fin.concat(pt2);
        fin = fin.concat(rota(pt1,0,n/2,n/2));
        fin = fin.concat(rota(pt2,0,n/2,n/2));
    } else {
        fin = fin.concat(pt1);
        fin = fin.concat(rota(pt1,4,n/2,n/2));
        fin = fin.concat(rota(pt1,2,n/2,n/2));
        fin = fin.concat(rota(pt1,3,n/2,n/2));
    }

    var boop = false, Q=0;
    for(var o = t.width/n, d=y=s= 0; s < l; s++, d = (s%(n/2))) {
        // Change color at halfway point.
        // NOTE: |0 is required for odd size multiples.
        (s === (0|l/2)) && (boop=true,Q+=q/2,y=-1),
        // Increment y axis.
        (s && !d) && y++;
        // Fill a square (pixel) on the canvas (x, y, width, height).
        if(fin[s]) {
            if(boop) {
                c.beginPath();
                c.fillStyle = color2;
                c.fillRect(Q+o*d, o*y, o, o);
                c.fill();
            } else {
                c.beginPath();
                c.fillStyle = color1;
                c.fillRect(Q+o*d, o*y, o, o);
                c.fill();
        }


        }
    }
    //end
    num++, first=true;
    }

}
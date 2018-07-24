function pixicon(t, yy, r) {
    // HSL color generator.
    function i(t, r, e, i=0) {
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

    var n   = 8,
        q   = n*yy,
        l   = n*n,
        a   = [],
        rng = LCG(r),
        c   = t.getContext("2d");

    // Set canvas dimensions if not already set.
    // Condition improves performance on subsequent calls to existing canvas (Firefox).
    if(t.width !== q) {
        t.width = t.height = q;
        // Disable filtering when scaling canvas.
        t.style.imageRendering = "-moz-crisp-edges";
        t.style.imageRendering = "pixelated";
    }
    
    // Reset transformation (for consistent rotation results).
    c.setTransform(1, 0, 0, 1, 0, 0);
    // Erase anything previously on the canvas context.
    c.clearRect(0, 0, t.width, t.height);
    // Set fill color for pixels.
    var color1 = i(rng(), rng(), rng(), rng()>=.9 ? 1:0);
    var color2 = i(rng(), rng(), rng(), rng()>=.8 ? 2:0);
    c.fillStyle = color1;

    // Rotate canvas 90 degrees at random.
    rng() > .5 && c.rotate(Math.PI * .5)|c.translate(0, -t.width);

    // Generate the number of pixels to occupy (threshold: within 25%-75%).
    var r = rng(), u = 0|(2*r*l+8*r+l)*.125;
    // Populate array with an amount of pixels (within threshold).
    for(var s = 0; s < u; s++)
        a[s] = 1 + rng()*5|0;

    // Shuffle pixel array (Fisher–Yates).
    // !!! NOTE: |0 is required to prevent an infinite loop in odd sizes. !!!
    for(var v, s = 0|l/2; s;)
        v = 0|rng() * s--,
        [a[s], a[v]] = [a[v], a[s]];

    // Determine pixel roation mode
    var rotmode = rng() > .5;

    // Copy pixel array, then reverse & append (for symmetry).
    if(rotmode) {
        var data = a.slice();
    for(var i = 0; i < data.length; i += 4) {
        data[ i + 0 ] = data[ i + 0 ] ^  data[ i + 3 ]
        data[ i + 3 ] = data[ i + 0 ] ^  data[ i + 3 ]
        data[ i + 0 ] = data[ i + 0 ] ^  data[ i + 3 ]

        data[ i + 1 ] = data[ i + 1 ] ^  data[ i + 2 ]
        data[ i + 2 ] = data[ i + 1 ] ^  data[ i + 2 ]
        data[ i + 1 ] = data[ i + 1 ] ^  data[ i + 2 ]
    }

        a = a.concat(data); 
    } else {
        a = a.concat(a.slice().reverse());
    }




    var boop = false, Q=0;
    for(var o = t.width/n, d=y=s= 0; s < l; s++, d = (s%(n/2))) {
        //console.log(d)
        // Change color at halfway point.
        // NOTE: |0 is required for odd size multiples.
        (s === (0|l/2)) && ( c.fillStyle = color2,boop=true,Q+=q/2,y=-1),
        // Increment y axis.
        (s && !d) && y++;
        // Fill a square (pixel) on the canvas (x, y, width, height).
        if(a[s]) {
            if(boop) {
            c.beginPath();
            switch(a[s]) {
                case 1:
                    c.fillRect(Q+o*d, o*y, o, o)
                    break;
                case 2:
                    c.moveTo(Q+o*d, o*y);
                    c.lineTo(Q+o*d+o, o*y);
                    c.lineTo(Q+o*d+o, o*y+o);
                    break;
                case 3:
                    c.moveTo(Q+o*d, o*y);
                    c.lineTo(Q+o*d, o*y+o);
                    c.lineTo(Q+o*d+o, o*y+o);
                    break;
                case 4:
                    c.moveTo(Q+o*d+o, o*y);
                    c.lineTo(Q+o*d, o*y+o);
                    c.lineTo(Q+o*d+o, o*y+o);
                    break;
                case 5:
                    c.moveTo(Q+o*d+o, o*y);
                    c.lineTo(Q+o*d, o*y);
                    c.lineTo(Q+o*d, o*y+o);
                    break;
            }
            //rng() > .5 ?  : c.arc(o*d+(o/2), o*y+(o/2), o/2, o/2, 5*o*Math.PI);
            c.fill();
        } else {
            c.beginPath();
            if(rotmode) {
                switch(a[s]) {
                    case 1:
                        c.fillRect(Q+o*d, o*y, o, o)
                        break;
                    case 5: //3
                        c.moveTo(Q+o*d, o*y);
                        c.lineTo(Q+o*d+o, o*y);
                        c.lineTo(Q+o*d+o, o*y+o);
                        break;
                    case 4: // 2
                        c.moveTo(Q+o*d, o*y);
                        c.lineTo(Q+o*d, o*y+o);
                        c.lineTo(Q+o*d+o, o*y+o);
                        break;
                    case 3:
                        c.moveTo(Q+o*d+o, o*y);
                        c.lineTo(Q+o*d, o*y+o);
                        c.lineTo(Q+o*d+o, o*y+o);
                        break;
                    case 2:
                        c.moveTo(Q+o*d+o, o*y);
                        c.lineTo(Q+o*d, o*y);
                        c.lineTo(Q+o*d, o*y+o);
                        break;
                }
            } else {
                switch(a[s]) {
                    case 1:
                        c.fillRect(Q+o*d, o*y, o, o)
                        break;
                    case 3: //3
                        c.moveTo(Q+o*d, o*y);
                        c.lineTo(Q+o*d+o, o*y);
                        c.lineTo(Q+o*d+o, o*y+o);
                        break;
                    case 2: // 2
                        c.moveTo(Q+o*d, o*y);
                        c.lineTo(Q+o*d, o*y+o);
                        c.lineTo(Q+o*d+o, o*y+o);
                        break;
                    case 5:
                        c.moveTo(Q+o*d+o, o*y);
                        c.lineTo(Q+o*d, o*y+o);
                        c.lineTo(Q+o*d+o, o*y+o);
                        break;
                    case 4:
                        c.moveTo(Q+o*d+o, o*y);
                        c.lineTo(Q+o*d, o*y);
                        c.lineTo(Q+o*d, o*y+o);
                        break;
                }
            }

            //rng() > .5 ?  : c.arc(o*d+(o/2), o*y+(o/2), o/2, o/2, 5*o*Math.PI);
            c.fill();
        }


        }
    }
}
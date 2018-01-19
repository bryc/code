var bsp = {
    ctx: new AudioContext(),
    speed: 60 / SONG.bpm / (SONG.divide || 4),
    time: 0,
    songLength: SONG.seq[0].length,
    // Debug timing stuff
    count: 0, perf: 0, sub: SONG.seq[0].length, lastVol: []
};

bsp.freq = function() {
    var freq={},i=-57,o="c,c#,d,d#,e,f,f#,g,g#,a,a#,b".split(",");
    for(var n=0,p=0;63>i;i++)freq[o[n++]+p]=440*Math.pow(Math.pow(2,1/12),i),12==n&&(p++,n=0);
    return freq;
}()

document.addEventListener("visibilitychange", function() {
    if (document.hidden) console.log("==== [Visibility Change: Document is HIDDEN]");
    else console.log("====  [Visibility Change: Document is SHOWN]");
});

bsp.worker = (function() {
    var body = function() {
        function tic(n,t){function i(){n(),u||setTimeout(i,t)}var u=0;return i(),function(){u=1}}
        self.onmessage = function(e) {
            tic(function(){self.postMessage(0)}, 5)
        };
};
    var blob = new Blob([body.toString().replace(/(^.*?\{|\}$)/g,"")],{type:"text/javascript"});
    return new Worker(URL.createObjectURL(blob));
}());

//////////////////////////////////////////
var fix = function(n) {
    return Math.round(n*1000)/1000;
};

bsp.schedule = function() {
    for(var n = 0.000501, j = 0; j < SONG.seq.length; j++) {
        for(var i = 0, tick = bsp.time; i < SONG.seq[j].length;) {
            var step = SONG.seq[j][i];
            if(step && bsp.freq[step[0]]) {
                bsp.osc[j].frequency.setValueAtTime((bsp.freq[step[0]]/(SONG.trans||2)), tick);
                if(tick > 0) {
                    bsp.amp[1][j].gain.setValueAtTime(bsp.lastVol[j]||0, fix(tick-n));
                    bsp.amp[1][j].gain.linearRampToValueAtTime(0, tick );
                }
                bsp.amp[1][j].gain.setValueAtTime(0, tick);
                bsp.amp[1][j].gain.linearRampToValueAtTime(step[1] || 1, fix(tick+n));
                bsp.lastVol[j] = step[1] || 1;
            } else if(step) {
                if(tick > 0) {
                    bsp.amp[1][j].gain.setValueAtTime(bsp.lastVol[j]||0, fix(tick-n));
                    bsp.amp[1][j].gain.linearRampToValueAtTime(0, tick );
                }
                bsp.lastVol[j] = 0;
            }
            tick = fix((bsp.time + (++i * bsp.speed)));
        }
    }
    bsp.time = tick;

    var perf = performance.now();
    console.log(
        (++bsp.count) + ": " +
        (bsp.count > 1 ? `Scheduling again @ ${bsp.songLength-bsp.sub}/${bsp.songLength} events` : 'Scheduled song buffer') +
        "|" + Math.round(bsp.songLength * bsp.speed * 1000) +' ms|' + //Math.round((bsp.time/60)*100)/100+" mins|"+
        Math.round(perf - bsp.perf) + " ms since last buffer|" +
        "Buffer ahead by " + Math.round((bsp.time - bsp.ctx.currentTime)*1000) + " ms"
    );
    bsp.perf = perf;
};

bsp.worker.onmessage = function(e) {
    if(bsp.ctx.currentTime >= bsp.time-(bsp.speed*bsp.sub)) {
        bsp.schedule();  
    }
};

bsp.play = function() {
    bsp.osc = [], bsp.amp = [[], []];
    var waves = ["sine", "square", "triangle", "sawtooth"];

    for(var j = 0; j < SONG.seq.length; j++) {
        bsp.osc[j] = bsp.ctx.createOscillator();
        if(SONG.wave[j].constructor === Array) {
            var waveform = bsp.ctx.createPeriodicWave(SONG.wave[j][0], SONG.wave[j][1]);
            bsp.osc[j].setPeriodicWave(waveform);
        } else {
            bsp.osc[j].type = waves[SONG.wave[j]] || waves[1];
        }
        bsp.amp[0][j] = bsp.ctx.createGain(); // Osc Channel Volume 
        bsp.amp[1][j] = bsp.ctx.createGain(); // Osc Note Volume 
        bsp.amp[1][j].gain.value = 0;
        bsp.amp[0][j].gain.value = SONG.cVol[j];
        bsp.osc[j].connect(bsp.amp[1][j]);
        bsp.amp[1][j].connect(bsp.amp[0][j]);
        bsp.amp[0][j].connect(bsp.ctx.destination);
    }
    for(var i = 0; i < bsp.osc.length; i++) bsp.osc[i].start(bsp.ctx.currentTime);
    bsp.schedule();
    bsp.worker.postMessage(0);
};

bsp.play();
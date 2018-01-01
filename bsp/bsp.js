(function(){
/* ------------------------ */


var schedule = function() {
    var SONG = BSP.SONG;
    var fix = function(n){return Math.round(n*1000)/1000;};

    for(var n = 0.000501, j = 0; j < SONG.seq.length; j++) {
        for(var i = 0, tick = BSP.time; i < SONG.seq[j].length;) {
            var step = SONG.seq[j][i];
            if(step && BSP.freq[step[0]]) {
                BSP.osc[j].frequency.setValueAtTime((BSP.freq[step[0]]/(SONG.trans||2)), tick);
                if(tick > 0) {
                    BSP.amp[1][j].gain.setValueAtTime(BSP.lastVol[j]||0, fix(tick-n));
                    BSP.amp[1][j].gain.linearRampToValueAtTime(0, tick );
                }
                BSP.amp[1][j].gain.setValueAtTime(0, tick);
                BSP.amp[1][j].gain.linearRampToValueAtTime(step[1] || 1, fix(tick+n));
                BSP.lastVol[j] = step[1] || 1;
            } else if(step) {
                if(tick > 0) {
                    BSP.amp[1][j].gain.setValueAtTime(BSP.lastVol[j]||0, fix(tick-n));
                    BSP.amp[1][j].gain.linearRampToValueAtTime(0, tick );
                }
                BSP.lastVol[j] = 0;
            }
            tick = fix((BSP.time + (++i * BSP.speed)));
        }
    }
    BSP.time = tick;
};

var startSong = function() {
    var SONG = BSP.SONG;
    BSP.lastVol = [];
    BSP.speed   = 60 / SONG.bpm / (SONG.divide || 4);
    BSP.sub     = SONG.seq[0].length;
    BSP.ctx     = new AudioContext();
    BSP.time    = BSP.ctx.currentTime;
    BSP.osc = [];
    BSP.amp = [[],[]];
    
    // create Oscillators for song.
    var waves = ["sine", "square", "triangle", "sawtooth"];
    for(var j = 0; j < SONG.seq.length; j++) {
        BSP.osc[j] = BSP.ctx.createOscillator();
        if(SONG.wave[j].constructor === Array) {
            var waveform = BSP.ctx.createPeriodicWave(SONG.wave[j][0], SONG.wave[j][1]);
            BSP.osc[j].setPeriodicWave(waveform);
        } else {
            BSP.osc[j].type = waves[SONG.wave[j]] || waves[1];
        }
        BSP.amp[0][j] = BSP.ctx.createGain(); // Osc Channel Volume 
        BSP.amp[1][j] = BSP.ctx.createGain(); // Osc Note Volume 
        BSP.amp[1][j].gain.value = 0;
        BSP.amp[0][j].gain.value = SONG.cVol[j];
        BSP.osc[j].connect(BSP.amp[1][j]);
        BSP.amp[1][j].connect(BSP.amp[0][j]);
        BSP.amp[0][j].connect(BSP.ctx.destination);
    }

    for(var i = 0; i < BSP.osc.length; i++) {
        BSP.osc[i].start(BSP.ctx.currentTime);
    }

    schedule();
    BSP.worker.postMessage(0);
};

/* ---------------------------- 
    func init()
    initialize our program on page load.
---------------------------- */
var init = function() {
    BSP.freq = (function() {
        var freq={},i=-57,o="c,c#,d,d#,e,f,f#,g,g#,a,a#,b".split(",");
        for(var n=0,p=0;63>i;i++)freq[o[n++]+p]=440*Math.pow(Math.pow(2,1/12),i),12==n&&(p++,n=0);
        return freq;
    })();

    BSP.worker = (function() {
        var body = function() {
            function tic(n,t){function i(){n(),u||setTimeout(i,t)}var u=0;return i(),function(){u=1}}
            self.onmessage = function(e) {
                tic(function(){self.postMessage(0)}, 5)
            };
    };
        var blob = new Blob([body.toString().replace(/(^.*?\{|\}$)/g,"")],{type:"text/javascript"});
        return new Worker(URL.createObjectURL(blob));
    }());

    BSP.worker.onmessage = function(e) {
        if(BSP.ctx.currentTime >= BSP.time-(BSP.speed*BSP.sub)) {
            schedule();  
        }
    };

    BSP.play = startSong;
    window.addEventListener("load", function() {
        BSP.play();
    });
};

init();

/* ------------------------ */
})();
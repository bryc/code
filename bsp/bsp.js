(function(){
/* ------------------------ */
var schedule = function() {
    var SONG = BSP.SONG;
    var fix = function(n){return Math.round(n*1000)/1000;};
    var gnt = function(n){return n.substr(0,3).replace("-","");}
 
    for(var n = 0.000501, j = 0; j < SONG.seq.length; j++) {
        for(var i = 0, tick = BSP.time; i < SONG.seq[j].length;) {
            var step = SONG.seq[j][i], note, nlen = 0;
            if(step && step[0] && step[0].length === 4)  // note length parse
                nlen = BSP.speed * (("ABCDEFGQ".indexOf(step[0][3].toUpperCase())+1)/8);

            if(step && step[0] && BSP.freq[gnt(step[0])]) {
                // set Filter cutoff if found
                if(step[4] !== undefined)
                    BSP.Filter[j].frequency.setValueAtTime(step[4], tick);
                // set LFO amount if found
                if(step[3] !== undefined)
                    BSP.modGain[j].gain.setValueAtTime(step[3], tick);
                // set PWM value if found
                if(BSP.osc[j].width && step[2] !== undefined)
                    BSP.osc[j].width.setValueAtTime(step[2], tick);
                // For noise
                if(BSP.osc[j].constructor === AudioBufferSourceNode)
                    // TODO: See if I can adjust the 44100/256 formula for different waveform lengths?
                    BSP.osc[j].playbackRate.setValueAtTime((BSP.freq[gnt(step[0])]/(SONG.trans||2))/(44100/256), tick);
                // only set frequency if OscNode
                if(BSP.osc[j].constructor === OscillatorNode)
                    BSP.osc[j].frequency.setValueAtTime((BSP.freq[gnt(step[0])]/(SONG.trans||2)), tick);
                if(BSP.osc[j].osc1 && BSP.osc[j].osc2 && step[2] !== undefined)
                    BSP.lastPWM[j] = step[2];
                if(BSP.osc[j].osc1 && BSP.osc[j].osc2 && step[5] !== undefined)
                    BSP.lastPWM2[j] = step[5];

                if(BSP.osc[j].osc1 && BSP.osc[j].osc2) {
                    BSP.osc[j].osc1.frequency.setValueAtTime((BSP.freq[gnt(step[0])]/(SONG.trans||2)), tick),
                    BSP.osc[j].osc2.frequency.setValueAtTime((BSP.freq[gnt(step[0])]/(SONG.trans||2)), tick),
                    BSP.osc[j].delay.delayTime.setValueAtTime((1-BSP.lastPWM[j]||0)/BSP.freq[gnt(step[0])], tick);
                    BSP.osc[j].osc2.detune.setValueAtTime(BSP.lastPWM2[j]||0, tick);
                }
                if(tick > 0) {
                    BSP.amp[1][j].gain.setValueAtTime(BSP.lastVol[j]||0, fix(tick-n));
                    BSP.amp[1][j].gain.linearRampToValueAtTime(0, tick );
                }
                BSP.amp[1][j].gain.setValueAtTime(0, nlen ? tick+(BSP.speed-nlen) : tick);
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
    function BufferNode(ctx, rate, data) {
        var buf = ctx.createBuffer(1, data.length, rate);
        buf.getChannelData(0).set(data);
        var bufferSource = ctx.createBufferSource();

        bufferSource.buffer = buf;
        bufferSource.loop = true;

        return bufferSource;
    }

    function CreatePulseOscillator(ctx) {
        var PWM = {},
            osc1 = ctx.createOscillator(),
            osc2 = ctx.createOscillator(),
            inverter = ctx.createGain(),
            output = ctx.createGain(),
            delay = ctx.createDelay();

        osc1.type = "sawtooth", osc2.type = "sawtooth";
        inverter.gain.setValueAtTime(-1, 0);
        delay.delayTime.setValueAtTime(.004, 0); // Hmm

        osc1.connect(output);
        osc2.connect(inverter);
        inverter.connect(delay);
        delay.connect(output);

        PWM.osc1 = osc1, PWM.osc2 = osc2,
        PWM.output = output, PWM.delay = delay;

       // PWM.connect = inverter.connect;
        PWM.start = function(t) { this.osc1.start(t); this.osc2.start(t) };
        PWM.stop = function(t) { this.osc1.stop(t); this.osc2.stop(t) };
        //this.delay.delayTime.value = amt/this.osc1.frequency.value;

        //BSP.osc[j].delay.delayTime.setValueAtTime(step[2] / BSP.osc[j].osc1.frequency.value, tick);
        return PWM;
    }

    var SONG = BSP.SONG;
    BSP.lastVol = [];
    BSP.lastPWM = [];
    BSP.lastPWM2 = [];
    BSP.speed   = 60 / SONG.bpm / (SONG.divide || 4);
    BSP.sub     = SONG.seq[0].length;
    BSP.ctx     = new AudioContext();
    BSP.time    = BSP.ctx.currentTime;
    BSP.osc = [];
    BSP.amp = [[], []];
    BSP.Delay = [];
    BSP.DelayGain = [];
    BSP.Filter = [];
    BSP.modGain = [];
    
    BSP.LFO = BSP.ctx.createOscillator();
    BSP.LFO.type = 'sine';
    BSP.LFO.frequency.setValueAtTime(7.8,0);
    BSP.LFO.start(0);

    // create Oscillators for song.
    var waves = ["sine", "square", "triangle", "sawtooth"];
    BSP.waves = waves;
    for(var j = 0; j < SONG.seq.length; j++) {
        BSP.osc[j] = BSP.ctx.createOscillator();
        // White Noise
        if(SONG.wave && SONG.wave[j]===4) BSP.osc[j] = BufferNode(BSP.ctx, SONG.sampleData[j][0], SONG.sampleData[j][1]);
        // PWM
        if(SONG.wave && SONG.wave[j]===5) BSP.osc[j] = CreatePulseOscillator(BSP.ctx);
        // Periodic wave
        if(SONG.wave && SONG.wave[j] && SONG.wave[j].constructor === Array) {
            var waveform = BSP.ctx.createPeriodicWave(SONG.wave[j][0], SONG.wave[j][1]);
            BSP.osc[j].setPeriodicWave(waveform);
        // Raw Oscillator Waveform
        } else if(SONG.wave && waves[SONG.wave[j]] !== undefined) {
            BSP.osc[j].type = waves[SONG.wave[j]];
        // No waveforms defined
        } else if(!SONG.wave) {
            BSP.osc[j].type = waves[1];
        }
        if(SONG.wave) {
            BSP.modGain[j] = BSP.ctx.createGain();
            BSP.modGain[j].gain.setValueAtTime(0, 0);
            if(SONG.wave[j]===4)
                BSP.modGain[j].connect(BSP.osc[j].playbackRate);
            else if(SONG.wave[j]!==5)
                BSP.modGain[j].connect(BSP.osc[j].frequency);
            else
                BSP.modGain[j].connect(BSP.osc[j].osc1.frequency),
                BSP.modGain[j].connect(BSP.osc[j].osc2.frequency); 
            BSP.LFO.connect(BSP.modGain[j]);
        }

        BSP.amp[0][j] = BSP.ctx.createGain(); // Osc Channel Volume 
        BSP.amp[1][j] = BSP.ctx.createGain(); // Osc Note Volume 
        BSP.amp[1][j].gain.setValueAtTime(0, 0);
        BSP.amp[0][j].gain.setValueAtTime(SONG.cVol&&SONG.cVol[j]?SONG.cVol[j]:1, 0);
        if(SONG.wave && SONG.wave[j]==5) 
            BSP.osc[j].output.connect(BSP.amp[1][j]);
        else
            BSP.osc[j].connect(BSP.amp[1][j]);
        BSP.amp[1][j].connect(BSP.amp[0][j]);

        BSP.Filter[j] = BSP.ctx.createBiquadFilter();
        BSP.Filter[j].frequency.setValueAtTime(18000,0);
        BSP.Filter[j].Q.setValueAtTime(10,0);
        BSP.Filter[j].type = 'lowpass';

        BSP.Delay[j] = BSP.ctx.createDelay(.5);
        BSP.Delay[j].delayTime.setValueAtTime(BSP.speed*2,0)
        BSP.DelayGain[j] = BSP.ctx.createGain();
        BSP.DelayGain[j].gain.setValueAtTime(SONG.delay && SONG.delay[j] ? SONG.delay[j] : 0, 0);

        BSP.Delay[j].connect(BSP.DelayGain[j]);
        BSP.DelayGain[j].connect(BSP.ctx.destination);

        if(SONG.wave) {
            BSP.amp[0][j].connect(BSP.Filter[j]);
            BSP.Filter[j].connect(BSP.Delay[j]);
            BSP.Filter[j].connect(BSP.ctx.destination);

        } else {
            BSP.amp[0][j].connect(BSP.Delay[j]);
            BSP.amp[0][j].connect(BSP.ctx.destination);
        }  
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
    // generate equal temperment frequencies
    BSP.freq = (function() {
        //var JT=[1, 25/24, 9/8, 6/5, 5/4, 4/3, 45/32, 3/2, 8/5, 5/3, 9/5, 15/8];
        var freq={},i=-57,o="c,c#,d,d#,e,f,f#,g,g#,a,a#,b".split(",");
        for(var n=0,p=0;63>i;i++){
            //var Q = Math.floor((i+9)/12);
            var freq1 = 440*Math.pow(Math.pow(2,1/12),i);
            //var freq2 = 261.625*((Q==0)?JT[n]:Math.pow(2,Q)*JT[n]);
            freq[o[n++]+p] = freq1;
            12==n&&(p++,n=0);
        }
        return freq;
    })();

    // use a WebWorker for something. I guess for accurate scheduling.
    BSP.worker = (function() {
        var body = function() {
            function tic(n,t){function i(){n(),u||setTimeout(i,t)}var u=0;return i(),function(){u=1}}
            self.onmessage = function(e) {
                tic(function(){self.postMessage(0)}, 5);
            };
    };
        var blob = new Blob([body.toString().replace(/(^.*?\{|\}$)/g,"")],{type:"text/javascript"});
        return new Worker(URL.createObjectURL(blob));
    }());

    BSP.worker.onmessage = function(e) {
        // if running out of time, schedule the next loop of the song
        if(BSP.ctx.currentTime >= BSP.time-(BSP.speed*BSP.sub)) {
            schedule();  
        }
    };

    window.addEventListener("load", function() {
        startSong();
    });
};

init();

/* ------------------------ */
})();
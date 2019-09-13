var BSP = (function BSP() {
    var filt = ["lowpass","highpass","bandpass","lowshelf","highshelf","peaking","notch","allpass"],
        wave = ["sine","square","triangle","sawtooth"],
        init = [1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

    var BSP = {
        ctx: new AudioContext(), // audio context
        ch: [],                  // sound channels
        timer: 0,                // song timer
        freq:function(){for(var t={},o=-57,a="c,c#,d,d#,e,f,f#,g,g#,a,a#,b".split(","),r=0,e=0;63>o;o++){var c=440*Math.pow(Math.pow(2,1/12),o);t[a[r++]+e]=c,12==r&&(e++,r=0)}return t}()
    };

    // Master Output Gain
    BSP.MasterGain = BSP.ctx.createGain();
    BSP.MasterGain.gain.setValueAtTime(0.08, 0);
    BSP.MasterGain.connect(BSP.ctx.destination);

    // create an BSP Voice set to a specific channel, with its initialized patch
    BSP.BSPSynth = function BSPSynth(params) {
        var ctx = BSP.ctx;
        // LFO
        this.LFO = ctx.createOscillator();
        this.LFOGain1 = ctx.createGain();
        this.LFOGain2 = ctx.createGain();
        this.LFOGain3 = ctx.createGain();
        // Filter
        this.Filter = ctx.createBiquadFilter();
        // Delay
        this.Delay = ctx.createDelay();
        this.DelayGain = ctx.createGain();
        this.DelayFeedback = ctx.createGain();
        // Oscillator
        this.Osc = ctx.createOscillator();
        this.OscGain = ctx.createGain();
        // Connections: LFO
        this.LFO.connect(this.LFOGain1);
        this.LFO.connect(this.LFOGain2);
        this.LFO.connect(this.LFOGain3);
        this.LFOGain1.connect(this.Osc.frequency);
        this.LFOGain2.connect(this.Filter.frequency);
        this.LFOGain3.connect(this.OscGain.gain);
        // Connections: Osc
        this.Osc.connect(this.OscGain);
        this.OscGain.connect(this.Filter);
        // Connections: Delay
        this.Filter.connect(this.Delay);
        this.Delay.connect(this.DelayFeedback);
        this.DelayFeedback.connect(this.Delay);
        this.DelayFeedback.connect(this.DelayGain);
        // Connections: Master
        this.Filter.connect(BSP.MasterGain);
        this.DelayGain.connect(BSP.MasterGain);
        // Patch

        this.setParams(params);
        // Start Oscillators
        this.Osc.start();
        this.LFO.start();
    }

    BSP.BSPSynth.prototype = {
        setParams: function(params, time = 0) {
            this.params = this.params || {};
            var keys = Object.keys(params).map(Number);
            for(var i = 0; i < keys.length; i++) {
                this.params[keys[i]] = params[keys[i]];
                switch(keys[i]) {
                case  0: this.OscGain.gain.setValueAtTime(params[keys[i]],time); break;
                case  1: this.Osc.type = wave[params[keys[i]]]; break;
                case  2: this.DelayGain.gain.setValueAtTime(params[keys[i]],time); break;
                case  3: this.DelayFeedback.gain.setValueAtTime(params[keys[i]],time); break;
                case  4: this.Delay.delayTime.setValueAtTime(params[keys[i]],time); break;
                case  5: this.Filter.type = filt[params[keys[i]]]; break;
                case  6: this.Filter.frequency.setValueAtTime(24000-params[keys[i]]*24,time); break;
                case  7: this.Filter.Q.setValueAtTime(params[keys[i]],time); break;
                case  8: this.Filter.gain.setValueAtTime(params[keys[i]],time); break;
                case  9: this.LFO.type = wave[params[keys[i]]]; break;
                case 10: this.LFO.frequency.setValueAtTime(params[keys[i]],time); break;
                case 11: this.LFOGain1.gain.setValueAtTime(params[keys[i]],time); break;
                case 12: this.LFOGain2.gain.setValueAtTime(params[keys[i]],time); break;
                case 13: this.LFOGain3.gain.setValueAtTime(params[keys[i]],time); break;
                }
            }
        }
    }

    BSP.play = function() {
        var Song = BSP.SONG;
        for(var n = 0.0005, j = 0; j < Song.seq.length; j++) {
            if(!BSP.ch[j]) BSP.ch[j] = new BSP.BSPSynth(Song.patches&&Song.patches[j] || init);
            for(var i = 0, tick = BSP.timer; i < Song.seq[j].length;) {
                var step = Song.seq[j][i];
                if(step && step[0] && step[0][1]==='-') step[0] = step[0].replace("-","");
                if(step && BSP.freq[step[0]]) {
                    if(step[2]) BSP.ch[j].setParams(step[2], tick);
                    var vol = step[1] ? step[1]*BSP.ch[j].params[0] : BSP.ch[j].params[0];
                    BSP.ch[j].OscGain.gain.setTargetAtTime(vol, tick, n);
                    BSP.ch[j].Osc.frequency.setTargetAtTime(BSP.freq[step[0]], tick, 0);
                } else if(step) {
                    BSP.ch[j].OscGain.gain.setTargetAtTime(0, tick, n);
                }
                tick = BSP.timer + (++i * BSP.speed);
            }
        }
        BSP.timer = tick;
    }
    return BSP;
}());
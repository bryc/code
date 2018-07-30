var pianoMap2 = {
    90: 261.626, // C-4
    83: 277.183, // C#-4
    88: 293.665, // D-4
    68: 311.127, // D#-4
    67: 329.628, // E-4
    86: 349.228, // F-4
    71: 369.994, // F#-4
    66: 391.995, // G-4
    72: 415.305, // G#-4
    78: 440.000, // A-4
    74: 466.164, // A#-4
    77: 493.883, // B-4
    188: 523.251, // ---- C-5 dupe
    190: 587.330, // ---- D-5 dupe
    191: 659.255, // ---- E-5 dupe
    81: 523.251, // C-5
    50: 554.365, // C#-5
    87: 587.330, // D-5
    51: 622.254, // D#-5
    69: 659.255, // E-5
    82: 698.456, // F-5
    53: 739.989, // F#-5
    84: 783.991, // G-5
    54: 830.609, // G#-5
    89: 880.000, // A-5
    55: 932.328, // A#-5
    85: 987.767, // B-5
    73: 1046.50, // C-6
    57: 1108.73, // C#-6
    79: 1174.66, // D-6
    48: 1244.51, // D#-6
    80: 1318.51, // E-6
    219: 1396.91, // F-6
    221: 1567.98, // G-6
};



var master = {};


function setWaveform(n,x) {
    switch(n) {
        case '0': x.type = "sine"; break;
        case '1': x.type = "square"; break;
        case '2': x.type = "triangle"; break;
        case '3': x.type = "sawtooth"; break;
    }
}

var Apollo = {
    ch: [],
    ctx: new AudioContext(),
};

// Master Output
Apollo.masterGain = Apollo.ctx.createGain();
Apollo.masterGain.gain.setValueAtTime(0.08, 0);

// Channel 0
Apollo.ch[0] = {};

Apollo.ch[0].AmpEG = 0;
Apollo.ch[0].PitchEnv = 0;
Apollo.ch[0].Atk = 0.05;
Apollo.ch[0].Dec = 0.05;
Apollo.ch[0].Sus = 0;

Apollo.ch[0].EnvGain = Apollo.ctx.createGain(); // default value = 1

Apollo.ch[0].LFO = Apollo.ctx.createOscillator();
Apollo.ch[0].LFO.type = "sine";
Apollo.ch[0].LFO.frequency.setValueAtTime(9, 0);
Apollo.ch[0].LFOAmp = Apollo.ctx.createGain();
Apollo.ch[0].LFOAmp.gain.setValueAtTime(0, 0);
Apollo.ch[0].LFOFilter = Apollo.ctx.createGain();
Apollo.ch[0].LFOFilter.gain.setValueAtTime(0, 0);
Apollo.ch[0].LFOFreq = Apollo.ctx.createGain();
Apollo.ch[0].LFOFreq.gain.setValueAtTime(4, 0);


Apollo.ch[0].LFO.start(0);

Apollo.ch[0].Filter = Apollo.ctx.createBiquadFilter();
Apollo.ch[0].Filter.type = "lowpass";
Apollo.ch[0].FilterBase = 24000;
Apollo.ch[0].FilterEnv = 0;
Apollo.ch[0].Filter.frequency.setValueAtTime(Apollo.ch[0].FilterBase, 0);
Apollo.ch[0].Filter.Q.setValueAtTime(8, 0);

Apollo.ch[0].Delay = Apollo.ctx.createDelay();
Apollo.ch[0].Delay.delayTime.setValueAtTime(0.3, 0);
Apollo.ch[0].DelayFeedback = Apollo.ctx.createGain();
Apollo.ch[0].DelayFeedback.gain.setValueAtTime(0.35, 0);
Apollo.ch[0].DelayLevel = Apollo.ctx.createGain();
Apollo.ch[0].DelayLevel.gain.setValueAtTime(1, 0);
 
Apollo.ch[0].ChGain = Apollo.ctx.createGain();
Apollo.ch[0].ChGain.gain.setValueAtTime(0, 0);

Apollo.ch[0].Osc = Apollo.ctx.createOscillator();
Apollo.ch[0].Osc.type = "sine";
Apollo.ch[0].Osc.start();


// LFO etc.
Apollo.ch[0].LFO.connect(Apollo.ch[0].LFOAmp);
Apollo.ch[0].LFO.connect(Apollo.ch[0].LFOFreq);
Apollo.ch[0].LFO.connect(Apollo.ch[0].LFOFilter);
Apollo.ch[0].LFOAmp.connect(Apollo.ch[0].ChGain.gain);
Apollo.ch[0].LFOFreq.connect(Apollo.ch[0].Osc.frequency);
Apollo.ch[0].LFOFilter.connect(Apollo.ch[0].Filter.frequency);

// Osc
Apollo.ch[0].Osc.connect(Apollo.ch[0].EnvGain);
Apollo.ch[0].EnvGain.connect(Apollo.ch[0].ChGain);
//Apollo.ch[0].EnvGain.connect(Apollo.ch[0].Filter.frequency);
Apollo.ch[0].ChGain.connect(Apollo.ch[0].Filter);

// Delay
Apollo.ch[0].Delay.connect(Apollo.ch[0].DelayFeedback);
Apollo.ch[0].DelayFeedback.connect(Apollo.ch[0].Delay);
Apollo.ch[0].Filter.connect(Apollo.ch[0].Delay);
// Outs
Apollo.ch[0].Filter.connect(Apollo.masterGain);

Apollo.ch[0].DelayFeedback.connect(Apollo.ch[0].DelayLevel);
Apollo.ch[0].DelayLevel.connect(Apollo.masterGain);
Apollo.masterGain.connect(Apollo.ctx.destination);

Apollo.ch[0].active = false;

function noteOn(note, velocity = 1) {
    
    var now = Apollo.ctx.currentTime;
    if(!Apollo.ch[0].active) {
        Apollo.ch[0].active = note;
        Apollo.ch[0].Osc.frequency.setValueAtTime(note, now);
        Apollo.ch[0].ChGain.gain.setValueAtTime(velocity, now);
        //PITCH
        if(Apollo.ch[0].PitchEnv) {
            var clamp = note + 1*Apollo.ch[0].PitchEnv;
            clamp = clamp<0 ? 0 : clamp;
            Apollo.ch[0].Osc.frequency.linearRampToValueAtTime(clamp, now + Apollo.ch[0].Dec);
            ///*uncomment if needed for oneshot*/Apollo.ch[0].ChGain.gain.setValueAtTime(0, now + Apollo.ch[0].Dec);
        }
        //Apollo.ch[0].ChGain.gain.setTargetAtTime(0, now, Apollo.ch[0].Dec/4);
        //Apollo.ch[0].Osc.frequency.linearRampToValueAtTime(note + Apollo.ch[0].Sus*Apollo.ch[0].PitchEnv, now + Apollo.ch[0].Atk + Apollo.ch[0].Dec);
        //FILTER
        Apollo.ch[0].Filter.frequency.setValueAtTime(Apollo.ch[0].FilterBase + 0*Apollo.ch[0].FilterEnv, now);
        Apollo.ch[0].Filter.frequency.linearRampToValueAtTime(Apollo.ch[0].FilterBase + 1*Apollo.ch[0].FilterEnv, now + Apollo.ch[0].Atk);
        Apollo.ch[0].Filter.frequency.linearRampToValueAtTime(Apollo.ch[0].FilterBase + Apollo.ch[0].Sus*Apollo.ch[0].FilterEnv, now + Apollo.ch[0].Atk + Apollo.ch[0].Dec);
        //AMP
        if(Apollo.ch[0].AmpEG) {
            Apollo.ch[0].EnvGain.gain.setValueAtTime(0, now);
            Apollo.ch[0].EnvGain.gain.linearRampToValueAtTime(1, now + Apollo.ch[0].Atk);
            Apollo.ch[0].EnvGain.gain.linearRampToValueAtTime(Apollo.ch[0].Sus, now + Apollo.ch[0].Atk + Apollo.ch[0].Dec);
        } else {
            // make sure EnvGain is at 100% if disabled
            Apollo.ch[0].EnvGain.gain.setValueAtTime(1, now);
        }
    } else {
        Apollo.ch[0].Osc.frequency.linearRampToValueAtTime(note, now);  // for portamento later
    }

//Apollo.ch[0].Filter.frequency.cancelScheduledValues(now);
    
    



    //console.log(Apollo.ch[0].Atk);
    ///* SUS */ Apollo.ch[0].EnvGain.gain.linearRampToValueAtTime(0.5, now+2);
}

function noteOff() {

    var now = Apollo.ctx.currentTime;
    Apollo.ch[0].active = false;
    // off env
    Apollo.ch[0].EnvGain.gain.cancelScheduledValues(now);
    Apollo.ch[0].ChGain.gain.setValueAtTime(0, now);
    Apollo.ch[0].Filter.frequency.cancelScheduledValues(now);
    Apollo.ch[0].Filter.frequency.setValueAtTime(0, now);
    Apollo.ch[0].Osc.frequency.cancelScheduledValues(now);
    //
    //Apollo.ch[0].EnvGain.gain.cancelScheduledValues(now);
    
    //Apollo.ch[0].Filter.frequency.setValueAtTime(0, now);
    ///* REL */ Apollo.ch[0].EnvGain.gain.linearRampToValueAtTime(0, now+2.5);
    //Apollo.ch[0].Osc.stop();
}

// assign events

window.onkeydown = function(e) {
    var note = document.querySelector("input").checked ? pianoMap[e.keyCode] : pianoMap2[e.keyCode]*shit;
    if(note && Apollo.ch[0].active !== note) {
        console.log("NoteOn: ",note, Apollo.ctx.currentTime);
        noteOn(note);
    }
};
window.onkeyup = function(e) {
    var note = document.querySelector("input").checked ? pianoMap[e.keyCode] : pianoMap2[e.keyCode]*shit;
    if(note && Apollo.ch[0].active === note) {
        console.log("NoteOff: ",note, Apollo.ctx.currentTime);
        noteOff();
        //delete active[note];
    }
};

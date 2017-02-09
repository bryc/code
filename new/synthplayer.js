var freq={},i=-57,o="c,c#,d,d#,e,f,f#,g,g#,a,a#,b".split(",");
for(p=n=0;63>i;i++)freq[o[n++]+p]=440*Math.pow(Math.pow(2,1/12),i),12==n&&(p++,n=0);
var waves = ["sine", "square", "triangle", "sawtooth"];

var ctx = new AudioContext();
       var amp = ctx.createGain();
        amp.connect(ctx.destination);
var osc;
var play = function() {
    var speed = SONG.speed/255;
    var now = ctx.currentTime;

    osc = {};
    var amp = {}
    for(var j = 0; j < SONG.seq.length; j++) {
        osc[j] = ctx.createOscillator();
        amp[j] = ctx.createGain();
        amp[j].gain.value = 0;
        amp[j].connect(ctx.destination);
        osc[j].type = waves[SONG.wave[j]] || waves[1];
        osc[j].connect(amp[j]), osc[j].start(now); 

        for(var i = 0; i < SONG.seq[j].length; i++)  {
            var time = i*speed + now;
            var step = SONG.seq[j][i];
            if(step && freq[step[0]]) {
                var note = freq[step[0]];
                osc[j].frequency.setValueAtTime(note, time);
                amp[j].gain.setValueAtTime(step[1]||0.2, time); 
            } else if(step) {
                amp[j].gain.setValueAtTime(0, time);
            } 
        }
       osc[j].stop(time+speed);

    }
    osc[0].onended = play;

}; play();
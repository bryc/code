var freq={},i=-57,o="c,c#,d,d#,e,f,f#,g,g#,a,a#,b".split(",");
for(p=n=0;63>i;i++)freq[o[n++]+p]=440*Math.pow(Math.pow(2,1/12),i),12==n&&(p++,n=0);
var waves = ["sine", "square", "triangle", "sawtooth"];

var ctx = new AudioContext(), amp = ctx.createGain();
amp.connect(ctx.destination);

var play = function() {
    var speed = SONG.speed/255;
    var osc = ctx.createOscillator(), now = ctx.currentTime;
    osc.type = waves[SONG.wave] || waves[1];
    osc.connect(amp), osc.start(now); 

    for(var i = 0; i <= SONG.seq.length; i++)  {
        var time = i*speed + now;
        var note = freq[SONG.seq[i]];
        if(note) {
            osc.frequency.setValueAtTime(note, time);
            amp.gain.setValueAtTime(0.18, time); 
        } else if(SONG.seq[i]) {
            amp.gain.setValueAtTime(0, time);
        } 
    }
    osc.stop(time);
    osc.onended = play;
}; play();
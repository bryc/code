// don't use this code, i have no clue what i'm doing

var freqTable={};
var ctx;
var amp;
var player={};
var song;


function voice(note) {
    if(player.lastOsc) {player.lastOsc.stop()}

    var osc = ctx.createOscillator();
    osc.frequency.value = note;
    osc.type = song.wave || "sine";
    osc.connect(amp);
    osc.start();

    // reference to the last played oscillator so we can stop it
    player.lastOsc = osc;
};

function init() {
    // Abort if song doesn't exist
    if(!song) {return}

    // Generate note frequency table
    var N = "c`c#`d`d#`e`f`f#`g`g#`a`a#`b".split("`");
    for(var i=-57,o=0,n=1; i<=50; i++,n++) {
        freqTable[ N[n-1] + o ] = 440*Math.pow(Math.pow(2,1/12),i);
        if(n===12) {n=0;o++}
    }

    // Create WebAudio Context
    ctx = new AudioContext();

    amp = ctx.createGain();
    amp.gain.value = 0.2; // prevent distortion
    amp.connect(ctx.destination);

    // Initialize player
    player.step = 0;
    player.speed = (song.speed * 1000) / 255;
    player.lastOsc = null;

    player.x = setInterval(this.processStep, player.speed);
};

function processStep() {
    var p = player;
    var seq = song.seq;
    var note = freqTable[seq[p.step]];

    if(note) {voice(note)}
    else if(seq[p.step] == -1) {p.lastOsc.stop()}

    p.step++;
    if(seq.length === p.step) {p.step = 0}
}

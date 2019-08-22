var keymap = {
     90: 48, // C-4
     83: 49, // C#-4
     88: 50, // D-4
     68: 51, // D#-4
     67: 52, // E-4
     86: 53, // F-4
     71: 54, // F#-4
     66: 55, // G-4
     72: 56, // G#-4
     78: 57, // A-4
     74: 58, // A#-4
     77: 59, // B-4
    188: 60, // ---- C-5 dupe
    190: 62, // ---- D-5 dupe
    191: 64, // ---- E-5 dupe
     81: 60, // C-5
     50: 61, // C#-5
     87: 62, // D-5
     51: 63, // D#-5
     69: 64, // E-5
     82: 65, // F-5
     53: 66, // F#-5
     84: 67, // G-5
     54: 68, // G#-5
     89: 69, // A-5
     55: 70, // A#-5
     85: 71, // B-5
     73: 72, // C-6
     57: 73, // C#-6
     79: 74, // D-6
     48: 75, // D#-6
     80: 76, // E-6
    219: 77, // F-6
    221: 79, // F#6 or G-6????
};

window.onkeydown = function(e) {
    if(selTable === 'pattern' && current && keymap[e.keyCode]) {
        //console.log(current.parentNode)
        var note = current.patIdx;
        if(!patData[song.Pattern]) patData[song.Pattern] = [];
        patData[song.Pattern][note] = [];
        if(patData[song.Pattern][note]) patData[song.Pattern][note][0] = keymap[e.keyCode]+song.Octave*12;
        // document exactly what happens here
        else patData[song.Pattern][note] = [keymap[e.keyCode]+song.Octave*12];
        current.innerHTML = freq[keymap[e.keyCode]+song.Octave*12][1].toUpperCase();
    } else if(selTable === 'pattern' && current && e.keyCode === 46) {
        var note = current.patIdx;
        patData[song.Pattern][note] = undefined;
        current.innerHTML = "";
    } else if(selTable === 'pattern' && current && e.keyCode === 192) {
        var note = current.patIdx;
        patData[song.Pattern][note] = -1;
        current.innerHTML = "<b style=color:red>OFF</b>";
    }
//
    if(selTable === 'sequesnce' && current) {
        //console.log(current.parentNode)
        //var note = current.patIdx;
        //if(!patData[song.Pattern]) patData[song.Pattern] = [];
        //patData[song.Pattern][note] = [];
        //if(patData[song.Pattern][note]) patData[song.Pattern][note][0] = keymap[e.keyCode]+song.Octave*12;
        // document exactly what happens here
        //else patData[song.Pattern][note] = [keymap[e.keyCode]+song.Octave*12];
        //current.innerHTML = freq[keymap[e.keyCode]+song.Octave*12][1].toUpperCase();
        current.innerHTML = e.keyCode;
    } else if(selTable === 'sequsence' && current && e.keyCode === 46) {
        //var note = current.patIdx;
        //patData[song.Pattern][note] = undefined;
        current.innerHTML = "";
    }
};

var frq0 = function(){for(var t={},o=-57,a="c-,c#,d-,d#,e-,f-,f#,g-,g#,a-,a#,b-".split(","),r=0,e=0;63>o;o++){var c=440*Math.pow(Math.pow(2,1/12),o);t[a[r++]+e]=c,12==r&&(e++,r=0)}return t}()
var frq1 = Object.keys(frq0);
//console.log(frq1.length);
for(var freq=[],i=0;i<frq1.length;i++) {
    freq[i]=[frq0[frq1[i]],frq1[i]];
}

function replace(target, replacement) {
    while(target.firstChild) target.removeChild(target.firstChild);
    target.appendChild(replacement);
}

function elem(options) {
    var el = document.createDocumentFragment();
    var tag = options[0];
    var prop = options[1];

    if(typeof tag === "string") {
        el = document.createElement(tag);
    }

    if(typeof prop === "object") {
        for (var item in prop) {
            el[item] = prop[item];
        }
    } else if(prop) {
        el.innerHTML = prop;
    }

    for(var i = 1; i < arguments.length; i++) {
        if(arguments[i].nodeType > 0) {
            el.appendChild(arguments[i]);
        }
    }

    return el;
}


var song = {Octave:0, Pattern:0, Sequence:0};
var current, previous, selTable;
var inputs = document.querySelectorAll("input");
var patData = [];
var seqData = [];

for(var i = 0; i < inputs.length; i++) {
    var el = inputs[i];
    switch(el.id) {
        case "Oct":
        el.oninput = function() {
            song.Octave = this.value;
        }
        break;
        case "Pat":
        el.oninput = function() {
            song.Pattern = this.value; //index
            buildEditTable();
        }
        break;
        case "Seq":
        el.oninput = function() {
            song.Sequence = this.value; //index
            if(seqData[song.Sequence] !== undefined) {
                document.querySelector("span#seqDisp").innerHTML = seqData[song.Sequence];
            } else {
                document.querySelector("span#seqDisp").innerHTML = "-";
            }
        }
        break;
        default:
        el.oninput = function() {
        buildEditTable();
        buildEditTable2();
        }
    }
}

//document.querySelector("button#SetSeq").onclick = function() {
//    seqData[song.Sequence] = song.Pattern;
//    document.querySelector("span#seqDisp").innerHTML = song.Pattern;
//}


function buildEditTable() {
    var steps = Number(document.getElementById('SpB').value);
    var beats = Number(document.getElementById('BpB').value);
    var bars  = Number(document.getElementById('BpP').value);
    var bpm   = Number(document.getElementById('BPM').value);

 
    var out = elem([]);

    for(var i0=0,i = 0; i < bars; i++) {

        
        var tr = elem(["tr"]);
        var total = steps*beats;
        for(var j1=0,j0=0,j = 0; j < total; j++) {
            var td = elem(["td"]);
            td.className = j1 ? 'aa':'bb';
            if(++j0 === steps && j < total-1) {j1^=1;j0=0;td.style.borderRight="2px solid #888"}
            td.innerHTML = "";
            td.patIdx = i0++;
            td.onclick = function() {
                if(current) prev = current, prev.style.outline="";
                current = this;
                current.style.outline="2px solid #0070AF";
                selTable = 'pattern';
                //console.dir(this)
                //this.innerHTML = this.patIdx;
            }
            tr.appendChild(td);
        }
        out.appendChild(tr);
    }

    if(!patData[song.Pattern]) {
        patData[song.Pattern] = [];
    }

    var xxxx = out.querySelectorAll("td");

        for(var i = 0; i < patData[song.Pattern].length; i++) {
            if(patData[song.Pattern][i])
            xxxx[i].innerHTML = freq[patData[song.Pattern][i]][1].toUpperCase();
        }
    
    console.log(patData)
    replace(document.querySelector("table.edit"), out);
}


function buildEditTable2() {
    var steps = Number(document.getElementById('r0w').value);
    var r0ws  = Number(document.getElementById('chn').value);
 
    var out = elem([]);

    for(var i0=0,i = 0; i < r0ws; i++) {

        
        var tr = elem(["tr"]);
        var total = steps;
        for(var j1=0,j0=0,j = 0; j < total; j++) {
            var td = elem(["td"]);
            td.contentEditable = true;
            td.onkeydown = function(e) {
                var keycode = e.keyCode;
                var bad = 
                //(keycode > 47 && keycode < 58)   || // number keys
                keycode == 32 || keycode == 13   || // spacebar & return key(s) (if you want to allow carriage returns)
                (keycode > 64 && keycode < 91)   || // letter keys
                (keycode > 95 && keycode < 112)  || // numpad keys
                (keycode > 185 && keycode < 193) || // ;=,-./` (in order)
                (keycode > 218 && keycode < 223);   // [\]' (in order)
                if(bad) return false;


             //this.innerText = this.innerText.replace(/[^\d]+/g,'')   
            }
            td.onkeypress = function() {
                
                if(document.getSelection().toString() === this.innerText) this.innerText = ""
                return (this.innerText.length < 3)
                
            }
            td.className = j1 ? 'aa':'bb';
            //td.style.borderRight="2px solid #888"
            td.innerHTML = "";
            td.patIdx = i0++;
            td.onclick = function() {
                if(current) prev = current, prev.style.outline="";
                current = this;
                current.style.outline="2px solid #0070AF";
                selTable = 'sequence';
                //console.dir(this)
                //this.innerHTML = this.patIdx;
            }
            tr.appendChild(td);
        }
        out.appendChild(tr);
    }

    if(!patData[song.Pattern]) {
        patData[song.Pattern] = [];
    }

    var xxxx = out.querySelectorAll("td");

        for(var i = 0; i < patData[song.Pattern].length; i++) {
            if(patData[song.Pattern][i])
            xxxx[i].innerHTML = freq[patData[song.Pattern][i]][1].toUpperCase();
        }
    
    console.log(patData)
    replace(document.querySelector("table.edit2"), out);
}


buildEditTable();
buildEditTable2();
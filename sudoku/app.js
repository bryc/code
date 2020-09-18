function bmap(val, mode = 0) {
    var i, data = mode ? [...val].map(a=>a.charCodeAt()) : val.slice(),
    tbl = [
        0x22, 0x26, 0x27, 0x3C, 0x3E, 0xB8, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 
        0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 
        0x1A, 0x1B, 0x1C, 0x1D, 0x1E, 0x1F, 0x20, 0x7F, 0x80, 0x81, 0x82, 0x83, 0x84, 0x85, 0x86, 0x87, 
        0x88, 0x89, 0x8A, 0x8B, 0x8C, 0x8D, 0x8E, 0x8F, 0x90, 0x91, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97, 
        0x98, 0x99, 0x9A, 0x9B, 0x9C, 0x9D, 0x9E, 0x9F, 0xA0, 0xAD
    ];
    for(i = 0; i < val.length; i++) {
        var idx = tbl.indexOf(data[i]);
        if(mode ? data[i]>255 : idx>-1) data[i] = mode ? tbl[data[i]-0x100] : 0x100+idx;
    } 
    return mode ? data : String.fromCharCode.apply(0,data);
}
arst=a=>{return a.trim?[...a].map(a=>a.charCodeAt()):String.fromCharCode.apply(0,a)}

function cksm(d){for(var i=s=0;i<d.length;++i)s+=(s<<1)+d[i];s^=s<<9;s^=s<<16;return s>>>0}
function eee(r,e){for(var n,f=[],o=0,t=[],h=0;256>h;h++)f[h]=h;for(h=0;256>h;h++)o=(o+f[h]+e[h%e.length])%256,n=f[h],f[h]=f[o],f[o]=n;h=0,o=0;for(var u=0;u<r.length;u++)h=(h+1)%256,o=(o+f[h])%256,n=f[h],f[h]=f[o],f[o]=n,t.push(r[u]^f[(f[h]+f[o])%256]);return t}

var crc8 = function(data) {
    for(var i=256, tbl=[], crc, j; i--; tbl[i]=crc&0xFF){
        j=8;for(crc=i;j--;)crc=crc&128?(crc<<1)^0x5a:crc<<1;
    }
    return function(data) {
        for(var i=0, crc=0; i<data.length; ++i)
            crc=tbl[(crc^data[i])%256];
        return crc;
    }
}();

function loadPuzzle(str2) {
    if(!str2) {return}
    //   console.log(arst(str2) );
    // decode base64 to string
    var err = 0;
    //var str = atob(str2);
   // console.log(str2)
    var arr = arst(atob(str2));
   // console.log(arr)
    //var arr = arrstr(str);

    arr = [arr[0]].concat(eee(arr.slice(1), [arr[0]]) );
        var hex = Array.prototype.map.call(arr, x => ('00'+x.toString(16).toUpperCase()).slice(-2)).join(' ');
 //   console.log(arr.length, hex);
    // load nibble-frames into data array
    for(var i=1, data=[], sum, sum2; i<arr.length; i++) {
        var byte = arr[i];
        var nib1 = (byte & 0xF0) >> 4
        var nib2 = byte & 0x0F;
        data.push(nib1);
        // if the last nibble is 0, skip it (for odd nibble counts)
        if(i === arr.length-1 && nib2 === 0) break;
        data.push(nib2);
    }
    sum = arr[0]; sum2 = crc8(arr.slice(1));
    if(sum !== sum2) {
        err++;
        console.error("ERROR:", "Data checksum is invalid.");
    }
    // check data
    for(var t=0,i = 0, last; i < data.length; i++) {
        var c = data[i];
        // Check code 15 ----------------------------------------------------------
        if(c === 15 && data[i + 1] !== undefined && data[i + 2] !== undefined) {
            var digit = (data[i+1]<<4) + data[i+2];
            if(digit<16 || digit>80) {
                err++;
                console.error("ERROR:", "At position:", i, "Code 15 has bad size:", digit);
            }
        } else if(c === 15 && (data[i + 1] === undefined || data[i + 2] === undefined)) {
            err++;
            console.error("ERROR:", "At position:", i, "Code 15 is missing data");
            break;
        }
        // Check code 14 ----------------------------------------------------------
        if(c === 14 && data[i + 1] !== undefined) {
            var digit = data[i+1];
            if(digit<6) {
                err++;
                console.error("ERROR:", "At position:", i, "Code 14 has bad size:", digit);
            }
        } else if(c === 14 && data[i + 1] === undefined) {
            err++;
            console.error("ERROR:", "At position:", i, "Code 14 is missing data");
            break;
        }
        // Check for repeating compression codes
        if(
            ((c > 9 && c < 16)) &&
            ((last > 9 && last < 16))
        ) {
            err++;
            console.error("ERROR:", "At position:", i, "Compression code repeat: ", "current:" + c, "last:" + last);
        }
        last = c;
        // Check how many cells represented in the data
        switch(c) {
            case 0xA: t+=2; break;
            case 0xB: t+=3; break;
            case 0xC: t+=4; break;
            case 0xD: t+=5; break;
            case 0xE: t+=data[i+1]; i += 1; break;
            case 0xF: t+=(data[i+1]<<4)+data[i+2]; i += 2; break;
            default : t+=1;
        }
        if(t > 81) {
            err++;
            console.error("ERROR:", "Data contains more than 81 cells.");
            break;
        }
    }
    if((last > 9 && last < 16)) {
        err++;
        console.error("ERROR:", "Compression code cannot be final frame in sequence.");
    }
    if(err > 0) {
        input.style.border = "1px solid red";
        //input.style.background = "#FFF7F7";
        return false;
    } else {
        input.style.border = "";
        //input.style.background = "";
    }
    info.innerHTML = "puzzHash: <code>" + cksm(arr).toString(36) + "</code>";
    for(var i = k = 0, t, y; i<81; i++, k++) {
        switch(data[k]) {
            case 0xA: y=1; t=2; break;
            case 0xB: y=1; t=3; break;
            case 0xC: y=1; t=4; break;
            case 0xD: y=1; t=5; break;
            case 0xE: y=2; t=data[k+1]; break;
            case 0xF: y=3; t=(data[k+1]<<4)+data[k+2]; break;
            default : y=0; t=0;
        }
        for(j=0; j<t; j++, i++) tbl[i].innerHTML="";
        k += y;

        tbl[i].innerHTML = data[k] ? data[k]:"";
    }
    input.value = str2;
}

function savePuzzle() {
    for(var i=j=0, data=[]; i<tbl.length; i++) {
        var c = parseInt(tbl[i].textContent) || "";
        if(c === "") j++;
        else {
            switch(true) {
                case j==2: data.push(0xA); break;
                case j==3: data.push(0xB); break;
                case j==4: data.push(0xC); break;
                case j==5: data.push(0xD); break;
                case j>15: data.push(0xF,j>>4,j&0xF); break;
                case j>5 : data.push(0xE,j); break;
                default  : while(j--) data.push(0);
            }
            j = 0; data.push(c);
        }
    }
    var packed = [];
    for(var i = 0, len = data.length; i<len; i += 2) {
        var b = (i!==len-1)?data[i+1]:0; // 0 for missing nibble
        packed.push((data[i]<<4) + b);
    }

    var crc = crc8(packed);
    var output = [crc].concat(eee(packed,[crc]));
    return btoa(arst(output)).replace(/=/g,"");
}
//////////////////////////////////////////////////////
var tbl, info, input;
window.onload = function() {
    tbl   = document.querySelectorAll("table.sudoku td");
    info  = document.querySelector("div.info");
    input = document.querySelector("input.code");
    for(var i = 0,y = true; i < tbl.length; i++) {
        tbl[i].contentEditable = "true";
        tbl[i].oninput = function(e) {
            if(e.data!=this.solution) this.classList.add('cellerror');
            else { this.classList.remove('cellerror'); }
            if(this.textContent===hicur) lolwut.push(this),this.classList.add('hinum');
            if(this.textContent!==hicur) this.classList.remove('hinum');
            loadPuzzle(savePuzzle());
        }
        tbl[i].onkeypress = function(e) {
            if(e.keyCode<48||e.keyCode>57)return false;
            this.textContent = "";
        };
        tbl[i].addEventListener('focus', function(){
          this.classList.add('isfoc');
        });

        tbl[i].addEventListener('blur', function(){
          this.classList.remove('isfoc');
        });
        var hicur, lolwut = [], lolwut2 = [];
        tbl[i].onclick = function(e) {

        for(var i = 0; i < lolwut2.length; i++)
            lolwut2[i].classList.remove('hibak');

        const idx = [...this.parentElement.children].indexOf(this);
        lolwut2 = Array.from(document.querySelectorAll('td'))
          .filter(el =>  el.id === this.id || el.parentNode === this.parentNode);
          for(var i = 0; i < 9; i++) lolwut2.push(tbl[i*9+idx]);

        for(var i = 0; i < lolwut2.length; i++)
            lolwut2[i].classList.add('hibak');

        ////////////////////////////////////////////////////////////////////////////////////
            if(this.textContent==="") return;
        for(var i = 0; i < lolwut.length; i++)
            lolwut[i].classList.remove('hinum');
        // if currently highlighted 

        if(this.textContent===hicur) {hicur='';return;}

        if(this.textContent!=="") hicur = this.textContent;

        lolwut = Array.from(document.querySelectorAll('td'))
          .filter(el => el.textContent === this.textContent);

        for(var i = 0; i < lolwut.length; i++)
            lolwut[i].classList.add('hinum');
        }

    }
    input.oninput = function() {
        if(input.value==""){for(j=0;j<81;j++)tbl[j].innerHTML=""}

        if(input.value.length===81) {
            for(var packed=[], i = 0; i < 81; i += 2) {
                var num1 = Number(input.value[i]);
                var num2 = Number(input.value[i+1]);

                var digit = 0;
                if(num1 >= 1 && num1 <= 9) digit += num1<<4;
                if(num2 >= 1 && num2 <= 9) digit += num2;
                packed.push(digit);
            }
            var crc = crc8(packed);
            var output = [crc].concat(eee(packed,[crc]))
            console.log(output);
            loadPuzzle( btoa(arst(output)).replace(/=/g,"") );

        } else {
            loadPuzzle(input.value);
        }
        //var b64 = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}|[A-Za-z0-9+/]{2})$/;
        //if(b64.test(input.value))
            
    };
};
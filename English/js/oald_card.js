function clearAndFocus(id, focus) {
    var inputCtrl = document.getElementById(id);
   
    inputCtrl.value="";
    if (focus) {
        inputCtrl.focus();
    }
}
var entries,
    current = 0,
    splitterStr = " – ",
    wordsIndex = [],
    wordsHistory = [],
    audios = null,
    functions = null;

init();

function toggleSettings() {
    $('#settings').toggle();
    $('#wordCard').toggle();
    $("#goTo").toggle();
    applyFontSizes();
}

function play(index) {
    autoplayOff();
    audios[index].play();
}

function autoplay() {
    initAutoplay();
    if (audios != null) {
        audios[0].play();
    }
}

function moveRight() {
    incrementCurrent();

    wordsHistory = [];

    autoplayOff();
    audios = null;

    showCurrent();
}

function incrementCurrent() {
    var r = document.getElementsByName('learnRange');

    current++;
    if (r[0].checked) { // all
        if (current == entries.length) {
            current = 0;
        }
    }
    else { // range
        var learnFrom = document.getElementById('learnFrom').value;
        var learnTo = document.getElementById('learnTo').value;
        if ((current + 1) > learnTo) {
            current = learnFrom - 1;
        }
    }
}

function moveLeft() {
    decrementCurrent()

    wordsHistory = [];

    autoplayOff();
    audios = null;

    showCurrent();
}

function decrementCurrent() {
    var r = document.getElementsByName('learnRange');

    current--;
    if (r[0].checked) { // all
        if (current == -1) {
            current = entries.length - 1;
        }
    }
    else { // range
        var learnFrom = document.getElementById('learnFrom').value;
        var learnTo = document.getElementById('learnTo').value;
        if ((current + 1) < learnFrom) {
            current = learnTo - 1;
        }
    }
}

function checkRange() {
    var r = document.getElementsByName('learnRange');

    if (r[0].checked) { // all
        return;
    }
    else { // range
        var learnFrom = document.getElementById('learnFrom').value;
        var learnTo = document.getElementById('learnTo').value;
        if ((current + 1) < learnFrom) {
            current = learnTo - 1;
        }
        else if ((current + 1) > learnTo) {
            if (current != (entries.length - 1)) {
                current = learnFrom - 1;
            }
        }
    }
}

function goToWord() {
    var word = document.getElementById('goToWord').value.toLowerCase();
    var index = wordsIndex.indexOf(word);
    if (index < 0) {
        if (word == '') {
            index = parseInt(document.getElementById('goToIndex').value);
            if (!isNaN(index)) {
                if (index > entries.length) {
                    index = entries.length - 1;
                }
                else if (index < 1) {
                    index = 0;
                }
                else {
                    index--;
                }
                document.getElementById('goToIndex').value = index + 1;
            }
            else {
                console.log('isNaN');
            }
        }
        else {
            console.log('<0');
            return;
        }
    }

    wordsHistory[wordsHistory.length] = current;

    current = index;

    autoplayOff();
    audios = null;

    showCurrent();
}

function goBack() {
    if (wordsHistory.length == 0) {
        return;
    }

    current = wordsHistory.pop();

    autoplayOff();
    audios = null;

    showCurrent();
}

function init() {
    $('#settings').toggle();
    $('#wordCard').toggle();
    $("#goTo").toggle();

    entriesCount();

    current = 0;
    checkRange();

    functions = null;
    audios = null;

    showCurrent();
};

function entriesCount() {
    var text = $("#vocabulary").val();

    var emptyEntriesExist = false;
    var tmp = text.split("\n");
    for (var i = 0; i < tmp.length; i++) {
        if (tmp[i] == '') {
            entries = [];
            for (var i = 0; i < tmp.length; i++) {
                if (tmp[i] != '') {
                    entries[entries.length] = tmp[i];
                }
            }
            emptyEntriesExist = true;
            break;
        }
    }

    if (!emptyEntriesExist) {
        entries = tmp;
    }

    wordsIndex = [];
    wordsHistory = [];
    for (var i = 0; i < entries.length; i++) {
        wordsIndex[i] = entries[i].substring(0, entries[i].indexOf(splitterStr));
    }

    document.getElementById('entriesTotal').innerHTML = entries.length;
}

function showCurrent() {
    if (entries[current] == "") {
        return;
    }

    var currentEntry = entries[current];
    var parts = currentEntry.split(splitterStr);

    $("#word").html(parts[0]);
    $("#pos").html(parts[1]);

    makeAudioHTML(parts[6]);
    if (document.getElementById("autoplay").checked) {
        autoplay();
    }

    $("#transcription").html(styleTranscription(parts[2]));
    //$("#comment").html(parts[3] != "" ? parts[3] : "...");
    $("#comment").html(parts[3]);

    $("#translation").html(parts[4]);
    $("#examples").html(parts[5]);

    document.title = parts[0] + " - Oald card";

    var rangeStr = '';
    if (document.getElementById('displayRange').checked) {
        var r = document.getElementsByName('learnRange');
        if (!r[0].checked) { // range
            var learnFrom = document.getElementById('learnFrom').value;
            var learnTo = document.getElementById('learnTo').value;
            rangeStr = ', [' + learnFrom + '-' + learnTo + ']';
        }
        else {
            rangeStr = ', *';
        }
    }
    
    document.getElementById('progress').innerHTML = (current + 1) + '\/' + entries.length + rangeStr;

    applyFontSizes();
}

function styleTranscription(transcription) {
    var mapObj = {
        BrE:"<span class='breLight'>BrE</span>",
        NAmE:"<span class='nameLight'>NAmE</span>"
    };
    return transcription.replace(/BrE|NAmE/g, function(matched){
        return mapObj[matched];
    });
}

function makeAudioHTML(txt) {
    if (txt == "" || typeof txt == 'undefined' || txt == null) {
        $("#audioLinks").html('');
        return;
    }

    if (audios != null) {
        return;
    }

    audios = [];

    var bre = "BrE";
    var name = "NAmE";

    var parts = txt.split("; ");

    var audioLinksHTML = "";

    var audioAutoRunElem = $("#audioAutoRun");
    audioAutoRunElem.html("");

    var path = $("#audioPath").val();
    var isMp3 = document.getElementById("Mp3").checked;

    var currentIndex;

    for (var i = 0; i < parts.length; i++) {
        if (isMp3) {
            if (parts[i].toLowerCase().endsWith("ogg")) {
                continue;
            }
        }
        else { // "Ogg"
            if (parts[i].toLowerCase().endsWith("mp3")) {
                continue;
            }
        }

        currentIndex = audios.length;

        var audioStr = "<audio id=\"audio" + currentIndex + "\">";
        audioStr += "<source src=\"" + path + parts[i].substring(parts[i].lastIndexOf('/') + 1)
                    + "\" type=\"" + (isMp3 ? "audio/mpeg\">" : "audio/ogg\">") + "</audio>";

        audioAutoRunElem.append(audioStr);

        audios[currentIndex] = document.getElementById("audio" + currentIndex);

        var span = '<span id="audioSpn' + currentIndex + '"'
                 + 'onclick="play(' + currentIndex + ')';
        if (parts[i].startsWith(bre)) {
            span +=  '" class="bre"' + currentIndex + ')">';
            span += bre + '<img src="img/icon-audio-bre.png">';
        }
        else { // "NAmE"
            span +=  '" class="name"' + currentIndex + ')">';
            span += name + '<img src="img/icon-audio-name.png">';
        }
        span += '</span>';

        audioLinksHTML += span + '\n';
    }

    audioLinksHTML += '<span id="playAll" onclick=autoplay()>Play all <img src="img/play-all-normal.png"></span>';

    $("#audioLinks").html(audioLinksHTML);
}

function initAutoplay() {
    console.log('initAutoplay()...');

    if (typeof audios == 'undefined' || audios == null) {
        console.log("Exit initAutoplay(). (01)");
        return;
    }
    if (functions != null) {
        console.log("Exit initAutoplay(). (02)");
        return;
    }

    functions = [];

    function playNext(i) {
        return function() {
            var span = document.getElementById('audioSpn' + (i + 1));
            span.style.visibility = 'visible';

            var element = document.getElementById('audio' + (i + 1));
            element.play();
        };
    }

    for (var i = 0; i < audios.length - 1; i++) {
        functions[i] = playNext(i);
    }

    functions[audios.length - 1] = function() {
        document.getElementById('playAll').style.visibility = 'visible';
    }

    for (var i = 0; i < audios.length; i++) {
        audios[i].addEventListener('ended',
            functions[i]
        );
    }

    document.getElementById("audioSpn0").style.visibility = 'visible';
    console.log('initAutoplay() end.')
}

function autoplayOff() {
    if (typeof audios == 'undefined' || audios == null) {
        //console.log("Exit autoplayOff(). (01)");
        return;
    }
    if (functions == null) {
        //console.log("Exit autoplayOff(). (02)");
        return;
    }

    for (var i = 0; i < audios.length; i++) {
        audios[i].removeEventListener('ended',
            functions[i]);
    }
    functions = null;
}

// http://stackoverflow.com/questions/14446447/javascript-read-local-text-file
//
function openFile(event) {
    var input = event.target;

    var reader = new FileReader();
    reader.onload = function(){
        document.getElementById('vocabulary').value = reader.result;
        entriesCount();
    };

    reader.readAsText(input.files[0]);
};

function applyFontSizes() {
    function scaleFont(element, defaultSize, scale) {
        try {
            element.style["font-size"] = defaultSize * scale + 'pt';
        }
        catch (exception) {
            console.log('**applyFontSizes() exception...');
        }
    }

    var scale;
    try {
        scale = document.getElementById('scale').value;
        scale = scale.replace(',', '.');
        scale = parseFloat(scale);
    }
    catch (exception) {
        scale = 1;
    }

    if (scale < 0.1) {
        scale = 1;
    }
    else if (scale > 5) {
        scale = 5;
    }

    document.getElementById('scale').value = scale;

    scaleFont(document.getElementById('word'), 24, scale);
    scaleFont(document.getElementById('pos'), 16, scale);
    scaleFont(document.getElementById('transcription'), 16, scale);
    scaleFont(document.getElementById('comment'), 16, scale);
    scaleFont(document.getElementById('translation'), 20, scale);
    scaleFont(document.getElementById('examples'), 16, scale);

    var spans = document.getElementsByTagName('span');
    for (var i = 0; i < spans.length; i++) {
        scaleFont(spans[i], 16, scale);
    }
    
    scaleFont(document.getElementById('goToWord'), 16, scale);
    scaleFont(document.getElementById('goToIndex'), 16, scale);
}


// Script Parameters.

const splitterStr = " – ",
      exampleSplitter = ' ### ',
      processSelection = false;


//  Variables.

var entries = [],
    currentIndex = 0,
    wordsIndex = [],
    wordsHistory = [],
    audios = null,
    functions = null,
    chkLearnRange = document.getElementsByName('learnRange'),
    linkedWords = [],
    linkedText = []
    lastSelectedWord = '',
    replaceToLiRe = new RegExp(exampleSplitter, 'g'),
    seeRe = /<see>(.*?)<\/see>/g,
    see2Re = /(<see>.*?<\/see>)/g,
    exmplLnkRe = /<exmpl-lnk>(.*?)<\/exmpl-lnk>/g,
    exmplLnk2Re = /(<exmpl-lnk>.*?<\/exmpl-lnk>)/g,
    wordLnkRe = /(.*?)<word-lnk>(.*?)<\/word-lnk>/g;


// Initialization.

init();


// Functions.

function clearAndFocus(id, focus) {
    var inputCtrl = document.getElementById(id);

    inputCtrl.value="";
    if (focus) {
        inputCtrl.focus();
    }
}

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

function autoplay(playAudio) {
    initAutoplay(playAudio);
    if (audios != null) {
		if (playAudio) {
			audios[0].play();
		}
		else {
			var event = new Event('ended');
			audios[0].dispatchEvent(event);
		}
    }
}

function moveRight() {
    incrementCurrent();

    nextWord();
}

function nextWord() {
    autoplayOff();
    audios = null;

    showCurrent();
}

function incrementCurrent() {
    currentIndex++;
    if (chkLearnRange[0].checked) { // all
        if (currentIndex == entries.length) {
            currentIndex = 0;
        }
    }
    else { // range
        var learnFrom = document.getElementById('learnFrom').value;
        var learnTo = document.getElementById('learnTo').value;
        if ((currentIndex + 1) > learnTo) {
            currentIndex = learnFrom - 1;
        }
    }
}

function moveLeft() {
    decrementCurrent();

    nextWord();
}

function decrementCurrent() {
    currentIndex--;
    if (chkLearnRange[0].checked) { // all
        if (currentIndex == -1) {
            currentIndex = entries.length - 1;
        }
    }
    else { // range
        var learnFrom = document.getElementById('learnFrom').value;
        var learnTo = document.getElementById('learnTo').value;
        if ((currentIndex + 1) < learnFrom) {
            currentIndex = learnTo - 1;
        }
    }
}

function checkRange() {
    if (chkLearnRange[0].checked) { // all
        return;
    }
    else { // range
        var learnFrom = document.getElementById('learnFrom').value;
        var learnTo = document.getElementById('learnTo').value;
        if ((currentIndex + 1) < learnFrom) {
            currentIndex = learnTo - 1;
        }
        else if ((currentIndex + 1) > learnTo) {
            if (currentIndex != (entries.length - 1)) {
                currentIndex = learnFrom - 1;
            }
        }
    }
}

function goToWord() {
    var word = document.getElementById('goToWord').value.toLowerCase();
    var index = wordsIndex.indexOf(word);
    if (index < 0) {
        if (word == '') {
            var indexValue = document.getElementById('goToIndex').value;
            index = parseInt(indexValue) - 1;
            if (!isNaN(index)) {
                if (index >= entries.length) {
                    index = entries.length - 1;
                }
                else if (index <= 0) {
                    index = 0;
                }
            }
            else {
                console.log('Incorrect word index number: \'' + indexValue + '\'.');
                return;
            }
        }
        else {
            console.log('The word \'' + word + '\' not found.');
            return;
        }
    }

    wordsHistory.push(currentIndex);

    $("#btnBack").prop("disabled", false);
	$("#clrHist").prop("disabled", false);

    currentIndex = index;

    autoplayOff();
    audios = null;

    showCurrent();
}

function goBack() {
    if (wordsHistory.length == 0) {
        return;
    }

    currentIndex = wordsHistory.pop();

    if (wordsHistory.length == 0) {
        $("#btnBack").prop("disabled", true);
		$("#clrHist").prop("disabled", true);
    }

    autoplayOff();
    audios = null;

	var playHistory = document.getElementById('autoplayHistory').checked;
    showCurrent(playHistory);
    lastSelectedWord = '';
}

function init() {
    $('#settings').toggle();
    $('#wordCard').toggle();
    $("#goTo").toggle();

    entriesCount();

    currentIndex = 0;
    checkRange();

    functions = null;
    audios = null;

    if (processSelection) {
        document.addEventListener("selectionchange", function() {
            var selection = window.getSelection();
            var selectionText = selection.toString();

            processLinkWord(selectionText);
        });
    }

    showCurrent();
}

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

function showCurrent(playAudio) {
    if (entries[currentIndex] == "") {
        return;
    }

    var currentEntry = entries[currentIndex];
    var parts = currentEntry.split(splitterStr);

    console.log('--\n** Current word: \'' + parts[0] + '\'');

    $("#word").html(parts[0]);
    $("#pos").html(parts[1]);

    makeAudioHTML(parts[6]);
	if (playAudio != undefined && playAudio == false) {
		autoplay(false);
	}
    else {
        autoplay(document.getElementById("autoplay").checked);
    }

    $("#transcription").html(styleTranscription(parts[2]));
    $("#comment").html(parts[3]);

    $("#translation").html(parts[4]);
    $("#examples").html(formatExamples(parts[5]));

    getLinkedWords(parts[5]);

    document.title = parts[0] + " - Oald card";

    var rangeStr = '';
    if (document.getElementById('displayRange').checked) {
        if (!chkLearnRange[0].checked) { // range
            var learnFrom = document.getElementById('learnFrom').value;
            var learnTo = document.getElementById('learnTo').value;
            rangeStr = ', [' + learnFrom + '-' + learnTo + ']';
        }
        else {
            rangeStr = ', *';
        }
    }

    document.getElementById('progress').innerHTML = (currentIndex + 1) + '\/' + entries.length + rangeStr;

    applyFontSizes();
}

function formatExamples(examples) {
    var result = '';
    if (examples.length > 0) {
        result = "<ul><li>" + examples.replace(replaceToLiRe, "<li>") + "</ul>";
    }

    result = result.replace(exmplLnk2Re, '<special onclick="clickLnk(this)">$1</special>');
    result = result.replace(see2Re, '<special onclick="clickLnk(this)">$1</special>');

    return result;
}

function getLinkedWords(examples) {
    linkedWords = [];
    linkedText = [];

    var match;

    seeRe.lastIndex = 0;
    exmplLnkRe.lastIndex = 0;
    wordLnkRe.lastIndex = 0;

    while ((match = seeRe.exec(examples)) != null) {
        linkedWords.push(match[1]);
        linkedText.push('');
    }

    while((match = exmplLnkRe.exec(examples)) != null) {
        var tmp = wordLnkRe.exec(match[1]);
        if (tmp != null) {
            linkedWords.push(tmp[2]);
            linkedText.push(tmp[1]);
        }
        else {
            linkedWords.push(match[1]);
            linkedText.push('');
        }
    }

    var infoStr = '** Linked Words: ' + (linkedWords.length == 0 ? '-' : '');
    for (var i = 0; i < linkedWords.length; i++) {
        infoStr += '\'' + linkedWords[i] + '\'' + (i < linkedWords.length - 1 ? ', ' : '');
    }
    console.log(infoStr);
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

    audioLinksHTML += '<span id="playAll" onclick=autoplay(true)>Play all <img src="img/play-all-normal.png"></span>';

    $("#audioLinks").html(audioLinksHTML);
}

function initAutoplay(playAudio) {
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
			if (playAudio) {
				element.play();
			}
			else {
				var event = new Event('ended');
				element.dispatchEvent(event);
			}
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
        return;
    }
    if (functions == null) {
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
}

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

function processLinkWord(word) {
    var exitReason = '';

    var linkedTextIndex = linkedText.indexOf(word);
    var linkedWordsIndex = linkedWords.indexOf(word);

    if (word == '') {
        exitReason = 'Empty word';
    }
    else if (linkedTextIndex < 0 && linkedWordsIndex < 0) {
        exitReason = 'Word not found';
    }
    else if (linkedTextIndex >= 0 && linkedWordsIndex < 0) {
        word = linkedWords[linkedTextIndex];
    }
    else if (lastSelectedWord == word) {
        exitReason = 'Word processed';
    }

    if (exitReason != '') {
        console.log('** Processing word: ' + exitReason + '. Exit.');
        return;
    }

    lastSelectedWord = word;
    document.getElementById('goToWord').value = lastSelectedWord;
    goToWord();
}

function clickLnk(w) {
    processLinkWord(w.innerText);
}

function clearHistory() {
	$("#btnBack").prop("disabled", true);
	$("#clrHist").prop("disabled", true);
	wordsHistory = [];
}

// Script Parameters.

const entrySplitter = ' – ',
      exampleSplitter = ' ### ',
      processSelection = false,
      indexWord = 0,
      indexPoS = 1,
      indexTranscript = 2,
      indexComment = 3,
      indexTranslation = 4,
      indexExample = 5,
      indexURL = 6;


//  Variables.

var entries = [],
    vocabularyChanged = true;
    currentIndex = 0,
    wordsIndex = [],
    wordsHistory = [],
    audios = null,
    functions = null,
    chkLearnRange = document.getElementsByName('learnRange'),
    linkedWords = [], // <exmpl-lnk>theword</exmpl-lnk>
    linkedText = [],  // <exmpl-lnk>wordform<word-lnk>theword</word-lnk></exmpl-lnk>
    lastSelectedWord = '',
    replaceToLiRe = new RegExp(exampleSplitter, 'g'),
    seeRe = /<see>(.*?)<\/see>/g,
    see2Re = /(<see>.*?<\/see>)/g,
    exmplLnkRe = /<exmpl-lnk>(.*?)<\/exmpl-lnk>/g,
    exmplLnk2Re = /(<exmpl-lnk>.*?<\/exmpl-lnk>)/g,
    wordLnkRe = /(.*?)<word-lnk>(.*?)<\/word-lnk>/g,
	isFullScreen = false;


// Initialization.

run();


// Functions.

function clearAndFocus(id, focus) {
    var inputCtrl = document.getElementById(id);

    inputCtrl.value='';
    if (focus) {
        inputCtrl.focus();
    }
}

function toggleSettings() {
    var settings = $('#settings');
    settings.toggle();
    $('#wordCard').toggle();
    
    if (settings['0'].style.display != 'none') {
        $('#moveLeft').css('visibility', 'hidden');
        $('#moveRight').css('visibility', 'hidden');
    }
    else {
        $('#moveLeft').css('visibility', 'visible');
        $('#moveRight').css('visibility', 'visible');
    }
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

    $('#btnBack').prop('disabled', false);
	$('#clrHist').prop('disabled', false);

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
        $('#btnBack').prop('disabled', true);
		$('#clrHist').prop('disabled', true);
    }

    autoplayOff();
    audios = null;

	var playHistory = document.getElementById('autoplayHistory').checked;
    showCurrent(playHistory);
    lastSelectedWord = '';
}

function run() {
    //$('#settings').toggle();
    //$('#wordCard').toggle();
    toggleSettings();

    if (vocabularyChanged) {
        setEntries();
        vocabularyChanged = false;
    }

    currentIndex = 0;
    checkRange();

    functions = null;
    audios = null;

    if (processSelection) {
        document.addEventListener('selectionchange', function() {
            var selection = window.getSelection();
            var selectionText = selection.toString();

            processLinkWord(selectionText);
        });
    }

    showCurrent();
}

function applySettings() {
    applyFontSizes();
    if (vocabularyChanged) {
        setEntries();
        vocabularyChanged = false;
    }
}

function vocChanged() {
    vocabularyChanged = true;
}

function setEntries() {
    var text = $('#vocabulary').val();

    var emptyEntriesExist = false;
    var tmp = text.split('\n');

    for (var i = 0; i < tmp.length; i++) {
        if (tmp[i] == '') {
            emptyEntriesExist = true;
            break;
        }
    }

    if (!emptyEntriesExist) {
        entries = tmp;
    }
    else {
        entries = [];
        for (var i = 0; i < tmp.length; i++) {
            if (tmp[i] != '') {
                entries.push(tmp[i]);
            }
        }
    }

    wordsIndex = [];
    wordsHistory = [];
    for (var i = 0; i < entries.length; i++) {
        wordsIndex[i] = entries[i].substring(0, entries[i].indexOf(entrySplitter)).toLowerCase();
    }

    document.getElementById('entriesTotal').innerHTML = entries.length;
}

function showCurrent(playAudio) {
    if (entries.length == 0 || entries[currentIndex] == '') {
        return;
    }

    var currentEntry = entries[currentIndex];
    var parts = currentEntry.split(entrySplitter);

    console.log('--\n** Current word: \'' + parts[0] + '\'');

    $('#word').html(parts[indexWord]);
    $('#pos').html(parts[indexPoS]);

    makeAudioHTML(parts[indexURL]);
	if (playAudio != undefined && playAudio == false) {
		autoplay(false);
	}
    else {
        autoplay(document.getElementById('autoplay').checked);
    }

    $('#transcription').html(styleTranscription(parts[indexTranscript]));
    $('#comment').html(formatExamples(parts[indexComment]));
    
    var linked = getAllLinkedWords(parts[indexComment]);
    linkedWords = linked.linkedWords;
    linkedText = linked.linkedText;

    $('#translation').html(parts[indexTranslation]);
    $('#examples').html(formatExamples(parts[indexExample]));

    linked = getAllLinkedWords(parts[5]);
    linkedWords = linkedWords.concat(linked.linkedWords);
    linkedText = linkedText.concat(linked.linkedText);
    
    var infoStr = '** Linked Words: ' + (linkedWords.length == 0 ? '-' : '');
    for (var i = 0; i < linkedWords.length; i++) {
        infoStr += '\'' + linkedWords[i] + '\'' + (i < linkedWords.length - 1 ? ', ' : '');
    }
    console.log(infoStr);


    document.title = parts[indexWord] + ' - Oald card';

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
}

function formatExamples(examples) {
    var result = '';
    if (examples.length > 0) {
        result = '<ul><li>' + examples.replace(replaceToLiRe, '<li>') + '</ul>';
    }

    result = result.replace(exmplLnk2Re, '<special onclick="clickLnk(this)" onmouseover="mouseover(this)">$1</special>');
    result = result.replace(see2Re, '<special onclick="clickLnk(this)" onmouseover="mouseover(this)">$1</special>');

    return result;
}

function getLinkedSee(examples) {
    var linkedSee = [];
    var match;

    seeRe.lastIndex = 0;

    while ((match = seeRe.exec(examples)) != null) {
        linkedSee.push(match[1].toLowerCase());
    }
    
    return linkedSee;
}

function getLinkedWords(examples) {
    var linkedWords = [];
    var linkedText = [];
    var match;

    exmplLnkRe.lastIndex = 0;

    while((match = exmplLnkRe.exec(examples)) != null) {
        wordLnkRe.lastIndex = 0;
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
    
    return {
        linkedWords: linkedWords,
        linkedText: linkedText
    }
}

function getAllLinkedWords(examples) {
    var linkedWords = [];
    var linkedText = [];
    
    var see = getLinkedSee(examples);
    
    for (var i = 0; i < see.length; i++) {
        linkedWords.push(see[i]);
        linkedText.push('');
    }
    
    var words = getLinkedWords(examples);
    
    linkedWords = linkedWords.concat(words.linkedWords);
    linkedText = linkedText.concat(words.linkedText);
    
    return {
        linkedWords: linkedWords,
        linkedText: linkedText
    }
}

function styleTranscription(transcription) {
    var mapObj = {
        BrE:'<span class="breLight">BrE</span>',
        NAmE:'<span class="nameLight">NAmE</span>'
    };
    return transcription.replace(/BrE|NAmE/g, function(matched){
        return mapObj[matched];
    });
}

function makeAudioHTML(txt) {
    if (txt == '' || typeof txt == 'undefined' || txt == null) {
        $('#audioLinks').html('');
        return;
    }

    if (audios != null) {
        return;
    }

    audios = [];

    var bre = 'BrE';
    var name = 'NAmE';

    var parts = txt.split('; ');

    var audioLinksHTML = '';

    var audioAutoRunElem = $('#audioAutoRun');
    audioAutoRunElem.html('');

    var path = $('#audioPath').val();
    var isMp3 = document.getElementById('Mp3').checked;

    var currentIndex;

    for (var i = 0; i < parts.length; i++) {
        if (isMp3) {
            if (parts[i].toLowerCase().endsWith('ogg')) {
                continue;
            }
        }
        else { // 'Ogg'
            if (parts[i].toLowerCase().endsWith('mp3')) {
                continue;
            }
        }

        currentIndex = audios.length;

        var audioStr = '<audio id=\"audio' + currentIndex + '\">';
        audioStr += '<source src=\"' + path + parts[i].substring(parts[i].lastIndexOf('/') + 1)
                    + '\" type=\"' + (isMp3 ? 'audio/mpeg\">' : 'audio/ogg\">') + '</audio>';

        audioAutoRunElem.append(audioStr);

        audios[currentIndex] = document.getElementById('audio' + currentIndex);

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

    $('#audioLinks').html(audioLinksHTML);
}

function initAutoplay(playAudio) {
    console.log('initAutoplay()...');

    if (typeof audios == 'undefined' || audios == null) {
        console.log('Exit initAutoplay(). (01)');
        return;
    }
    if (functions != null) {
        console.log('Exit initAutoplay(). (02)');
        return;
    }

    functions = [];

    function playNext(i) {
        return function() {
            var span = document.getElementById('audioSpn' + (i + 1));
            span.style.visibility = 'inherit';

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
        document.getElementById('playAll').style.visibility = 'inherit';
    }

    for (var i = 0; i < audios.length; i++) {
        audios[i].addEventListener('ended',
            functions[i]
        );
    }

    document.getElementById('audioSpn0').style.visibility = 'inherit';
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
        setEntries();
    };

    reader.readAsText(input.files[0]);
}

function applyFontSizes() {
    function scaleFont(element, defaultSize, scale) {
        try {
            element.style['font-size'] = defaultSize * scale + 'pt';
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
	$('#btnBack').prop('disabled', true);
	$('#clrHist').prop('disabled', true);
	wordsHistory = [];
}

function toggleFullscreen() {
	if (!isFullScreen) {
		openFullscreen();
		isFullScreen = true;
	}
	else {
		closeFullscreen();
		isFullScreen = false;
	}
}

function openFullscreen() {
  var elem = document.documentElement;
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.mozRequestFullScreen) { /* Firefox */
    elem.mozRequestFullScreen();
  } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) { /* IE/Edge */
    elem.msRequestFullscreen();
  }
}

function closeFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  }
}

function checkVocabulary() {
    var errorInfo = $('#errorInfo');
    var errorInfoTextarea = $('#errorInfoTextarea');

    // Helper functions.

    function seeFound(see, word) {
        var index = wordsIndex.indexOf(see);
        if (index == -1) {
            showLog('** Word \'' + see + '\' not found.');
            return false;
        }
        
        var entry = entries[index];
        var parts = entry.split(entrySplitter);
        
        var found = false;
        
        exmplLnk2Re.lastIndex = 0;
        var tmp;
        
        while(!found && (tmp = exmplLnk2Re.exec(parts[indexComment])) != null) {
            var t = tmp.toString().toLowerCase();
            //console.log(t);
            //console.log(word);
            var i = t.indexOf(word);
            //console.log(i);
            if (i >= 0) {
                found = true;
            }
        }
        
        exmplLnk2Re.lastIndex = 0;
        while(!found && (tmp = exmplLnk2Re.exec(parts[indexExample])) != null) {
            var t = tmp.toString().toLowerCase();
            //console.log(t);
            //console.log(word);
            var i = t.indexOf(word);
            //console.log(i);
            if (i >= 0) {
                found = true;
            }
        }
        
        if (!found) {
            var seeInner = getLinkedSee(parts[indexExample]);
            
            found = (seeInner.indexOf(word) >= 0);
        }
        
        if (!found && see == parts[indexWord]) {
            showLog('Checking \'' + word + '\': see \'' + see + '\' found as a word: \'' + parts[indexWord] + '\'.');
            found = true;
        }
        
        //console.log('Found: ' + found);
        
        return found;
    }
    
    function showLog(info) {
        var text = errorInfoTextarea.text();
        errorInfoTextarea.text(text == '' ? info : text + '\n' + info);
    }
    
    function linkExists(linked, toWord) {
        var index = wordsIndex.indexOf(linked);
        if (index == -1) {
            showLog('** Word \'' + linked + '\' not found.');
            return false;
        }
        
        var entry = entries[index];
        var parts = entry.split(entrySplitter);
        var see = getLinkedSee(parts[indexExample]);
        
        return see.indexOf(toWord) > -1;
    }
    
    // Checks.

    errorInfo.show();

    var errorFound = false;

    for (var i = 0; i < entries.length; i++) {
        var parts = entries[i].split(entrySplitter);
        var word = parts[indexWord].toLowerCase();
        
        // Check 1.
        
        var seeOk = true;
        
        var see = getLinkedSee(parts[indexExample]);
        for (var j = 0; j < see.length; j++) {
            seeOk = seeFound(see[j], word);
            if (!seeOk) {
                errorFound = true;
                showLog('** Checking \'' + word + '\': see \'' + see[j] + '\' not found.');
            }
        }
        
        // Check 2.
        
        var linkedWords = getLinkedWords(parts[indexComment]).linkedWords;
        linkedWords = linkedWords.concat(getLinkedWords(parts[indexExample]).linkedWords);
        
        for (var j = 0; j < linkedWords.length; j++) {
            if (!linkExists(linkedWords[j].toLowerCase(), word)) {
                errorFound = true;
                showLog('** Checking \'' + word + '\': link from \'' + linkedWords[j] + '\' not found.');
            }
        }
    }
    
    if (errorFound) {
        showLog('** Vocabulary has been checked with error(s).');
    }
    else {
        showLog('** Vocabulary has been checked without errors.');
    }
}

function hideErrorInfo() {
    $('#errorInfo').hide();
}

function clearErrorInfo() {
    $('#errorInfoTextarea').text('');
}

function mouseover(el) {
    if (!el.title) {
        el.title = true;
        
        exmplLnkRe.lastIndex = 0;
        var word = exmplLnkRe.exec(el.innerHTML);
        
        if (word != null) {
            word = word[1].toLowerCase();
            wordLnkRe.lastIndex = 0;
            var tmp = wordLnkRe.exec(word);
            
            if (tmp != null) {
                word = tmp[2].toLowerCase();
            }
        }
        else {
            seeRe.lastIndex = 0;
            word = seeRe.exec(el.innerHTML)[1].toLowerCase();
        }
        
        var index = wordsIndex.indexOf(word) + 1;
        el.setAttribute('title', index);
    }
}

function toggleDetails(id) {
    var el = document.getElementById(id);
    el.classList.toggle('expanded');
}

function toggleBtn(el) {
    el.classList.toggle('expanded');
}
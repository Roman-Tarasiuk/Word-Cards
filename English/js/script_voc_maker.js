function selLeftToLeft() {
    var txtCtrl = document.getElementById('txtInfo');
    txtCtrl.selectionStart--;
    txtCtrl.focus();
}

function selLeftToRight() {
    var txtCtrl = document.getElementById('txtInfo');
    txtCtrl.selectionStart++;
    txtCtrl.focus();
}

function selRightToLeft() {
    var txtCtrl = document.getElementById('txtInfo');
    txtCtrl.selectionEnd--;
    txtCtrl.focus();
}

function selRightToRight() {
    var txtCtrl = document.getElementById('txtInfo');
    txtCtrl.selectionEnd++;
    txtCtrl.focus();
}

function tripleClick(elementName, f1, f2, f3) {
    var timeout1;
    var timeout2;
    var dblClick = false;

    var element = document.querySelector(elementName);
    if (element == null) {
        element = document.getElementById(elementName);
    }

    element.addEventListener('click', function (evt) {
        if (evt.detail === 1) {

            // Initialization of global variable
            //
            if ('selectionStart' in element) {
                selectionStart = element.selectionStart;
            }

            timeout1 = setTimeout(function(){
                if (!dblClick) {
                    if (f1 != null) {
                        f1();
                    }
                }
                dblClick = false;
            }, 100);
        }
        else if (evt.detail === 2) {
            dblClick = true;
            timeout2 = setTimeout(function() {
                clearTimeout(timeout1);
                dblClick = false;
                if (f2 != null) {
                    f2();
                }
            }, 100);
        }
        else if (evt.detail === 3) {
            clearTimeout(timeout1);
            clearTimeout(timeout2);
            dblClick = false;
            if (f3 != null) {
                f3();
            }
        }
    });
}

tripleClick('txtInfo',
    null,
    function() {
        selectWithoutTail(document.getElementById('txtInfo'));
    },
    function() {
        selectExampleTriple(document.getElementById('txtInfo'));
    }
)

$("#txtInfo").resizable({
    resize: setSrchResultsWidth
    //alsoResize: "#oald, hr"
});

function setSrchResultsWidth() {
        var w = $("#txtInfo").width();
        $("#oald").width(w);
        $("hr").width(w);
}

setSrchResultsWidth();

function beforeUnload()
{
    if(document.getElementById("temporaryStorage").value != '') {
        return "Є незбережені дані. Ви дійсно хочете вийти?";
    }
    /* Doesn't work
    if(!window.confirm) {
        return "Mozilla. Є незбережені дані. Ви дійсно хочете вийти?";
    }
    else {
        var ask = window.confirm("Internet Explorer. Є незбережені дані. Ви дійсно хочете вийти?");
        if(ask) {
            return "QWE";
        }
        else {
            window.close();
        }
    }
    //*/
}

window.onbeforeunload = beforeUnload;

var replaceToLiRe = new RegExp(" ### ", "g");
var replaceNewLineRe = new RegExp("\n", "g");
var replaceAllTagsRe = /<(\/?)(exmpl|exmpla|oald8|phr|i|b|code)>/g;
var replaceAllTagsBackRe = /<(\/?)(?:_)(exmpl|exmpla|oald8|phr|i|b|code)>/g;
var nonOALDTagsRe = /((<)(?!(?:\/*_exmpl|\/*_exmpla|\/*_oald8|\/*_phr|\/*_i|\/*_b|\/*_code)))(.*?)(>)/g;

var oaldSeparator = ' – ';

var selectionStart;

function processOald() {
    if (!document.getElementById('processChangesChk').checked) {
        return;
    }

    var text = document.getElementById("txtInfo").value;

    if(text == '') {
        document.getElementById("oald").innerHTML = '...';
        return;
    }

    text = text.replace(replaceAllTagsRe, "<$1_$2>");
    text = text.replace(nonOALDTagsRe, "&lt$3&gt");
    text = text.replace(replaceAllTagsBackRe, "<$1$2>");

    var rows = text.split('\n');
    text = '';
    for(var r in rows) {
        var examplesSeparatorPos = rows[r].indexOf(oaldSeparator);
        examplesSeparatorPos = rows[r].indexOf(oaldSeparator, examplesSeparatorPos + 1);
        examplesSeparatorPos = rows[r].indexOf(oaldSeparator, examplesSeparatorPos + 1);
        examplesSeparatorPos = rows[r].indexOf(oaldSeparator, examplesSeparatorPos + 1);
        examplesSeparatorPos = rows[r].indexOf(oaldSeparator, examplesSeparatorPos + 1);
        var audioSeparatorPos = rows[r].indexOf(oaldSeparator, examplesSeparatorPos + 1);

        if(examplesSeparatorPos > -1) {
            text += "<p class='convenientFont' style='margin: 0;'>" + rows[r].substring(0, examplesSeparatorPos) + "</p>";
            text += "<ul style='margin: 0;'> <li class='convenientFont' style='margin: 0;'>" + rows[r].substring(examplesSeparatorPos + oaldSeparator.length, audioSeparatorPos).replace(replaceToLiRe, "<li class='convenientFont' style='margin: 0;'>") + "</ul>";
            text += "<ul style='margin: 0;'> <li class='convenientFont split' style='margin: 0;'>" + rows[r].substring(audioSeparatorPos + oaldSeparator.length) + "</ul>";
        }
        else {
            text += "<p class='convenientFont' style='margin: 0;'>" + "<ul style='margin: 0;'> <li class='convenientFont' style='margin: 0;'>" + rows[r].replace(replaceToLiRe, "<li>") + "</ul></p>";
        }
        text += "<hr style='margin: 0;'>";
    }

    document.getElementById("oald").innerHTML = text;
}

$('#txtInfo').bind('input propertychange', processOald);

function surroundWithTag(tag) {
    var textComponent = document.getElementById('txtInfo');

    if(textComponent.selectionStart == undefined) {
        return;
    }

    var startPos = textComponent.selectionStart;
    var endPos = textComponent.selectionEnd;
    if(startPos != endPos) {
        var selectedText = textComponent.value.substring(startPos, endPos);
        var resultText = textComponent.value.substring(0, startPos)
                        + '<' + tag + '>'
                        + selectedText
                        + '</' + tag + '>'
                        + textComponent.value.substring(endPos, textComponent.value.length);

        textComponent.value = resultText;
        processOald();
        textComponent.select();
        textComponent.selectionStart = startPos + tag.length + 2;
        textComponent.selectionEnd = textComponent.selectionStart + selectedText.length;
    }
}

function removeRedundantLineBreaks() {
    var txtInfoCtrl = document.getElementById('txtInfo');
    if(replaceNewLineRe.test(txtInfoCtrl.value)) {
        var tmpRe = /(\.ogg|\.mp3)(\n)/g;
        var tmpStr = '>>>>>';
        txtInfoCtrl.value = txtInfoCtrl.value.replace(tmpRe, '$1' + tmpStr);

        var replaceTwoNewLinesRe = new RegExp("\n", "g");
        do {
            var length = txtInfoCtrl.value.length;
            txtInfoCtrl.value = txtInfoCtrl.value.replace(replaceTwoNewLinesRe, '\n');
        } while (txtInfoCtrl.value.length != length);

        txtInfoCtrl.value = txtInfoCtrl.value.replace(replaceNewLineRe, " ");

        tmpRe = new RegExp(tmpStr, 'g');
        txtInfoCtrl.value = txtInfoCtrl.value.replace(tmpRe, '\n');

        processOald();
    }
    txtInfoCtrl.select();
}

function removeAllTags() {
    var txtInfoCtrl = document.getElementById('txtInfo');
    if(replaceAllTagsRe.test(txtInfoCtrl.value)) {
        txtInfoCtrl.value = txtInfoCtrl.value.replace(replaceAllTagsRe, "");
        processOald();
    }
    txtInfoCtrl.select();
}

function selectWithoutTail(textArea) {
    // Automatically selected trailing spaces/tabs.
    while (textArea.value[textArea.selectionEnd - 1] == " "
            || textArea.value[textArea.selectionEnd - 1] == "\t") {
        textArea.selectionEnd--;
    }
    
    var delimiters = ['\n', ' ', '\t', ',', '.', ';', '"', '\'', '—', '’'];
    while (textArea.selectionEnd < textArea.value.length
        && delimiters.indexOf(textArea.value[textArea.selectionEnd]) == -1) {
        textArea.selectionEnd++;
        console.log('textArea.selectionEnd++');
    }
    while (textArea.selectionStart > 0
        && delimiters.indexOf(textArea.value[textArea.selectionStart - 1]) == -1) {
        textArea.selectionStart--;
        console.log('textArea.selectionStart--');
    }

    if (textArea.value[textArea.selectionStart] == '(') {
        while (textArea.value[textArea.selectionEnd - 1] != ')') {
            textArea.selectionEnd++;
        }
    }
    else if (textArea.value[textArea.selectionEnd - 1] == ')') {
        while (textArea.value[textArea.selectionStart] != '(') {
            textArea.selectionStart--;
        }
    }
}

function selectPWithoutTail() {
    var range = window.getSelection().getRangeAt(0);
    var sel = range.toString();

    var decrementOn = 0;
    var end = sel.length - 1;
    while((end >=0) && (sel[end] == ' ' || sel[end] == '\t')) {
        end--;
        window.getSelection().modify("extend", "backward", "character");
    }
}

function selectExampleTriple(textArea) {
    var end = selectionStart;
    while (end < (textArea.value.length) && textArea.value[end] != '\n' && textArea.value[end] != '\r\n') {
        end++;
    }

    var audioSeparatorPos = textArea.value.substring(0, end).lastIndexOf(oaldSeparator);

    if (selectionStart < audioSeparatorPos) {
        var begin = selectionStart;
        while (begin > 0 && textArea.value[begin] != '\n' && textArea.value[begin] != '\r\n') {
            begin--;
        }

        textArea.selectionStart = begin;
        textArea.selectionEnd = audioSeparatorPos;
    }
    else {
        textArea.selectionStart = audioSeparatorPos;
        textArea.selectionEnd = end;
    }
}

function appendExample() {
    var txtInfoCtrl = document.getElementById("txtInfo");

    if(txtInfoCtrl.value != '') {
        if(document.getElementById("temporaryStorage").value == '') {
            document.getElementById("temporaryStorage").value = document.getElementById("txtInfo").value;
        }
        else {
            document.getElementById("temporaryStorage").value += '\n' + document.getElementById("txtInfo").value;
        }
        txtInfoCtrl.value = '';
        //processOald();
        processChangesManually();

        var temporaryStorageComponent = document.getElementById("temporaryStorage");
        temporaryStorageComponent.scrollTop = temporaryStorageComponent.scrollHeight;
    }
    txtInfoCtrl.select();
}

function saveTextAsFile() {
    var textToWrite = document.getElementById("temporaryStorage").value;
    var textFileAsBlob = new Blob([textToWrite], {type:'text/plain'});
    var fileNameToSaveAs = 'filename.txt';

    var downloadLink = document.createElement("a");
    downloadLink.download = fileNameToSaveAs;
    downloadLink.innerHTML = "Download File";
    if (window.webkitURL != null) {
        // Chrome allows the link to be clicked
        // without actually adding it to the DOM.
        downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
    }
    else {
        // Firefox requires the link to be added to the DOM
        // before it can be clicked.
        downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
        downloadLink.onclick = destroyClickedElement;
        downloadLink.style.display = "none";
        document.body.appendChild(downloadLink);
    }

    downloadLink.click();
}

function destroyClickedElement(event) {
    document.body.removeChild(event.target);
}

function entryTemplate() {
    var template = "**word** – **part-of-speech** – **transcription** – **comments** – **translation** – **examples** – **audio-files-urls**";

    document.getElementById('txtInfo').value =
        document.getElementById('txtInfo').value != '' ?
            template + '\n' + document.getElementById('txtInfo').value :
            template;

    processOald();
}

function removePlaceholders() {
    var txtInfoCtrl = document.getElementById('txtInfo');
    var placeholdersRE = /\*\*word\*\*|\*\*part-of-speech\*\*|\*\*transcription\*\*|\*\*comments\*\*|\*\*translation\*\*|\*\*examples\*\*|\*\*audio-files-urls\*\*/g;
    var result = txtInfoCtrl.value.replace(placeholdersRE, '');
    txtInfoCtrl.value = result;

    processOald();
    txtInfoCtrl.select();
}

function switchProcessState() {
    document.getElementById('processChangesBtn').disabled = !document.getElementById('processChangesBtn').disabled;
}

function processChangesManually() {
    var checkedState = document.getElementById('processChangesChk').checked;

    document.getElementById('processChangesChk').checked = true;
    processOald();
    document.getElementById('processChangesChk').checked = checkedState;
}

function pick() {
    var textComponent = document.getElementById('txtInfo');
    textComponent.focus();
    var sel = selectWithoutTail(document.getElementById('txtInfo'));
}

$("#txtInfo").resizable({
    resize: setSrchResultsWidth
});

function clearAll() {
    document.getElementById('txtInfo').value='';
    document.getElementById('srchResults').innerText='';
}

function setSrchResultsWidth() {
        var w = $("#txtInfo").width();
        $("#srchResults").width(w);
}

setSrchResultsWidth();

function openFile(event) {
    var input = event.target;

    var reader = new FileReader();
    reader.onload = function(){
        var txtInfo = document.getElementById('txtInfo');
        if (txtInfo.value == '') {
            txtInfo.value = reader.result;
        }
        else {
            txtInfo.value += '\n' + reader.result;
        }
    };

    reader.readAsText(input.files[0]);
};

function srchLength() {
    document.getElementById('srchLength').innerHTML = ' length: ' + document.getElementById('srchFor').value.length;

    var inputSrchFor = document.getElementById("srchFor");
    var inputMinLength = document.getElementById("minLength");
    var inputSrchTexts = document.getElementById("srchTexts");

    var srchFor = inputSrchFor.value;
    var minLength = parseInt(inputMinLength.value);

    if(srchFor == '') {
        inputSrchTexts.innerHTML = '-';
    }
    else if(minLength >= srchFor.length) {
        inputSrchTexts.innerHTML = '(' + srchFor + ')';
    }
    else {
        inputSrchTexts.innerHTML = '(' + srchFor.substr(0,minLength)
                            + ' - ' + srchFor.substr(srchFor.length - minLength, minLength) + ')';
    }
}

srchLength();

function onInputKeyUp(e) {
    var inputSrchFor = document.getElementById("srchFor");
    if(document.activeElement == inputSrchFor) {
        if(e.keyCode == 38) {
            document.getElementById("minLength").value++;
        }
        else if(e.keyCode == 40) {
            document.getElementById("minLength").value--;
        }
    }

    srchLength();

    if (e.keyCode == 13) {
        search();
    }
}

var dividerColor = "#BFE8FF";

function search() {
    var version = document.getElementsByName("srchVersion");
    if(version[0].checked) {
        document.getElementById("srchResults").style.background = "#F2D0E8";
        search1();
    }
    else {
        document.getElementById("srchResults").style.background = "#ffe";
        search2();
    }
}

var replaceLT = /</g;
var replaceGT = />/g;

//* Working version, backup 25.11.2015
function search1() {
    var inputTxtInfo = document.getElementById("txtInfo");
    var inputSrchFor = document.getElementById("srchFor");
    var inputMinLength = document.getElementById("minLength");
    var inputSrchResults = document.getElementById("srchResults");

    var txtInfo = inputTxtInfo.value;
    var srchFor = inputSrchFor.value;
    var minLength = parseInt(inputMinLength.value);

    //*
    if(replaceLT.test(txtInfo) || replaceGT.test(txtInfo)) {
        txtInfo = txtInfo.replace(replaceLT, '&lt').replace(replaceGT, '&gt');
    }
    //*/

    var rows = txtInfo.split("\n");

    if(srchFor.length < minLength) {
        minLength = srchFor.length;
    }

    var result = "";
    for(var i = 0; i < rows.length; i++) {
        var resultLength = result.length;
        for(var length = srchFor.length; length >= minLength; length--) {
            for(var start = 0; start <= srchFor.length - length; start++) {
                var sub = srchFor.substr(start, length);
                var re = new RegExp(sub, 'gi');
                var tmp = rows[i].replace(re, '<span class="srch">' + sub + '</span>');
                if(tmp.length != rows[i].length) {
                    result += tmp + '<br>';
                }
            }
        }
        if(result.length > resultLength) {
            result += '<div style="color: white; background-color: ' + dividerColor + ';">∙</div>';
        }
    }

    if(result.length > 0) {
        inputSrchResults.innerHTML = result;
    }
    else {
        inputSrchResults.innerHTML = 'Not found';
    }
}
//*/

//*
function search2() {
    var inputTxtInfo = document.getElementById("txtInfo");
    var inputSrchFor = document.getElementById("srchFor");
    var inputMinLength = document.getElementById("minLength");
    var inputSrchResults = document.getElementById("srchResults");

    var txtInfo = inputTxtInfo.value;
    var srchFor = inputSrchFor.value;
    var minLength = parseInt(inputMinLength.value);

    //*
    if(replaceLT.test(txtInfo) || replaceGT.test(txtInfo)) {
        txtInfo = txtInfo.replace(replaceLT, '&lt').replace(replaceGT, '&gt');
    }
    //*/

    var rows = txtInfo.split("\n");

    if(srchFor.length < minLength) {
        minLength = srchFor.length;
    }

    var rowsTmp = [];
    var re = [];

    for(var length = srchFor.length; length >= minLength; length--) {
        for(var start = 0; start <= srchFor.length - length; start++) {
            var sub = srchFor.substr(start, length);
            re[re.length] = new RegExp(sub, 'gi');
            var found = false;
            for(var i = 0; i < rows.length; i++) {
                if(rowsTmp[i] == null) {
                    rowsTmp[i] = rows[i];
                }
                var tmp = rowsTmp[i].replace(re[re.length - 1], '@@@' + (re.length - 1) + '@@@');
                if(tmp != rowsTmp[i]) {
                    rowsTmp[i] = tmp;
                    found = true;
                }
            }
            if(!found) {
                re.length--;
            }
        }
    }

    for(var i = 0; i < re.length; i++) {
        var replacement = '@@@' + i + '@@@';
        for(var j = 0; j < rowsTmp.length; j++) {
            if(rowsTmp[j] != rows[j]) {
                if(typeof theRE == 'undefined') {
                    theRE = new RegExp(replacement, 'gi');
                }
                var tmp = re[i].source;
                if(theRE.test(rowsTmp[j])) {
                    rowsTmp[j] = rowsTmp[j].replace(theRE, '<span class="srch">' + tmp + '</span>');
                }
            }
        }
        theRE = undefined;
    }

    var result = "";
    for(var i = 0; i < rows.length; i++) {
        if(rows[i] != rowsTmp[i]) {
            result += rowsTmp[i] + '<div style="color: white; background-color: ' + dividerColor + ';">∙</div>';
        }
    }

    if(result.length > 0) {
        inputSrchResults.innerHTML = result;
    }
    else {
        inputSrchResults.innerHTML = 'Not found';
    }
}
//*/

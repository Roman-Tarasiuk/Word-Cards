// ==UserScript==
// @name        OALD
// @namespace   oald
// @include     https://www.oxfordlearnersdictionaries.com/*
// @version     1
// @grant       none
// @require http://localhost:8080/jquery-2.2.0.min.js
// ==/UserScript==
//
//
$(document).ready((function(textInputId) {

    //$('body').css('visibility', 'hidden');

    // *******************************************************
    // *                                                     *
    // *             • • •  Configuration  • • •             *
    // *                                                     *
    // *   Start automatic download audio: true or false     *
            var AUTO_DOWNLOAD = false;
    // *                                                     *
    // *                                                     *
    // *   Type of audio files to download: 'mp3' or 'ogg'   *
            var AUDIO_TYPE = 'mp3';
    // *                                                     *
    // *******************************************************

    try {
        console.log('* OALD: Init 1 started...');

        var div = document.createElement('div');
        div.style.cssText = 'border: 2px solid lime; padding: 5px;';
        var divBody =
            '<input type=radio name="audioType" id="ogg" value="ogg"> Ogg'+
            '<input type=radio name="audioType" id="mp3" value="mp3" checked="true"> Mp3' +
            '<br>' +
            '<textarea id="downloadList" style="width: 100%; height: 200px; background-color: #99f;"></textarea>' +
            '<br>' +
            '<button onclick="oaldDownload()">Download</button>';
        div.innerHTML = divBody;

        document.getElementsByTagName('body')[0].appendChild(div);

        if (AUDIO_TYPE == 'ogg') {
            document.getElementById('ogg').checked = true;
        }
        else { // mp3
            document.getElementById('mp3').checked = true;
        }

        //

        document.oaldDownload = function() {
            //console.log('Process download...');

            var downloadListElem = document.getElementById('downloadList');

            var urls = getAudioUrls(downloadListElem.value);

            //if (urls != null) {
            //    console.log('Found URLs:');
            //    for (var i = 0; i < urls.length; i++) {
            //        console.log(urls[i]);
            //    }
            //}
            //else {
            //    console.log('No URLs found.');
            //}

            for (var i = 0; i < urls.length; i++) {
                //console.log('oaldDownload(), url: ' + urls[i]);
                saveFile(urls[i]);
            }

            //
            // Helper functions
            //

            function getAudioUrls(text) {
                var result = [];

                var urlRE = (AUDIO_TYPE == 'ogg') ?
                    /https:\/\/.+?\.ogg/g :
                    /https:\/\/.+?\.mp3/g;

                var url;
                while ((url = urlRE.exec(text)) != null) {
                    result[result.length] = url[0];
                }

                if (result.length == 0) {
                    result = null;
                }
                /*
                else { // Forcsed converting 'mp3' to 'ogg'
                    if (AUDIO_TYPE == 'ogg') {
                        // http://stackoverflow.com/questions/15604140/replace-multiple-strings-with-multiple-other-strings
                        //
                        var mapObj = {
                            uk_pron:'uk_pron_ogg',
                            us_pron:'us_pron_ogg',
                            mp3:'ogg'
                        };
                        for (var i = 0; i < result.length; i++) {
                            result[i] = result[i].replace(/uk_pron|us_pron|mp3/gi, function(matched){
                                return mapObj[matched];
                            });
                        }
                    }
                }
                //*/

                return result;
            }

            // https://ausdemmaschinenraum.wordpress.com/2012/12/06/how-to-save-a-file-from-a-url-with-javascript/
            //
            function saveFile(url) {
                var filename = url.substring(url.lastIndexOf('/') + 1).split('?')[0];
                var xhr = new XMLHttpRequest();
                xhr.responseType = 'blob';
                xhr.onload = function() {
                    var a = document.createElement('a');
                    a.href = window.URL.createObjectURL(xhr.response);
                    a.download = filename;
                    a.style.display = 'none';
                    document.body.appendChild(a);
                    a.click();
                    delete a;
                };
                xhr.open('GET', url);
                xhr.send();
            }
        };

        console.log('* OALD: Init 1 complete.');
    }
    catch (exception) {
        console.log(' ** OALD: Something wrong in download module (exception)...');
    }

    //

    (function() {
        console.log('* OALD: Init 2 (click/blur) started...');
        var success = true;

        var clicks = 0;

        try {
            $(textInputId).on('click', function() {
                //console.log('click...' + clicks);
                if (clicks == 0) {
                    this.selectionStart = 0;
                    this.selectionEnd = this.textLength;
                    clicks = 1;
                }
                else {
                    clicks = 0;
                }
            });

            $(textInputId).on('blur', function() {
                //console.log('blur....' + clicks);
                clicks = 0;
            });
        }
        catch (exception) {
            success = false;
        }

        if (success) {
            console.log('* OALD: Init 2 (click/blur) finished successfully.');
        }
        else {
            console.log('* OALD: Init 2 (click/blur) failed.');
        }
    })();

    (function() {
        try {
            console.log('* OALD: Init 3 started...');
            // http://stackoverflow.com/questions/12897446/greasemonkey-wait-for-page-to-load-before-executing-code-techniques
            //
            window.addEventListener('load', function() {
                console.log(' ** OALD: onload started...');

                var html = $('html').html();

                var info = process(html);

                if (info != null) {
                    $(textInputId).val(info);
                    $(textInputId).select();

                    if (AUTO_DOWNLOAD) {
                        $('#downloadList').val(info);
                        document.oaldDownload();
                    }
                }
                else {
                    console.log(' ** OALD: Word content not found.');
                }
                console.log(' ** OALD: onload finished.');
            });
            console.log('* OALD: Init 3 finished.');
        }
        catch (exception) {
            console.log('* OALD: Init 3 failed.');
        }
    })();

    //
    // Helper functions
    //

    function process(html) {
        console.log(' ** OALD: process() started...');
        var resultStr = '';

        var entries = [];
        entries[0] = processPage(html);

        console.log(' ** OALD: Other POS list:');

        var otherPosRE = /<a href="(.+?)" title=.+?><span class=(?:'|")arl1(?:'|")>.+?<\/span><\/a>/g;
        var otherPos;

        while ((otherPos = otherPosRE.exec(html)) != null) {
            var url = otherPos[1];
            console.log(' ** OALD: URL: ' + url);

            var request = new XMLHttpRequest();
            request.url = url;

            request.onreadystatechange = function() {
                if (this.readyState !== XMLHttpRequest.DONE) {
                    return;
                }
                if (this.status !== 200) {
                    return;
                }

                console.log(' ** OALD: A response was received.');

                entries[entries.length] = processPage(this.responseText);
            };

            request.open('GET', url, false);
            request.send();
        }

        console.log(' ** OALD: Other POS list end.');

        //

        var separator = ' – ';

        resultStr += entries[0].word + separator;

        console.log(' ** OALD: Entries length: ' + entries.length);

        for (var i = 0; i < entries.length; i++) {
            resultStr += entries[i].pos + (entries[i].isKey ? '(k)' : '') + ', ';
        }
        resultStr = resultStr.substring(0, resultStr.length - 2) + separator;

        var audio = '';
        for (var j = 0; j < entries[0].pronunciations.length; j++) {
            resultStr += entries[0].pronunciations[j].country + ' /' + entries[0].pronunciations[j].text + '/; ';
            audio += entries[0].pronunciations[j].country + ' ' + entries[0].pronunciations[j].audioUrl + '; ';
        }
        resultStr = resultStr.substring(0, resultStr.length - 2) +
            ' – **comments** – **translation** – **examples** – ' +
            audio.substring(0, audio.length - 2);

        // Check other pronunciations

        var pTmp0 = [],
            pTmpI;
        for (var j = 0; j < entries[0].pronunciations.length; j++) {
            pTmp0[j] = entries[0].pronunciations[j].country + entries[0].pronunciations[j].text;
        }

        checking:
        for (var i = 1; i < entries.length; i++) {
            for (var j = 0; j < entries[i].pronunciations.length; j++) {
                pTmpI = entries[i].pronunciations[j].country + entries[i].pronunciations[j].text;
                if (pTmp0.indexOf(pTmpI) < 0) {
                    resultStr = '**!! ' + resultStr;
                    break checking;
                }
            }
        }

        if (resultStr == '') {
            resultStr = null;
        }

        console.log(' ** OALD: process() finished.');

        return resultStr;
    }

    // Object version
    function processPage(html) {
        //
        // Returns 'result' object with properties:
        //  result.word
        //  result.pos
        //  result.isKey
        //  result.pronunciations
        //

        console.log(' ** OALD: processPage()');

        var mainContentRE = /<div id="entryContent"(?:.|\s)+?<div class="responsive_row responsive_display_on_smartphone">/;
        var mainContent = mainContentRE.exec(html);

        if (mainContent == null) {
            return {};
        }

        var result = {};

        mainContent = mainContent[0];

        var clearRE = /(<span.+?>)|(<\/span>)|\//g;

        //

        var wordRE = /(?:<h2 class="h">)(.+?)(?:<\/h2>)/;
        var word = wordRE.exec(mainContent);
        console.log(' ** OALD: ' + word[1]);

        result.word = word[1].replace(clearRE, '');

        //

        var posRE = /(?:<span class="pos">)(.+?)(?:<\/span>)/;
        var pos = posRE.exec(mainContent);

        if (pos != null) {
            console.log(' ** OALD: ' + pos[1]);

            result.pos = pos[1];
        }
        else {
            console.log(' ** OALD: No POS.');

            result.pos = 'NoPOS';
        }

        //

        var keyRE = /<a class=\"oxford3000\" href=\"https:\/\/www.oxfordlearnersdictionaries.com\/wordlist\/english\/oxford3000\/\">.*?<\/a>/;
        var key = keyRE.exec(mainContent);
        result.isKey = (key != null);

        // Pronunciation

        console.log(' ** OALD: Pronunciations: trying to get...');

        result.pronunciations = [];

        var tmp = mainContent;

        //var pronunPureRE = /<div class="pron-gs ei-g" eid=((?!verbform="y").)+?><!-- End of DIV pron-gs ei-g--><\/div>/;
        //var pronunPureRE = /<div class="pron-gs ei-g" (?:(tofix="y" )|(careful="y" ))*eid=((?!verbform="y").)+?><!-- End of DIV pron-gs ei-g--><\/div>/;
        var pronunPureRE = /<div class="pron-gs ei-g" (?:(tofix="y" )|(careful="y" ))*eid=((?!verbform="y").)+?>.*?<\/div><\/span><\/div>/;
        mainContent = pronunPureRE.exec(mainContent);

        if (mainContent !== null) {
            console.log(' ** OALD: Pronunciations: found.');
            var pronunRE = (AUDIO_TYPE == 'ogg') ?
                /<span class="(?:blue|red)">(BrE|NAmE)<\/span>.+?<\/span>.+?<\/span>(.+?)<span class="wrap">.+? data-src-ogg="(https:\/\/.+?\.ogg)/g :
                /<span class="(?:blue|red)">(BrE|NAmE)<\/span>.+?<\/span>.+?<\/span>(.+?)<span class="wrap">.+?(https:\/\/.+?\.mp3)/g;
            var pronun;
            while ((pronun = pronunRE.exec(mainContent)) != null) {
                var country = pronun[1];
                var pr = pronun[2].replace(clearRE, '');
                var url = pronun[3];

                console.log(' ** OALD: Pronunciation: ' + url);

                result.pronunciations[result.pronunciations.length] = {country: country, text: pr, audioUrl: url};
            }
        }
        else {
            console.log(' ** OALD: Pronunciations: not found.');
        }

        console.log(' ** OALD: processPage() finished.');

        return result;
    }

    // ' –  –  –  –  – '
    // 'word – POS – transcription – **comments** – **translation** – **examples** - audio_paths'
})("#q"));

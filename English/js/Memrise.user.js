// ==UserScript==
// @name         Memrise 2.0
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.memrise.com/*
// @grant        none
// ==/UserScript==

var pluginHtml =
`
<div class="helper">
    <input id="word" class="w">
    <input id="pronunciation" class="w">
    <input id="pronunciation1" class="w">
    <input id="pronunciation2" class="w">
    <button onclick="window.helper.process()">Add/Update</button>
    <br>
    <textarea id="info" class="w"></textarea>
    <button onclick="window.helper.showLocalStorage()">Local Storage</button>
    <button onclick="window.helper.updateLocalStorage()">Update</button>
    <button onclick="window.helper.toResourceOverrideJSON()">Resource Override JSON</button>
</div>
`;

var pluginCss =
`
.helper {
    height: 260px;
    background-color: #99ccff;
    padding: 5px;
}

.w {
    width: calc(100% - 10px);
}
`;

function insertBefore(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode);
}

function insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function Helper() {

    // Configurations.
    this.interval = 1000;
    this.httpServerPath = 'http://localhost:8080/Mp3/';
    this.useLocalServer = true;

    // Main functionality.
    var that = this;
    this.currentWord = '';
    this.words = [];

    this.pronunciationEl = null;
    this.pronunciationEl1 = null;
    this.pronunciationEl2 = null;
    this.wordEl = null;

    this.run = function(html, insertPlace) {
        console.log('** Adding plugin...');

        var plugin = document.createElement('div');
        plugin.id = 'plugindiv';
        plugin.innerHTML = html;

        if (insertPlace) {
            if (insertPlace.before) {
                insertBefore(plugin, insertPlace.before);
            }
            else if (insertPlace.after) {
                insertAfter(plugin, insertPlace.after);
            }
        }
        else {
            document.body.appendChild(plugin);
        }

        var vocabulary = localStorage.getItem('myVocabulary');
        if (vocabulary != null) {
            that.words = JSON.parse(vocabulary);
        }

        that.pronunciationEl = document.getElementById('pronunciation');
        that.pronunciationEl1 = document.getElementById('pronunciation1');
        that.pronunciationEl2 = document.getElementById('pronunciation2');
        that.wordEl = document.getElementById('word');

        setInterval(that.trackPage, that.interval);

        console.log('** Plugin added. (' + new Date() + ')');
    };

    this.appendCss = function (css) {
        var cssElement = document.createElement('style');
        cssElement.innerText = css;
        document.head.appendChild(cssElement);
    };

    this.process = function() {
        var word = document.getElementById('word').value;
        var pronunciation = document.getElementById('pronunciation').value;
        var pronunciation1 = document.getElementById('pronunciation1').value;
        var pronunciation2 = document.getElementById('pronunciation2').value;

        var index = that.indexOf(word);
        if (index == -1) {
            that.words.push({
                word: word,
                pronunciation: pronunciation,
                pronunciation1: pronunciation1,
                pronunciation2: pronunciation2
            });
        }
        else {
            if (pronunciation.includes('static.memrise.com')) {
                that.words[index].pronunciation = pronunciation;
            }
            that.words[index].pronunciation1 = pronunciation1;
            that.words[index].pronunciation2 = pronunciation2;
        }

        // If mp3s are updated – to process this in the trackPage().
        that.currentWord = '';

        localStorage.setItem('myVocabulary', JSON.stringify(that.words));
    };

    this.indexOf = function(word) {
        for (var i = 0; i < that.words.length; i++) {
            if (that.words[i].word == word) {
                return i;
            }
        }
        return -1;
    };

    this.trackPage = function() {
        console.log('** Tracking...');

        var q = document.getElementById('boxes');

        try {
            if (q == undefined
              || q.children[0].children[1].children[0].children == undefined
              || q.children[0].children[1].children[0].children.length < 2) {
                that.currentWord = '';
                console.log('** Exit (undefined)');
                return;
            }
        }
        catch (exception) {
            console.log('** Exception');
            return;
        }

        var word = '';
        if (q.children[0].children[1].children[0].children[1].children[1].children
           && q.children[0].children[1].children[0].children[1].children[1].children.length > 0)
        {
            word = q.children[0].children[1].children[0].children[1].children[1].children[0].innerText;
        }
        else
        {
            console.log('** No word found.');
            return;
        }

        console.log('** Current word: ' + that.currentWord);
        if (that.currentWord != word) {
            that.currentWord = word;
            that.wordEl.value = that.currentWord;
            console.log('** New current word: ' + that.currentWord);

            var mp31 = document.getElementById('newMp31');
            if (mp31 == null) {
                mp31 = q.children[0].children[1].children[0].children[3];
                if (mp31 != null) {
                    that.pronunciationEl.value = mp31.children[0].children[0].children[0].href;
                }
                else {
                    that.pronunciationEl.value = '';
                    return;
                }
            }

            var index = that.indexOf(that.currentWord);
            if (index >= 0) {
                if (that.pronunciationEl.value == '') {
                    that.pronunciationEl.value = that.words[index].pronunciation ? that.words[index].pronunciation : '';
                }
                that.pronunciationEl1.value = that.words[index].pronunciation1;
                that.pronunciationEl2.value = that.words[index].pronunciation2;

                var mp32 = document.getElementById('newMp32');
                if (mp32 == null) {
                    mp32 = mp31.cloneNode(true);
                    insertAfter(mp32, mp31);
                    mp32.style.left = '40px';

                    mp31.setAttribute('id', 'newMp31');
                    mp32.setAttribute('id', 'newMp32');
                }

                var pronunciation1 = that.words[index].pronunciation1;
                var pronunciation2 = that.words[index].pronunciation2;
                mp31.children[0].children[0].innerHTML =
                    '<a class="audio-player audio-player-hover" href="'
                    + (that.useLocalServer ? that.pathToLocal(pronunciation1) : pronunciation1)
                    + '"></a>';
                mp32.children[0].children[0].innerHTML =
                    '<a class="audio-player audio-player-hover" href="'
                    + (that.useLocalServer ? that.pathToLocal(pronunciation2) : pronunciation2)
                    + '"></a>';
            }
            else {
                that.pronunciationEl1.value = '';
                that.pronunciationEl2.value = '';
            }
        }

        console.log('** Done.');
    };

    this.showLocalStorage = function() {
        document.getElementById('info').value = localStorage.getItem('myVocabulary');
    };

    this.updateLocalStorage = function() {
        localStorage.setItem('myVocabulary', document.getElementById('info').value);
    };

    this.pathToLocal = function(path) {
        return that.httpServerPath + path.substring(path.lastIndexOf('/') + 1);
    };

    this.toResourceOverrideJSON = function() {
        var vocabulary = localStorage.getItem('myVocabulary');
        if (vocabulary != null) {
            that.words = JSON.parse(vocabulary);
        }

        var result = '{"v":1,"data":[{"id":"d1","matchUrl":"https://www.memrise.com/*",';
        result += '\n"rules":[';

        for (var i = 0; i < that.words.length; i++) {
            if (that.words[i].pronunciation) {
                result += '\n{"type":"normalOverride","match":"'
                    + that.words[i].pronunciation
                    + '","replace":"'
                    + (that.useLocalServer ? that.pathToLocal(that.words[i].pronunciation1) : that.words[i].pronunciation1)
                    + '","on":true}' + (i < (that.words.length - 1) ? ',' : '');
            }
        }

        result += ']\n,"on":true}]}';

        document.getElementById('info').value = result;
    }
}

(function() {
    'use strict';

    var h = new Helper();
    h.run(pluginHtml);
    h.appendCss(pluginCss);

    window.helper = h;
    // Your code here...
})();
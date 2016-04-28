//
// @require https://ajax.googleapis.com/ajax/libs/jquery/2.2.0/jquery.min.js
//
(function() {
    var languages = ['el', 'da', 'es', 'it', 'kk', 'zh-CN', 'la', 'nl', 'de',
                     'nb-no', 'pl', 'pt-br', 'tt', 'tr', 'hu', 'fi', 'fr'];

    function removeIt(what) {
        for(var i = 0; i < languages.length; i++) {
            var str = "#Search" + what + "Lang option[value='" + languages[i] + "']";
            $(str).remove();
        }
    }

    removeIt("Src");
    removeIt("Dest");
})();

(function(textInputId) {
    var clicks = 0;
   
    $(textInputId).on('click', function() {
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
        clicks = 0;
    });
})("#searchText");
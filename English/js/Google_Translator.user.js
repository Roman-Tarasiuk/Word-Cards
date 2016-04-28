/* Working version 1
window.onload = function() {
  var src = document.getElementById('source');
  if (src == null) {
    console.log('************************************** null **************************************');
  }
  else {
    console.log('************************************** not null **************************************');
   
    var clicks = 0;
   
    src.onclick = function() {
      if (clicks == 0) {
        src.selectionStart = 0;
        src.selectionEnd = this.textLength;
        clicks = 1;
      }
      else {
        clicks = 0;
      }
    }
   
    src.onblur = function() {
      clicks = 0;
    }
  }
}
//*/

//* Working version 2
window.onload = function(id) {
    var src = document.getElementById(id);
    if (src == null) {
       return;
    }

    var clicks = 0;

    src.onclick = function() {
        if (clicks == 0) {
            src.selectionStart = 0;
            src.selectionEnd = this.textLength;
            clicks = 1;
        }
        else {
            clicks = 0;
        }
    }

    src.onblur = function() {
        clicks = 0;
    }
}('source');
//*/

/* Working version 3
(function(id) {
    var src = document.getElementById(id);
    if (src == null) {
       return;
    }

    var clicks = 0;

    src.onclick = function() {
        if (clicks == 0) {
            src.selectionStart = 0;
            src.selectionEnd = this.textLength;
            clicks = 1;
        }
        else {
            clicks = 0;
        }
    }

    src.onblur = function() {
        clicks = 0;
    }
})('source');
//*/
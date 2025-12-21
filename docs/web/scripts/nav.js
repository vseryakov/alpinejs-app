function scrollToNavItem() {
    var path = window.location.href.split('/').pop().replace(/\.html/, '');
    document.querySelectorAll('nav a').forEach(function(link) {
      var href = link.attributes.href.value.replace(/\.html/, '');
      if (path === href) {
        link.scrollIntoView({block: 'center'});
        return;
      }
    })
}

function lineNumbers() {
    var source = document.getElementsByClassName('prettyprint source linenums');
    var i = 0;
    var lineNumber = 0;
    var lineId;
    var lines;
    var totalLines;
    var anchorHash;

    if (source && source[0]) {
        anchorHash = document.location.hash.substring(1);
        lines = source[0].getElementsByTagName('li');
        totalLines = lines.length;

        for (; i < totalLines; i++) {
            lineNumber++;
            lineId = 'line' + lineNumber;
            lines[i].id = lineId;
            if (lineId === anchorHash) {
                lines[i].className += ' selected';
            }
        }
    }
}

window.addEventListener("DOMContentLoaded", () => {
    scrollToNavItem();
    lineNumbers();
    prettyPrint();
});


function assert(condition, message) {
    if (!condition) {
        throw message || "Assertion failed";
    }
}

chrome.omnibox.onInputChanged.addListener(function(text, suggest) {
    makeSuggestions(text, function(suggestions) {
        var res = [];
        var i;
        for (i = 0; i < suggestions.length; i++) {
            var elem = suggestions[i];
            res.push({content: elem.url, description: escape(elem.title)});
        }

        suggest(res);
    });
});

// chrome.omnibox.onInputEntered.addListener(function(url) {
//     navigate(url);
// });
chrome.runtime.onMessage.addListener(function(data, sender, sendRespones) {
    // data is from message
    if (data.msg === 'pageContent' && shouldArchive(data)) {
        delete data.msg
        data.text = processPageText(data.text);

        var time = data.time
        var keyValue = {}
        keyValue[time] = data;
        chrome.storage.local.set(keyValue, function() {
            console.log("Stored: " + data.title);
        });
    }
});

var BLACKLIST = ['https://www.google.com/_/chrome/newtab']

function shouldArchive(data) {
    for (var url in BLACKLIST) {
        if (data.url.indexOf(url) > -1) return false;
    }

    return true;
}

function processPageText(str) {
    return str.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
}

function makeSuggestions(query, cb) {
    chrome.storage.local.get(null, function(items) {
        var suggestions = [];
        for (var key in items) {
            var obj = items[key];
            if (obj.text.indexOf(query) > -1) {
                suggestions.push(obj);
            }
        }

        cb(suggestions);
    })
}

function escape(str) {
    var ret = '';
    var i;
    for (i = 0; i < str.length; i++) {
        switch (str.charAt(i)) {
        case '"':
            ret += '&quot;';
            break;
        case '\'':
            ret += '&apos;';
            break;
        case '<':
            ret += '&lt;'
            break;
        case '>':
            ret += '&gt;'
            break;
        case '&':
            ret += '&amp;'
            break;
        default:
            ret += str.charAt(i);
        }
    }
    return ret;
}

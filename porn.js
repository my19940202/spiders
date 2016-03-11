var EventProxy = require('eventproxy');
var superagent = require('superagent');
var cheerio = require('cheerio');
var fs = require('fs');

var targetUrlsPrefix = 'https://sezhong.se/forum.php?mod=viewthread&tid=';
var numArr = Array.apply(null, {length: 100}).map(Function.call, Number);
var targetUrlsArr = [];
console.log(new Date(), 'start');
numArr.map(function (val) {
    var tmp = 60000 + val;
    targetUrlsArr.push((targetUrlsPrefix + tmp));
});

var ep = new EventProxy();

ep.after('get_src', targetUrlsArr.length, function (list) {
    var newlist = [];
    list.map(function (val) {
        if (val !== '') {
            newlist.push(val);
        }
    });
    var textStr = newlist.join('\n');
    writeF('porn.csv', textStr);
    console.log(new Date(), 'end');
});
for (var i = 0; i < targetUrlsArr.length; i++) {
  sag(targetUrlsArr[i], getLatestUrl);
}


// 包装一下 superagent get end
function sag(url,callback) {
    superagent.get(url)
    .end(function (err, sres) {
        if (err) {
            console.log(err);
        }
        else {
            callback(sres);
        }
    });
}

function writeF(filename, filestr) {
    fs.writeFile(filename, filestr, function (err) {
        if (err) throw err;
        console.log('It\'s saved!');
    });
}

// 获取页面的porn url 和 title
function getLatestUrl(sres) {
    var $ = cheerio.load(sres.text);
    var html = sres.text;
    var src = '';

    var title = $('title').text();
    var startIdx = html.indexOf('var video=[');
    if (startIdx > 0) {
        html = html.slice((startIdx + 12), html.length);
        var endIdx = html.indexOf('->');
        if (endIdx > 0) {
            src = html.slice(0, endIdx);
        }
    }
    // 触发结果事件
    if (src.length > 0) {
        var tmpstr = title + ',' + src;
        // 测试发现 emit 第二个参数只能为 string
        ep.emit('get_src', tmpstr);
    }
    else {
        ep.emit('get_src', '');
    }
}


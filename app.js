var cheerio = require('cheerio');
var superagent = require('superagent');
var TARGET_URL = 'http://www.521xunlei.com/';
var date = new Date();
console.log(date.toDateString(),'迅雷帐号密码');
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

// 查找当日的url 地址
function getLatestUrl(sres) {
    var $ = cheerio.load(sres.text);
    // 获取最新的url
    var firstLi = $('#portal_block_62_content li');
    var targetDom = firstLi[0].children[firstLi[0].children.length - 1];
    var pageUrl = TARGET_URL + targetDom['attribs']['href'];
    console.log(pageUrl,'目前最新url地址');
    
    // 获取内容页面信息
    sag(pageUrl, getContent);
}

// 获取内容页面的迅雷帐号密码
function getContent(sres) {
    var $ = cheerio.load(sres.text);
    var texts = $('td.t_f')[0];
    var contents = '';

    // cheerio 版本变化 正确获取元素的办法 变化
    var $element = $(texts);
    // 处理帐号密码的文字
    contents = $element.text();
    contents = contents.replace(/[^a-z0-9:/\s]/g,'');
    var tmpArr = contents.split('\n');
    var resultsArr = ['帐号\t密码'];
    tmpArr.map(function (val) {
        var tmpIdx = val.indexOf(':');
        if (tmpIdx > 0) {
            // 在帐号和密码之前加上空格
            var tmpStr = ':' + val[tmpIdx + 1];
            val = val.replace(tmpStr,(tmpStr + '\t'));
            resultsArr.push(val);
        }
    });
    console.log(resultsArr.join('\n'));
    
}
//  run
function thunderAccounts() {
    sag(TARGET_URL, getLatestUrl);
}

exports.thunderAccounts = thunderAccounts;
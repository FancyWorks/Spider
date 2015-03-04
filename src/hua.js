/**
 * Created by Ken on 15/2/27.
 */
"use strict";
var logger = require('./logger').logger;
var http = require('http');
var fs = require('fs');
var Q = require('q');
var $ = require('jquery')(require("jsdom").jsdom().parentWindow);
var iconv = require('iconv-lite');
var db = require('./db');
var _ = require('lodash');

var urls = ["http://dlfd.gov.cn/fdc/D01XmxxAction.do?Control=lxxdetail_1&xmid=711094368&lid=123075",
"http://dlfd.gov.cn/fdc/D01XmxxAction.do?Control=lxxdetail_1&xmid=711094368&lid=123076",
"http://dlfd.gov.cn/fdc/D01XmxxAction.do?Control=lxxdetail_1&xmid=711167349&lid=123307",
"http://dlfd.gov.cn/fdc/D01XmxxAction.do?Control=lxxdetail_1&xmid=711167349&lid=123308",
"http://dlfd.gov.cn/fdc/D01XmxxAction.do?Control=lxxdetail_1&xmid=711094368&lid=123077",
"http://dlfd.gov.cn/fdc/D01XmxxAction.do?Control=lxxdetail_1&xmid=711312477&lid=123309",
"http://dlfd.gov.cn/fdc/D01XmxxAction.do?Control=lxxdetail_1&xmid=711094368&lid=123078",
"http://dlfd.gov.cn/fdc/D01XmxxAction.do?Control=lxxdetail_1&xmid=711167349&lid=123310",
"http://dlfd.gov.cn/fdc/D01XmxxAction.do?Control=lxxdetail_1&xmid=711167349&lid=123311",
"http://dlfd.gov.cn/fdc/D01XmxxAction.do?Control=lxxdetail_1&xmid=711167349&lid=123312",
"http://dlfd.gov.cn/fdc/D01XmxxAction.do?Control=lxxdetail_1&xmid=711167349&lid=123313",
"http://dlfd.gov.cn/fdc/D01XmxxAction.do?Control=lxxdetail_1&xmid=711312477&lid=123314"];


/**
 * get content of url
 * */
function GetUrlContent(url) {
    var deferred = Q.defer();
    http.get(url, function(res) {
        var data=[];
        var size = 0;
        res.on('data', function(d) {
            size += d.length;
            data.push(d);
        });
        res.on('end', function(d) {
            logger.info('GetUrlContent OK, url=',url);
            deferred.resolve(iconv.decode(Buffer.concat(data,size),'gbk'));
        });
    }).on('error', function(e) {
        deferred.reject(e);
        logger.error('GetUrlContent Error, url=',url);
        console.error(e);
    });
    return deferred.promise;
}

/**
 * save text as file
 * */
function WriteFile(filename,content) {
    fs.writeFile(filename,content);
}
/**
 * read content of file as text
 * */
function ReadFileAsString(filename) {
    var deferred = Q.defer();
    fs.readFile(filename,function(error,data){
        if(error) {
            deferred.reject(error);
        }
        else
            deferred.resolve(data.toString());
    });
    return deferred.promise;
}

function GetContent(filename,url,setting) {
    var deferred = Q.defer();
    setting = setting || {reload:false};
    if(setting.reload) {
        GetUrlContent(url).then(function(data){
            WriteFile(filename,data);
            deferred.resolve(data);
        }).catch(function(error){
            deferred.reject(error);
        });
    }
    else {
        ReadFileAsString(filename).then(function(data){
            deferred.resolve(data);
        }).catch(function(error){
            GetUrlContent(url).then(function(data){
                WriteFile(filename,data);
                deferred.resolve(data);
            }).catch(function(error){
                deferred.reject(error);
            });
        });
    }
    return deferred.promise;
}

//ReadFileAsString('package.json').then(function(data){
//    console.log(data);
//});

//var sql = "insert into xm set `id` = '711656614', `bh` = '1258', `area` = NULL, `name` = '南山首府四期', `address` = '胜利东路南.麒麟东巷西', `kfsqy` = '大连恒一嘉元置业有限公司'";
//console.log(iconv.encodingExists('utf-8'));
//console.log(iconv.encodingExists('utf8'));
//sql = iconv.decode(sql,'utf8').toString();
//console.log(sql);

//db.select('xm').then(function(data){
////    console.log(data);
//    console.log(_.findIndex(data,{id:711633379}));
//    console.log(_.findIndex(data,{id:711634149}));
//    console.log(_.findIndex(data,{id:71634149}));
//});

ReadFileAsString('a.txt').then(function(page_content){
//    var str = page_content.substring(page_content.indexOf('点击工程楼号可查询许可销售房源'));
//    var re = /<table.*?<\/table>/;
//    var table_str = re.exec(str)[0];
    var html = $(page_content);
    var tr = html.find('td[bgcolor=#438ece]').first().parent().parent();
    var trs = $(html.find('td[bgcolor=#a6d0e7]')[2]).find('tr');

    var page_text = trs.last().text();
    var total_building_count = /共(\d+)?页/.exec(page_text)[1];
    var page_building_count = /共(\d+)?条记录/.exec(page_text)[1];
    console.log(page_building_count,total_building_count);

    for(var i=1;i<page_building_count;++i){
        //正常楼行, 有5列
        if($(trs[i]).find('>td').size()===5) {
            console.log();
        }
        else {
            //已经到了最后一页的最后一个有效行结束
            break;
        }
    }
});

return 0;

//db.query('delete from xm');
var g_exist_xms = [];
var g_new_xms = [];
var g_url = "http://dlfd.gov.cn/fdc/D01XmxxAction.do?Control=select&pageNo=";
var g_xm_count = 0;
var g_xm_page_count = 0;
var g_reload_page = false;
var g_xmPagePromiseArray = [];

var existXMPromise = db.select('xm');
//existXMPromise.then(function(data){
//    _.forEach(data,function(d){
//        console.log(JSON.stringify(d));
//    });
//});
//return

/**
 * @param page_content
 * analyse xm page, them save xm to g_exist_xms
 * */
function AnalyseXMPage(page_content,xms) {
    var html = $(page_content);
    var tr = html.find('.bluedeeppa12');
    //for xmid & xmbh
    var re = /^.*id=(\d+)?&amp;xmbh=(\d+)?.*$/;
    if(tr.find('td').first().text()==='区域名称') {
        var trs = tr[0].parentNode.children;
        //i=1, skip header
        //TODO: should be trs.length, but it gave me 20, should be 15,
        var length = g_new_xms.length;
        for(var i=1;i<trs.length;++i) {
            var tds = trs[i].children;
            //区域名称,项目名称,项目地址,开发企业名称
            if(tds[1] && tds[1].innerHTML) {
                var link = re.exec(tds[1].innerHTML);
                var xm = {
                    id: link[1],
                    bh: link[2],
                    area: $(tds[0]).text().trim(),
                    name: $(tds[1]).attr('title'),
                    address:$(tds[2]).attr('title'),
                    kfsqy:$(tds[3]).attr('title')
                };
//            console.log(JSON.stringify(xm));
                if(_.findIndex(xms,{id:parseInt(xm.id)})<0)
                    g_new_xms.push(xm);
            }
        }
        console.log('new xms count , ',g_new_xms.length-length);
    }
    else
        logger.error('analyse failed');
}

//Q.all(promiseArray).then(function(){
//    console.log('insert xm count %d',promiseArray.length);
//    console.log('DONE=============');
//});

/**
 * 所有项目列表的页面加载完成
 * */
function AnalyseAllXMPage (xms) {
    Q.all(g_xmPagePromiseArray).then(function(contentArr){
        logger.info('all xm page loaded');
        _.forEach(contentArr,function(content,index){
            console.log('AnalyseXMPage ',index);
            AnalyseXMPage(content,xms);
        });
        console.log('new xm count',g_new_xms.length);
        _.forEach(g_new_xms,function(xm){
            db.insert('xm',xm);
        });
    });
}

var getPageCountPromise = GetContent('./xm_page/xm_page_1.txt',g_url+1,{reload:g_reload_page});
g_xmPagePromiseArray.push(getPageCountPromise);

getPageCountPromise.then(function(content) {
    //1. get page count
    var re1 = /第1页 共(\d+)?页/;
    var re2 = /共(\d+)?条记录/;
    g_xm_page_count = re1.exec(content)[1];
    g_xm_count = re2.exec(content)[1];
    if (g_xm_page_count < 1 || g_xm_count < 1) {
        logger.error('get page count error');
    }
    logger.info('page:%d, total_count:%s',g_xm_page_count,g_xm_count);
    //2. save promise
    for(var i=2; i<=g_xm_page_count; ++i) {
        g_xmPagePromiseArray.push(GetContent('./xm_page/xm_page_'+i+'.txt',g_url+i,{reload:g_reload_page}));
    }
    existXMPromise.then(function(data){
        g_exist_xms = data;
        AnalyseAllXMPage(data);
    });
});


//Q.all([GetContent('./xm_page/xm_page_1.txt',url+1,{reload:false}),existXMPromise]).then(function(dataArr){
//
//}).catch(function(error){
//    console.log(error);
//});

//var str = '&nbsp;<a href="javascript:callNewWindow1(\'/fdc/D01XmxxAction.do?Control=detail&amp;id=711768839&amp;xmbh=4704\',\'_blank\');" class="blue12">中海凤凰熙岸一期<\/a>';
////var str = "javascript:callNewWindow1('/fdc/D01XmxxAction.do?Control=detail&id=711768839&xmbh=4704','_blank');";
//var re = /^.*id=(\d+)?&amp;xmbh=(\d+)?.*$/;
//var r = re.exec(str);
//console.log(r);

/**
 * Created by Ken on 15/2/27.
 */

var http = require('http');
var fs = require('fs');


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

var url = "http://www.baidu.com";
url = urls[0];
function DownLoad(url,i) {
    console.log(i,url);
    http.get(url, function(res) {
        //console.log("statusCode: ", res.statusCode);
        //console.log("headers: ", res.headers);

        var data='';
        res.on('data', function(d) {
            //process.stdout.write(d);
            data += d.toString();
        });
        res.on('end', function(d) {
            fs.writeFile('url'+i+'.html',data);
        });

    }).on('error', function(e) {
        console.error(e);
    });
}


for(var i=0;i<urls.length;i++) {
    DownLoad(urls[i],i+1);
}

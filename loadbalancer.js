var express = require('express');
var http=require('http')
var app = express();
var bodyParser = require('body-parser')
var redis=require("redis")
var client=redis.createClient('6379','localhost');
app.use(bodyParser.urlencoded({ extended: false }));

client.on("error", function(error) {
    console.log(error);
});


function parseCaseId(workitemId){
 
    caseID=workitemId.split(':')[0];
    
    if(caseID.indexOf(".")!=-1){
        caseID=caseID.split(".")[0];
    }

    return caseID;
}

function getRequest(engineAddress,req,res){
       
        sreq=http.request({
                host:     engineAddress.split(":")[0], // 目标主机
                port:     engineAddress.split(":")[1],
                path:     req.path, // 目标路径
                method:   req.method, // 请求方式
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'//,
                }

            }, function(sres){
                sres.pipe(res);
                sres.on('end', function(){
                    console.log('done');
                });
        });

        req.pipe(sreq);
}



app.post('/yawl/ib', function (req, res) {

    var engineAddress 
    if(req.body.workItemID){

        var caseID=parseCaseId(req.body.workItemID); 
    
        client.get('caseEngine:'+caseID,function(err,reply){
            if (err) throw err;

            engineAddress=reply;
            getRequest(engineAddress,req,res);
        }); 
    }
    else{
     
        engineAddress='localhost:8088';
        getRequest(engineAddress,req,res);
        
    }
   
});

app.listen(3001);
console.log('Express started on 127.0.0.1:3001');
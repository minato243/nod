const { createCipher } = require('crypto');
const fs = require('fs');

function solveAFile(filePath){
    fs.readFile(filePath, 'utf-8', function(err, data){
        if(err){
            console.log(err);
            return;
        }
        //console.log(data);
        var jsonObj = JSON.parse(data);
        console.log(JSON.stringify(jsonObj.data));
        var members = jsonObj.data;
        var memberStr = "";
        for (key in members){
            memberStr +=key+"\n";
            console.log(key);
        }
        var newFilePath = filePath.replace('.db', '.ls');

        fs.writeFile(newFilePath, memberStr, (err)=>{
            if (err) throw err;
            console.log('Saved!');
        });
    });
}

var listFile = ['assets/aehoaiduc.db', 'assets/myduyen.db', 'assets/rongbay.db','assets/sunny.db'];
for (var i = 0; i < listFile.length; i ++){
    solveAFile(listFile[i]);
}
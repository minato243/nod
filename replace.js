const { createCipher } = require('crypto');
const fs = require('fs');

function solveAFile(filePath){
    fs.readFile(filePath, 'utf-8', function(err, data){
        if(err){
            console.log(err);
            return;
        }
        
        console.log(data);
        if(data.indexOf("<spine") != -1){
            data = data.replaceAll("<spine/","<spine/spine/",);
            data = data.replaceAll("<spine/spine/spine/", "<spine/spine/")
            var newFilePath = filePath;

            fs.writeFile(newFilePath, data, (err)=>{
                if (err) throw err;
                console.log('Saved!');
            });
        }
        
    });
}
var testFolder = "/Users/admin/Project/Test2/MyGame/frameworks/cocos2d-x/cocos/editor-support/spine/spine/";
var listFile = [];
fs.readdir(testFolder, (err, files) => {
    files.forEach(file => {
      listFile.push(file);
    });
    //console.log(JSON.stringify(listFile));    
    for (var i = 0; i < listFile.length; i ++){
        console.log(listFile[i]);
        if(listFile[i].indexOf(".h") != -1) solveAFile(testFolder+ listFile[i]);
    }
  });

// for (var i = 0; i < listFile.length; i ++){
//     solveAFile(listFile[i]);
// }
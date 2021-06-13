const { createCipher } = require('crypto');
const fs = require('fs');
require("./Entity");
require("./LineSolver.js");

const SRC = "D:\\Project\\Bida3D\\Client\\src\\modules\\physics";
const DST = "D:\\Project\\Bida3D\\BidaCpp\\BidaCpp\\Classes\\modules\\physics";

function solveClassData(classData, classObj){
    var lines = classData.split("\n");
    for (var i = 0; i < lines.length; i ++){
        var line = lines[i];
        if(line.trim().startsWith("//")) continue;
        if(line.indexOf("defineProperty")){
            var property = getPropertyName(line);
            var count = 1;
            var out = false;
            for (var j = i+1; j<lines.length; j ++){
                var lineContent = lines[j];
                for (var k = 0; k < lineContent.length; k ++){
                    if(lineContent[k]== '(') count ++;
                    if(lineContent[k] == ')') count --;
                    if(count == 0){
                        out = true;
                        break;
                    }
                }
                if(out){
                    getFunctionInPropertyBlock(lines, i, j, property, classObj);
                    i = j-1;
                    break;
                }
            }
        }

        if(line.indexOf("function")!= -1){
            genFuncInClass(line, classObj);
        }
        
    }
    //console.log("inside "+ JSON.stringify(classObj));
}

function getFunctionInPropertyBlock(lines, start, end, property, classObj){
    for (var i = start; i < end; i ++){
        var line = lines[i];
        if(line.indexOf("function")!= -1){
            genFuncInClass(line, classObj, property);
        }
    }
}

function genFuncInClass(line, classObj, property){
    line = line.trim();
    var startIdx = 0;
    var endIdx = line.indexOf(":");
    if(endIdx == -1) endIdx = line.indexOf("=");
    var funcName = line.substring(startIdx, endIdx);
    if(funcName.indexOf("proto.") != -1) 
        funcName = funcName.replace("proto.", "");
    if(property != undefined) funcName = funcName + property;
    var funcObj = FuncObj(funcName);

    startIdx = line.indexOf("(");
    endIdx = line.indexOf(")");
    paramData = line.substring(startIdx+1, endIdx);
    paramList =[];
    if(paramData.length >0) 
        paramList = paramData.split(",");
    params = [];
    for (var j = 0; j < paramList.length; j ++){
        params.push({type:"", name: paramList[j]});
    }
    funcObj.setParamList(params);
    classObj.funcList.push(funcObj);
}

function solveAFile(filePath, dstPath){
    console.log("solveAFile "+filePath);
    fs.readFile(filePath, 'utf-8', function(err, data){
        if(err){
            console.log(err);
            return;
        }

        data = data.trim();
        var startIdx = data.indexOf("function");
        data = data.substring(startIdx);
        //console.log(data);
        if(data.startsWith("function")){
            var lines = data.split("\n");
            line = lines[0];
            if(line.indexOf("function") != -1){
                var startIdx = 9;
                var endIdx = line.indexOf("(");
                var className = line.substring(startIdx, endIdx);
            }
            var classObj = ClassObj(className);

            startIdx = data.indexOf("{");
            var num = 1;
            for (var i = startIdx; i < data.length; i ++){
                if(data[i]=='{') num ++;
                if(data[i] == '}') num --;
                if(num == 0) break;
            }
            endIdx = i;

            var classData = data.substring(startIdx, endIdx);
            solveClassData(classData, classObj);
            console.log("outside "+JSON.stringify(classObj));
            var filePathH = dstPath.replace(".js",".h");
            fs.writeFile(filePathH, classObj.renderH(), (err)=>{
                if (err) throw err;
                console.log('Saved filePathH!');
            });

            var filePathCpp = dstPath.replace(".js", ".cpp");
            var fileName = "";
            var startIdx = filePathCpp.lastIndexOf("/");
            var endIdx = filePathCpp.lastIndexOf(".");
            fileName= filePathCpp.substring(startIdx+1, endIdx);
            var contentCpp = "";
            contentCpp+=genBeginerOfCpp(fileName);
            contentCpp+= genContentCpp(classData, classObj.className);

            fs.writeFile(filePathCpp, contentCpp, (err)=>{
                if (err) throw err;
                console.log('Saved '+filePathCpp);
            });
        }
                
    });
}

function genBeginerOfCpp(fileName, className){
    result ="";
    result += "#include \""+fileName+".h\"\n\n";
    return result;    
}

function genContentCpp(classData, className){
    var contentCpp = "";
    var lines = classData.split("\n");
    for (var i = 0; i < lines.length; i ++){
        var line = lines[i];
        if(line.indexOf("defineProperty")){
            var count = 1;
            var out = false;
            for (var j = i+1; j<lines.length; j ++){
                var lineContent = lines[j];
                for (var k = 0; k < lineContent.length; k ++){
                    if(lineContent[k]== '(') count ++;
                    if(lineContent[k] == ')') count --;
                    if(count == 0){
                        out = true;
                        break;
                    }
                }
                if(out){
                    var newBlock = solveDefinePropertyBlock(lines, i, j, className);
                    console.log("newBlock", lines[j]);
                    contentCpp += newBlock+"\n";
                    i = j+1;
                    break;
                }
                
            }
        }
        var newLine = solveALine(lines[i], className);
        contentCpp += newLine+"\n";
    }
    console.log("genContentCpp ***\n"+ contentCpp);
    return contentCpp; 
}

searchList = ["},", "push", "==="];
replacementList = ["}", "push_back", "=="];
function solveALine(line, className, property){
    if(line.trim().startsWith("//")) return line;
    var newLine = "";
    if(line.indexOf("function")!= -1){
        line = line.trim();
        var startIdx = 0;
        var endIdx = line.indexOf(":");
        if(endIdx == -1) endIdx = line.indexOf("=");
        var funcName = line.substring(startIdx, endIdx);
        if(funcName.indexOf("proto.") != -1) 
                funcName = funcName.replace("proto.", "");
        if(property != undefined) funcName = funcName+property;
        var funcObj = FuncObj(funcName);

        startIdx = line.indexOf("(");
        endIdx = line.indexOf(")");
        paramData = line.substring(startIdx+1, endIdx);
        paramList =[];
        if(paramData.length >0) 
            paramList = paramData.split(",");
        params = [];
        for (var j = 0; j < paramList.length; j ++){
            params.push({type:"", name: paramList[j]});
        }
        funcObj.setParamList(params);
        newLine = funcObj.renderCpp(className);
        var subStr = line.substring(0, endIdx+1);
        newLine = line.replace(subStr, newLine);
    } else if(line.indexOf("throw") != -1){
        startIdx = line.indexOf("\"");
        endIdx = line.lastIndexOf("\"");
        var message = line.substring(startIdx+1, endIdx);
        newLine = "throw \""+ message+"\";";
    }else {
        for (var i = 0;i < searchList.length; i ++){
            const search = searchList[i];
            const replacer = new RegExp(search, 'g');
            line = line.split(search).join(replacementList[i]);
        }
        return line;
    }
    return newLine;
}

function solveDefinePropertyBlock(lines, start, end, className){
    console.log("solveDefinePropertyBlock", start, end);
    var newContent = "";
    var startLine = lines[start];
    var property = getPropertyName(startLine);
    for (var i = start+1; i < end; i ++){
        var line = lines[i];
        var newLine = solveALine(line, className, property);
        newContent+=newLine +"\n";
    }
    return newContent;
}

function getPropertyName(data){
    var property = "property";
    if (data.indexOf("defineProperty") != -1){
        var startIdx = data.indexOf("(");
        var subStr = data.substring(startIdx, data.length);
        var params = subStr.split(",");
        var property = params[1].trim();
        property = property.substring(1, property.length -1);
        property = property.charAt(0).toUpperCase() + property.substring(1);
        console.log("property",property);
    }
    return property;
}

function solve(srcPath, dstPath){
    console.log("solve "+ srcPath, dstPath);
    var callback = function(){
        let listFile = [];
        fs.readdir(srcPath, (err, files) => {
            files.forEach(file => {
                var newPath = srcPath+"/"+file;
                var newDstPath = dstPath +"/"+file;
                fs.lstat(newPath, (err, stats) => {
                    if(err)
                        return console.log(err); //Handle error
                    if(stats.isDirectory()){
                        solve(newPath, newDstPath);
                    } else {
                        solveAFile(newPath, newDstPath);
                    }
                });
            }); 
        
          })
      }
    try {
        if (fs.existsSync(dstPath)) {
            callback();
        } else {
            fs.mkdir(dstPath, callback);
        }
      } catch(err) {
        console.error(err)
      }
      
};

function removeText(filePath){
    console.log("removeText "+filePath);
    fs.readFile(filePath, 'utf-8', function(err, data){
        if(err){
            console.log(err);
            return;
        }

        data = data.trim();
        var newContent = LineSolver().removeAllTextAfterChar(data, "=");

        fs.writeFile(filePath+".new", newContent, (err)=>{
            if (err) throw err;
            console.log('Saved '+filePath);
        });
    });               
};

function insertText(filePath){
    console.log("removeText "+filePath);
    fs.readFile(filePath, 'utf-8', function(err, data){
        if(err){
            console.log(err);
            return;
        }

        var newContent = LineSolver().insertAllBeginLine(data, "const double ", "PhysicsConstants");

        fs.writeFile(filePath, newContent, (err)=>{
            if (err) throw err;
            console.log('Saved '+filePath);
        });
    });     
}


//solveAFile(SRC+"/PhysicsConstants.js", DST+"/PhysicsConstants.js");

//removeText("D:\\Project\\Bida3D\\BidaCpp\\BidaCpp\\Classes\\modules\\physics/PhysicsConstants.h");
insertText("D:\\Project\\Bida3D\\BidaCpp\\BidaCpp\\Classes\\modules\\physics/PhysicsConstants.cpp");
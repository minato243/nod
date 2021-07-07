const { createCipher } = require('crypto');
const fs = require('fs');
require("./Entity");
require("./LineSolver.js");
require("./src/AttObj.js");

const SRC = "D:\\Project\\Bida3D\\Client\\src\\modules\\camera-view/utils";
const DST = "D:\\Project\\Bida3D\\Bida3DCpp\\Classes\\modules\\scene";

function solveClassData(classData, classObj){
    let lines = classData.split("\n");
    for (let i = 0; i < lines.length; i ++){
        const line = lines[i];
        if(line.trim().startsWith("//")) continue;
        if(line.indexOf("defineProperty") !== -1){
            let property = getPropertyName(line);
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

        if(line.indexOf("function")!== -1){
            genFuncInClass(line, classObj);
        } else if(line.indexOf("this.") != -1 && line.indexOf("=") > line.indexOf("this.")){
            let s = line.indexOf("this.")+5;
            let e;
            for (j = s; j < line.length; j ++){
                if(line[j]== ' ' || line[j] == "\=" || line[j] == '.'){
                    e = j;
                    break;
                }
            }
            let attName = line.substr(s, e-s).trim();
            let attType = AttObj.getTypeFromName(attName);
            classObj.addAtt(attName, attType);
        }
        
    }
    //console.log("inside "+ JSON.stringify(classObj));
}

function getFunctionInPropertyBlock(lines, start, end, property, classObj){
    for (var i = start; i < end; i ++){
        var line = lines[i];
        if(line.indexOf("function")!== -1){
            genFuncInClass(line, classObj, property);
        }
    }
}

function genFunctionInLine(line, property, className){
    line = line.trim();
    let startIdx = 0;
    let endIdx = line.indexOf(":");
    if(endIdx === -1) endIdx = line.indexOf("=");
    let funcName = line.substring(startIdx, endIdx);
    if(funcName.indexOf("proto.") !== -1)
        funcName = funcName.replace("proto.", "");
    if(property !== undefined) funcName = funcName + property;
    let funcObj = FuncObj(funcName);
    funcObj.reType = AttObj.getTypeFromName(funcName, true);
    if(funcName === 'ctor'){
        funcObj.reType = '';
        funcObj.funcName = className;
    }
    console.log("line", line, "funcObj.reType", funcObj.reType, "property", property);

    startIdx = line.indexOf("(");
    endIdx = line.indexOf(")");
    let paramData = line.substring(startIdx+1, endIdx);
    let paramList =[];
    if(paramData.length >0)
        paramList = paramData.split(",");
    let params = [];
    for (let j = 0; j < paramList.length; j ++){
        let name = paramList[j].trim();
        let type =  AttObj.getTypeFromName(name, false);
        params.push(AttObj(name, type));
    }
    funcObj.setParamList(params);
    funcObj.endIdx = endIdx;
    console.log("paramData", paramData, "endIdx", endIdx);
    return funcObj;
}

function genFuncInClass(line, classObj, property){
    let funcObj = genFunctionInLine(line, property, classObj.className);
    classObj.funcList.push(funcObj);
}

function genAttInClass(line, classObj){
    line = line.trim();
    var startIdx = line.indexOf("this.");
    var endIdx = line.indexOf("=");
    var attName = line.substring(startIdx+5, endIdx).trim();
    // if(attName.indexOf("proto.") != -1) 
    //     attName = attName.replace("proto.", "");
    // if(property != undefined) attName = attName + property;
    var attType = getTypeFromName(attName, false);
    var attObj = AttObj(attName, attType);
    classObj.addAtt(attObj);
}

function getFuncName(line, property){
    console.log("line", line);
    line = line.trim();
    var startIdx = 0;
    var endIdx = line.indexOf(":");
    if(endIdx == -1) endIdx = line.indexOf("=");
    if(endIdx == -1) {
        startIdx = line.indexOf("function")+9;
        endIdx = line.indexOf("(");
    }
    var funcName = line.substring(startIdx, endIdx);
    funcName = funcName.trim();
    if(funcName.indexOf("proto.") != -1) 
            funcName = funcName.replace("proto.", "");
    if(property != undefined) funcName = funcName+property;
    return funcName;
}

function getTypeFromName(attName, isFunc){
    nameList = ["cue", "_cue", "width", "height"];
    typeList = ["Cue* ", "Cue *", "double", "double"];

    for (var i = 0; i < nameList.length; i ++){
        if(attName == nameList[i] || attName == "_"+nameList[i]){
            return typeList[i];
        }
    }

    preList = ["is", "check"];
    preTypeList = ["bool", "bool"];
    for (var i = 0; i < preList.length; i ++){
        if(attName.startsWith(preList[i])){
            return preTypeList[i];
        }
    }

    memberList = ["velocity", "position", "acceleration"];
    typeListOfMember = ["Vec3", "Vec3", "Vec3"];

    for (var i = 0; i < memberList.length; i ++){
        if(attName.indexOf(memberList[i]) != -1){
            return typeListOfMember[i];
        }
    }
    if(isFunc) return "void";
    return "int";
}

function solveAFile(filePath, dstPath){
    console.log("solveAFile "+filePath);
    fs.readFile(filePath, 'utf-8', function(err, data){
        let endIdx;
        if(err){
            console.log(err);
            return;
        }
        let className = "";
        data = data.trim();
        let startIdx = data.indexOf("function");
        let startExtend = data.indexOf("extend");
        if(startIdx > startExtend && startExtend != -1) {
            startIdx = startExtend;
            let classNameData = data.substr(0, startIdx);
            console.log("classNameData", classNameData);
            let lines = classNameData.split("\n");
            let line = lines[lines.length -1];
            endIdx = line.indexOf("=");
            let words = line.substr(0, endIdx).trim().split(" ");
            className = words[words.length -1].trim();
            console.log("words", words);
        } else {
            data = data.substring(startIdx);
            var lines = data.split("\n");
            let line = lines[0];
            if(line.indexOf("function") != -1){
                startIdx = 9;
                endIdx = line.indexOf("(");
                className = line.substring(startIdx, endIdx);
            }
        }
        //console.log(data);
        if(true || data.startsWith("function")){
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
            //console.log("outside "+JSON.stringify(classObj));
            var filePathH = dstPath.replace(".js",".h");
            if (fs.existsSync(filePathH) && !replaceOldFile) {
                filePathH +=".new";
            }
            fs.writeFile(filePathH, classObj.renderH(), (err)=>{
                if (err) throw err;
                console.log('Saved filePathH!');
            });

            var filePathCpp = dstPath.replace(".js", ".cpp");
            var fileName = "";
            startIdx = filePathCpp.lastIndexOf("/");
            endIdx = filePathCpp.lastIndexOf(".");
            fileName= filePathCpp.substring(startIdx+1, endIdx);
            var contentCpp = "";
            contentCpp+=genBeginerOfCpp(fileName);
            contentCpp+= genContentCpp(classData, classObj.className);
            if (fs.existsSync(filePathCpp) && !replaceOldFile) {
                filePathCpp +=".new";
            }
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
        if(line.indexOf("defineProperty") !== -1){
            var count = 1;
            var out = false;
            for (var j = i+1; j<lines.length; j ++){
                var lineContent = lines[j];
                for (var k = 0; k < lineContent.length; k ++){
                    if(lineContent[k]=== '(') count ++;
                    if(lineContent[k] === ')') count --;
                    if(count === 0){
                        out = true;
                        break;
                    }
                }
                if(out){
                    let newBlock = solveDefinePropertyBlock(lines, i, j, className);
                    console.log("newBlock", lines[j]);
                    contentCpp += newBlock+"\n";
                    i = j+1;
                    break;
                }
                
            }
        }
        let newLine = solveALine(lines[i], className);
        contentCpp += newLine+"\n";
    }
    //console.log("genContentCpp ***\n"+ contentCpp);
    return contentCpp; 
}

searchList = ["Math.floor", "Math.PI", "Math.sqrt", "Math.max", "Math.min", "Math.atan", "Math.tan", "cc.math.vec3", "},", "push", "===", "Math.PI", "this.", "const ", "let "];
replacementList = ["floor", "ExtMath::PI", "sqrt", "max", "min", "atan", "tan", "Vec3", "}", "push_back", "==", "ExtMath::PI", "this->", "auto ", "auto "];
function solveALine(line, className, property){
    console.log("solveALine "+ line);
    if(line.trim().startsWith("//")) return line;
    let newLine = "";
    if(line.indexOf("function")!== -1){
        let funcObj = genFunctionInLine(line, property, className);
        newLine = funcObj.renderCpp(className);
        let endIdx = funcObj.endIdx;
        let subStr = line.trim().substring(0, endIdx+1);
        newLine = line.replace(subStr, newLine);
    } else if(line.indexOf("throw") !== -1){
        let startIdx = line.indexOf("\"");
        let endIdx = line.lastIndexOf("\"");
        let message = line.substring(startIdx+1, endIdx);
        newLine = "throw \""+ message+"\";";
    }else {
        for (let i = 0; i < searchList.length; i ++){
            const search = searchList[i];
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

        fs.writeFile(filePath, newContent, (err)=>{
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


solveAFile("D:\\Project\\Bida3D"+"/UITestFactory.js", DST+"/UITestFactory.js");

//removeText("D:\\Project\\Bida3D\\BidaCpp\\BidaCpp\\Classes\\modules\\physics/PhysicsConstants.h");
//insertText("D:\\Project\\Bida3D\\BidaCpp\\BidaCpp\\Classes\\modules\\physics/PhysicsConstants.cpp");

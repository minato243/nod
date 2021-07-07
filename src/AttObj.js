AttObj = function (name, type){
    return {
        type:type,
        name:name
    };
}

nameList = ["dx", "dy", "dt"];
typeList = ["double", "double", "double"];

preWordList = ["position"];
preTypeList = ["cocos2d::Vec3"];

containWordList = ["position", "dx", "dy", "dz"];
containTypeList = ["cocos2d::Vec3", "double", "double", "double"];

AttObj.getTypeFromName = function(name, isFunc){
    for (let i = 0; i < nameList.length; i ++){
        if(name == nameList[i]) return typeList[i];
    }

    for (let i = 0; i < preWordList.length; i ++){
        if(name.startsWith(preWordList[i])) return preTypeList[i];
    }

    for (let i = 0; i < containWordList.length; i ++){
        if(name.indexOf(containWordList[i]) !== -1) return containTypeList[i];
    }
    if(isFunc) return "void";
    return "int";
}
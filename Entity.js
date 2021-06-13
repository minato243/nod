ClassObj = function(className){
    ClassO = {
        className:className,
        funcList: [],
        attList: [],

        renderH: function(){
            var result = "";
            result += "#ifndef \t" + "_"+this.className.toUpperCase()+"_H_\n";
            result += "#define \t" + "_"+this.className.toUpperCase()+"_H_\n";
            result +="\n\n";
            result +="#include <cocos2d.h>\n\n";

            result +="USING_NS_CC;\n\n";
            result +="class "+ this.className+"{\n";
            result += "public:\n";
            for (var i = 0; i < this.attList.length; i ++){
                result +="\t"+this.attList[i].attType+" "+ this.attList[i].attName+"\n";
            }
            for (var i = 0; i < this.funcList.length; i ++){
                var funcObj = this.funcList[i];
                result +="\t"+funcObj.renderH()+";\n";
            }
            result+="};\n";
            result +="#endif";
            return result;

        }    
    }
    return ClassO;
}

FuncObj = function(funcName){
    FuncO = {
        funcName: funcName,
        parList: [],
        reType: "void",

        setParamList: function(paramList){
            this.parList = paramList;
        },

        renderH: function(){
            result = this.reType +" "+ this.funcName+"(";
            for (var i = 0; i < this.parList.length; i ++){
                if(i == 0)result += this.parList[i].type + " " + this.parList[i].name;
                else result += ", "+this.parList[i].type + " " + this.parList[i].name;
            }
            result +=")";
            return result;
        },

        renderCpp: function(className){
            result = this.reType +" "+ className+"::"+this.funcName+"(";
            for (var i = 0; i < this.parList.length; i ++){
                if(i == 0)result += this.parList[i].type + " " + this.parList[i].name;
                else result += ", "+this.parList[i].type + " " + this.parList[i].name;
            }
            result +=")";
            return result;
        }
    }
    return FuncO;
}

AttObj = function(name, type){
    AttO = {
        type: type,
        name: name,
    };

    return AttO;
}
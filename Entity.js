require("./src/AttObj.js");

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

            result +="class "+ this.className+"{\n";
            result += "public:\n";

            result+="\n";
            for (var i = 0; i < this.funcList.length; i ++){
                var funcObj = this.funcList[i];
                result +="\t"+funcObj.renderH()+";\n";
            }
            result+="\n\n";

            result +="private:\n";
            for (var i = 0; i < this.attList.length; i ++){
                result +="\t"+this.attList[i].type+" "+ this.attList[i].name+";\n";
            }
            result+="};\n";
            result +="#endif";
            return result;
        },

        addAtt: function(name, type){
            for (let i = 0; i < this.attList.length; i ++){
                if(this.attList[i].name == name)
                    return;
            }
            let att = AttObj(name, type);
            this.attList.push(att);
        }

    };
    return ClassO;
};

FuncObj = function(funcName, funcType){
    let FuncO = {
        funcName: funcName,
        parList: [],
        reType: funcType?funcType:"void",

        setParamList: function(paramList){
            this.parList = paramList;
        },

        renderH: function(){
            let result = this.reType +" "+ this.funcName+"(";
            for (var i = 0; i < this.parList.length; i ++){
                if(i == 0)result += this.parList[i].type + " " + this.parList[i].name;
                else result += ", "+this.parList[i].type + " " + this.parList[i].name;
            }
            result +=")";
            return result;
        },

        renderCpp: function(className){
            let result = this.reType +" "+ className+"::"+this.funcName+"(";
            for (var i = 0; i < this.parList.length; i ++){
                if(i === 0) result += this.parList[i].type + " " + this.parList[i].name;
                else result += ", "+this.parList[i].type + " " + this.parList[i].name;
            }
            result +=")";
            return result;
        }
    };
    return FuncO;
};

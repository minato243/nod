LineSolver = function(){
    LineSolverO = {
        removeTextAfterChar: function(line, char){
            var words = line.split(char);
            var word = "\t"+words[0].trim()+";";
            return word;
        },
    
        removeAllTextAfterChar: function(data, char, condition){
            data = data.trim();
            var newContent = "";
            var lines = data.split("\n");
            for (var i = 0; i < lines.length; i ++){
                line = lines[i];
                var newLine = line;
                if(line != "" && line.indexOf(char) != -1) newLine = this.removeTextAfterChar(line, char);
                newContent += newLine +"\n";
            }
            return newContent;
        },

        insertBeginLine: function(line, insertText, condition){
            if(condition != undefined && line.trim().startsWith(condition)){
                var startIdx = line.indexOf(condition);
                newLine = line.substring(0, startIdx)+ insertText + line.substring(startIdx);
                return newLine;
            }
            return line;
        },

        insertAllBeginLine: function(data, insertText, condition){
            data = data.trim();
            var newContent = "";
            var lines = data.split("\n");
            for (var i = 0; i < lines.length; i ++){
                line = lines[i];
                var newLine = line;
                if(line != "") newLine = this.insertBeginLine(line, insertText, condition);
                newContent += newLine +"\n";
            }
            return newContent;
        }
    };
    
    return LineSolverO;
};
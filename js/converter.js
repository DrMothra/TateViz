/**
 * Created by DrTone on 15/12/2016.
 */

var dataLoader = new rawDataLoader();
var csvData;
var outputText;

function dataGridRenderer(dataGrid, headerNames, headerTypes, indent, newLine) {
        //inits...
        var commentLine = "//";
        var commentLineEnd = "";
        var outputText = "[";
        var numRows = dataGrid.length;
        var numColumns = headerNames.length;

        //begin render loop
        for (var i=0; i < numRows; i++) {
            var row = dataGrid[i];
            outputText += "{";
            for (var j=0; j < numColumns; j++) {
                if ((headerTypes[j] == "int")||(headerTypes[j] == "float")) {
                    var rowOutput = row[j] || "null";
                } else {
                    var rowOutput = '"' + ( row[j] || "" ) + '"';
                }

                outputText += ('"'+headerNames[j].replace(/\./g,"_") +'"' + ":" + rowOutput );

                if (j < (numColumns-1)) {outputText+=","}
            }
            outputText += "}";
            if (i < (numRows-1)) {outputText += ","+newLine}
        }
        outputText += "]";

        return outputText;
}

function loadNewFile(file) {
    if(!file) {
        alert("No file selected!");
        return;
    }

    //Render new data
    var _this = this;
    window.URL = window.URL || window.webkitURL;

    var fileUrl = window.URL.createObjectURL(file);
    dataLoader.load(fileUrl, function(data) {
        //_this.data = data;
        csvData = data;
        //DEBUG
        console.log("File loaded");

        var parseOutput = parse(data, true , "auto", false, false);

        var dataGrid = parseOutput.dataGrid;
        var headerNames = parseOutput.headerNames;
        var headerTypes = parseOutput.headerTypes;
        var errors = parseOutput.errors;

        outputText = dataGridRenderer(dataGrid, headerNames, headerTypes, "  ", "\n");

        $('#converted').html(" File converted");
    });
}

function saveFile() {
    var bb = window.Blob;
    var filename = "testData.json";
    saveAs(new bb(
        [outputText]
        , {type: "text/plain;charset=" + document.characterSet}
        )
        , filename);
}

$(document).ready(function() {
    $("#chooseFile").on("change", function(evt) {
        loadNewFile(fileManager.onSelectFile(evt));
    });

    $("#saveFile").on("click", function() {
        saveFile();
    })
});


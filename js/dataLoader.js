/**
 * Created by DrTone on 17/02/2015.
 */
//Loads and parses json files from local storage

var dataLoader = function () {
    this.convertData = false;
};

dataLoader.prototype.conversionRequired = function(convert) {
    this.convertData = convert;
};

dataLoader.prototype.load = function(url, callback) {
    this.loadAjaxData(this, url, callback);
};

dataLoader.prototype.loadAjaxData = function(context, url, callback) {
    var xhr = new XMLHttpRequest();
    var _this = this;
    var length = 0;

    xhr.onreadystatechange = function () {

        if ( xhr.readyState === xhr.DONE ) {

            if ( xhr.status === 200 || xhr.status === 0 ) {

                if ( xhr.responseText ) {

                    var data = xhr.responseText;
                    if(_this.convertData) {
                        data = _this.convert(data);
                    }
                    var json = JSON.parse( data );

                    callback( json );

                } else {

                    console.error( 'DataLoader: "' + url + '" seems to be unreachable or the file is empty.' );

                }

            } else {

                console.error( 'DataLoader: Couldn\'t load "' + url + '" (' + xhr.status + ')' );

            }

        } else if ( xhr.readyState === xhr.LOADING ) {


        } else if ( xhr.readyState === xhr.HEADERS_RECEIVED ) {


        }

    };

    xhr.open( 'GET', url, true );
    xhr.send( null );
};

dataLoader.prototype.convert = function(data) {
    var parseOutput = parse(data, true , "auto", false, false);

    var dataGrid = parseOutput.dataGrid;
    var headerNames = parseOutput.headerNames;
    var headerTypes = parseOutput.headerTypes;
    var errors = parseOutput.errors;

    return dataGridRenderer(dataGrid, headerNames, headerTypes, "  ", "\n");
};
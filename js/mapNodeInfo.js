/**
 * Created by tonyg on 08/11/2016.
 */
//Map node information

var MapNodeInfo = function() {
    //Links
    this.madeBy = [];
};

MapNodeInfo.prototype = {
    setIndex: function(index) {
        this.index = index;
    },

    setCountry: function(country) {
        this.country = country;
    },

    getCountry: function() {
        return this.country;
    },

    addCreator: function(names) {
        this.madeBy.push(names);
    }
};
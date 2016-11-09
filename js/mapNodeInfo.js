/**
 * Created by tonyg on 08/11/2016.
 */
//Map node information

var MapNodeInfo = function() {

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
    }
};
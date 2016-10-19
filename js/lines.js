/**
 * Created by tonyg on 19/10/2016.
 */
//Attributes for lines

var LINES = (function() {

    var lineMats = {
        "red": new THREE.LineBasicMaterial({color: 0xff0000}),
        "green": new THREE.LineBasicMaterial({color: 0x00ff00}),
        "darkBlue": new THREE.LineBasicMaterial({color: 0x1d26bb}),
        "lightBlue": new THREE.LineBasicMaterial({color: 0x6aa8de}),
        "orange": new THREE.LineBasicMaterial({color: 0xf05d0e}),
        "yellow": new THREE.LineBasicMaterial({color: 0xe1d413}),
        "purple": new THREE.LineBasicMaterial({color: 0x5e17de}),
        "brown": new THREE.LineBasicMaterial({color: 0x894414})
    };

    return {
        LineColours: lineMats
    };

})();
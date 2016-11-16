/**
 * Created by tonyg on 19/10/2016.
 */
//Attributes for lines

var LINES = (function() {

    var lineMats = {
        "red": new THREE.LineBasicMaterial({color: 0xff0000}),
        "redOrange": new THREE.LineBasicMaterial({color: 0xfd5308}),
        "orange": new THREE.LineBasicMaterial({color: 0xfb9902}),
        "yellowOrange": new THREE.LineBasicMaterial({color: 0xfabc02}),
        "yellow": new THREE.LineBasicMaterial({color: 0xffff00}),
        "yellowGreen": new THREE.LineBasicMaterial({color: 0xbcd902}),
        "green": new THREE.LineBasicMaterial({color: 0x4ab002}),
        "blueGreen": new THREE.LineBasicMaterial({color: 0x0392ce}),
        "blue": new THREE.LineBasicMaterial({color: 0x0000ff}),
        "blueViolet": new THREE.LineBasicMaterial({color: 0x3d01a4}),
        "violet": new THREE.LineBasicMaterial({color: 0x8601af}),
        "redViolet": new THREE.LineBasicMaterial({color: 0xca0045}),
        "black": new THREE.LineBasicMaterial({color: 0x000000}),
        "white": new THREE.LineBasicMaterial({color: 0xffffff}),
        "country": new THREE.LineBasicMaterial({color: 0xf0981c})
    };

    return {
        LineColours: lineMats
    };

})();
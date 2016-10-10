/**
 * Created by atg on 10/10/2016.
 */
//Shape types for use in graphical apps

var SHAPES = (function() {
    var sphereRad = 10, sphereSegments = 24;
    var cubeWidth = 20, cubeHeight = 20, cubeDepth = 20;
    var radiusTop = 10, radiusBottom = 10, cylinderHeight = 10, cylSegments = 16;
    var octRadius = 10, octDetail = 0;
    var tubeRadius = 3;

    var nodeShapes = {
        "sphere": new THREE.SphereBufferGeometry(sphereRad, sphereSegments, sphereSegments),
        "cube": new THREE.BoxBufferGeometry(cubeWidth, cubeHeight, cubeDepth),
        "cylinder": new THREE.CylinderBufferGeometry(radiusTop, radiusBottom, cylinderHeight, cylSegments, cylSegments),
        "octahedron": new THREE.OctahedronGeometry(octRadius, octDetail),
        "cone": new THREE.ConeBufferGeometry(radiusBottom, cylinderHeight, cylSegments),
        "torus": new THREE.TorusBufferGeometry(radiusBottom, tubeRadius, cylSegments, cylSegments)
    };

    var nodeMats = {
        "red": new THREE.MeshPhongMaterial({color: 0xff0000}),
        "green": new THREE.MeshPhongMaterial({color: 0x00ff00}),
        "darkBlue": new THREE.MeshPhongMaterial({color: 0x1d26bb}),
        "lightBlue": new THREE.MeshPhongMaterial({color: 0x6aa8de}),
        "orange": new THREE.MeshPhongMaterial({color: 0xf05d0e}),
        "yellow": new THREE.MeshPhongMaterial({color: 0xe1d413}),
        "purple": new THREE.MeshPhongMaterial({color: 0x5e17de}),
        "brown": new THREE.MeshPhongMaterial({color: 0x894414})
    };

    return {
        Shapes: nodeShapes,
        Materials: nodeMats
    };
})();

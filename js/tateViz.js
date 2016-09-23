/**
 * Created by DrTone on 04/12/2014.
 */
//Visualisation framework

var NUM_NODES = 9;

//Init this app from base
function Tate() {
    BaseApp.call(this);
}

Tate.prototype = new BaseApp();

Tate.prototype.init = function(container) {
    BaseApp.prototype.init.call(this, container);
    //GUI
    this.guiControls = null;
    this.gui = null;
};

Tate.prototype.createScene = function() {
    //Create scene
    BaseApp.prototype.createScene.call(this);

    //Load example object
    var sphereGeom = new THREE.SphereBufferGeometry(10, 16, 16);
    var sphereMat = new THREE.MeshPhongMaterial({color: 0xb5b5b5, transparent: false, opacity: 0.5});
    var i;
    this.nodes = [];
    for(i=0; i<NUM_NODES; ++i) {
        this.nodes.push(new THREE.Mesh(sphereGeom, sphereMat));
        this.scene.add(this.nodes[i]);
    }
};

Tate.prototype.createGUI = function() {
    //GUI - using dat.GUI
    this.guiControls = new function() {

    };

    var gui = new dat.GUI();

    //Add some folders
    this.guiAppear = gui.addFolder("Appearance");
    this.guiData = gui.addFolder("Data");
    this.gui = gui;
};

Tate.prototype.update = function() {
    //Perform any updates

    BaseApp.prototype.update.call(this);
};

$(document).ready(function() {
    //Initialise app
    var container = document.getElementById("WebGL-output");
    var app = new Tate();
    app.init(container);
    app.createScene();
    app.createGUI();

    //GUI callbacks

    app.run();
});
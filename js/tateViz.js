/**
 * Created by DrTone on 04/12/2014.
 */
//Visualisation framework

var NUM_ROWS = 3;
var NUM_COLS = 3;

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
    var i=1;
    var sphereMat = [];
    sphereMat.push(new THREE.MeshPhongMaterial( {color: 0xff0000} ));
    sphereMat.push(new THREE.MeshPhongMaterial( {color: 0x00ff00} ));
    sphereMat.push(new THREE.MeshPhongMaterial( {color: 0x0000ff} ));

    var row, col, xStart = -100, xInc = 100, yStart = 0, zStart = -100, zInc = 100;
    var sphere, label, labelOffset = 10;
    var labelScale = new THREE.Vector3(30, 30, 1);
    var pos = new THREE.Vector3();
    this.nodes = [];
    for(row=0; row<NUM_ROWS; ++row) {
        for(col=0; col<NUM_COLS; ++col) {
            sphere = new THREE.Mesh(sphereGeom, sphereMat[row]);
            this.nodes.push(sphere);
            pos.set(xStart + (xInc * col), yStart, zStart + (zInc * row));
            sphere.position.set(pos.x, pos.y, pos.z);
            this.scene.add(sphere);
            pos.y += labelOffset;
            label = spriteManager.create("Artwork "+i, pos, labelScale, 32, 1, true, false);
            this.scene.add(label);
            ++i;
        }
    }
};

Tate.prototype.createGUI = function() {
    //GUI - using dat.GUI
    var _this = this;
    this.guiControls = new function() {
        this.Background = '#5c5f64';
        this.LabelWidth = 1.0;
        this.LabelHeight = 1.0;
    };

    var gui = new dat.GUI();

    //Add some folders
    this.guiAppear = gui.addFolder("Appearance");
    this.guiAppear.addColor(this.guiControls, 'Background').onChange(function(value) {
        _this.renderer.setClearColor(value, 1.0);
    });
    this.guiAppear.add(this.guiControls, 'LabelWidth', 0.25,  3.0).step(0.25);
    //this.guiData = gui.addFolder("Data");
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
/**
 * Created by DrTone on 04/12/2014.
 */
//Visualisation framework

var NUM_ROWS = 3;
var NUM_COLS = 3;
var WIDTH = 0;
var HEIGHT = 1;
var RED=0, BLUE=1, GREEN=2;

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

    //Camera offsets
    this.tempPos = new THREE.Vector3();
    this.viewOffset = new THREE.Vector3(0, 20, 70);
    this.showInfo = false;

    //Define all object types
    var sphereRad = 10, sphereSegments = 24;
    var cubeWidth = 20, cubeHeight = 20, cubeDepth = 20;
    var radiusTop = 10, radiusBottom = 10, cylinderHeight = 10, cylSegments = 16;
    var octRadius = 10, octDetail = 0;
    var nodeShapes = {
        "sphere": new THREE.SphereBufferGeometry(sphereRad, sphereSegments, sphereSegments),
        "cube": new THREE.BoxBufferGeometry(cubeWidth, cubeHeight, cubeDepth),
        "cylinder": new THREE.CylinderBufferGeometry(radiusTop, radiusBottom, cylinderHeight, cylSegments, cylSegments),
        "octahedron": new THREE.OctahedronGeometry(octRadius, octDetail)

    };
    //Object materials
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

    //Groups
    var nodeGroupNames = [
        "Artists",
        "Researchers",
        "Curators",
        "Instigators",
        "Performances",
        "Interventions",
        "Exhibitions",
        "Initiatives",
        "Other",
        "Institutions - Art",
        "Institutions - Other",
        "Public"
    ];
    var numGroups = nodeGroupNames.length;

    //Arrange groups
    var i;
    var groupRadius = 300, groupAngle = (Math.PI*2) / numGroups, group;
    var nodeGroups = [];
    var sphereGeom = new THREE.SphereBufferGeometry(20, 32, 32);
    var sphereMat = new THREE.MeshPhongMaterial( {color: 0xffffff, transparent: true, opacity: 0.5} );
    var sphere;
    var label, labelOffset = 15;
    var labelScale = new THREE.Vector3(80, 60, 1);
    var pos = new THREE.Vector3();
    for(i=0; i<numGroups; ++i) {
        group = new THREE.Object3D();
        group.name = nodeGroupNames[i];
        pos.set(groupRadius * Math.sin(groupAngle*i), 0, groupRadius * Math.cos(groupAngle*i));
        group.position.copy(pos);
        nodeGroups.push(group);
        sphere = new THREE.Mesh(sphereGeom, sphereMat);
        sphere.position.copy(group.position);
        this.scene.add(sphere);
        pos.y += labelOffset;
        label = spriteManager.create(nodeGroupNames[i], pos, labelScale, 32, 1, true, false);
        this.scene.add(label);
    }

    /*
    var row, col, xStart = -100, xInc = 100, yStart = 0, zStart = -100, zInc = 100;
    var sphere, label, labelOffset = 10;
    var labelScale = new THREE.Vector3(30, 30, 1);
    var pos = new THREE.Vector3();
    i=1;
    this.nodes = [];
    this.labels = [];
    for(row=0; row<NUM_ROWS; ++row) {
        for(col=0; col<NUM_COLS; ++col) {
            sphere = new THREE.Mesh(nodeShapes["cube"], nodeMats["yellow"]);
            this.nodes.push(sphere);
            sphere.name = "Artwork" + i;
            pos.set(xStart + (xInc * col), yStart, zStart + (zInc * row));
            sphere.position.set(pos.x, pos.y, pos.z);
            this.scene.add(sphere);
            pos.y += labelOffset;
            label = spriteManager.create("Artwork "+i, pos, labelScale, 32, 1, true, false);
            label.name = "Artwork" + i;
            this.labels.push(label);
            this.scene.add(label);
            ++i;
        }
    }
    */

    //Create links
    /*
    var numNodes = this.nodes.length;
    this.links = [];
    for(i=0; i<numNodes; ++i) {
        this.links.push(undefined);
    }
    this.links[0] = 4;
    this.links[1] = 3;
    this.links[2] = 7;
    this.links[4] = 6;
    this.links[8] = 4;

    var lineMats = [];
    lineMats.push(new THREE.LineBasicMaterial( {color: 0xff0000}),
        new THREE.LineBasicMaterial( {color: 0x00ff00}),
        new THREE.LineBasicMaterial( {color: 0x0000ff}));

    var from, to;
    var nodeFrom, nodeTo;
    var lineGeom, line;
    var lineGroup = new THREE.Object3D();
    this.lines = [];
    for(i=0; i<numNodes; ++i) {
        if(this.links[i]) {
            nodeFrom = this.nodes[i];
            from = new THREE.Vector3(nodeFrom.position.x, nodeFrom.position.y, nodeFrom.position.z);
            nodeTo = this.nodes[this.links[i]];
            to = new THREE.Vector3(nodeTo.position.x, nodeTo.position.y, nodeTo.position.z);
            lineGeom = new THREE.Geometry();
            lineGeom.vertices.push(from, to);
            line = new THREE.Line(lineGeom, i<2 ? lineMats[0] : i<8 ? lineMats[1] : lineMats[2]);
            this.lines.push(line);
            lineGroup.add(line);
            this.scene.add(lineGroup);
        }
    }
    */
};

Tate.prototype.createGUI = function() {
    //GUI - using dat.GUI
    var _this = this;
    this.guiControls = new function() {
        this.Background = '#5c5f64';
        this.LabelWidth = 1.0;
        this.LabelHeight = 1.0;
        this.Red = true;
        this.Green = true;
        this.Blue = true;
    };

    var gui = new dat.GUI();

    //Add some folders
    this.guiAppear = gui.addFolder("Appearance");
    this.guiAppear.addColor(this.guiControls, 'Background').onChange(function(value) {
        _this.renderer.setClearColor(value, 1.0);
    });
    var labelWidth = this.guiAppear.add(this.guiControls, 'LabelWidth', 0.25,  10.0).step(0.25);
    labelWidth.onChange(function(value) {
        _this.scaleLabels(value, WIDTH);
    });

    var labelHeight = this.guiAppear.add(this.guiControls, 'LabelHeight', 0.25, 10.0).step(0.25);
    labelHeight.onChange(function(value) {
        _this.scaleLabels(value, HEIGHT);
    });

    this.guiLinks = gui.addFolder("Links");
    var red = this.guiLinks.add(this.guiControls, 'Red');
    red.onChange(function(value) {
        _this.linkChange(value, RED);
    });

    var green = this.guiLinks.add(this.guiControls, 'Green');
    green.onChange(function(value) {
        _this.linkChange(value, GREEN);
    });

    var blue = this.guiLinks.add(this.guiControls, 'Blue');
    blue.onChange(function(value) {
        _this.linkChange(value, BLUE);
    });

    //this.guiData = gui.addFolder("Data");
    this.gui = gui;
};

Tate.prototype.scaleLabels = function(scale, axis) {
    var i, currentScale;
    switch(axis) {
        case WIDTH:
            for(i=0; i<this.labels.length; ++i) {
                currentScale = this.labels[i].scale.y;
                this.labels[i].scale.set(scale*30, currentScale, 1);
            }
            break;

        case HEIGHT:
            for(i=0; i<this.labels.length; ++i) {
                currentScale = this.labels[i].scale.x;
                this.labels[i].scale.set(currentScale, scale*30, 1);
            }
            break;

        default:
            break;
    }
};

Tate.prototype.linkChange = function(visible, colour) {
    switch(colour) {
        case RED:
            this.nodes[0].visible = visible;
            this.nodes[1].visible = visible;
            this.nodes[3].visible = visible;
            this.nodes[4].visible = visible;
            this.lines[0].visible = visible;
            this.lines[1].visible = visible;
            break;

        case GREEN:
            this.nodes[2].visible = visible;
            this.nodes[4].visible = visible;
            this.nodes[6].visible = visible;
            this.nodes[7].visible = visible;
            this.lines[2].visible = visible;
            this.lines[3].visible = visible;
            break;

        case BLUE:
            this.nodes[4].visible = visible;
            this.nodes[8].visible = visible;
            this.lines[4].visible = visible;
            break;

        default:
            break;
    }
};

Tate.prototype.update = function() {
    //Perform any updates

    if(this.selectedObject && !this.showInfo) {
        this.tempPos.copy(this.selectedObject.position);
        this.tempPos.add(this.viewOffset);
        this.camera.position.set(this.tempPos.x, this.tempPos.y, this.tempPos.z );
        this.controls.setLookAt(this.selectedObject.position);
        this.showInfo = true;
        $('#info').show();
        $('#infoName').html(this.selectedObject.name);
    }
    BaseApp.prototype.update.call(this);
};

Tate.prototype.resetCamera = function() {
    this.selectedObject = undefined;
    this.showInfo = false;
    $('#info').hide();
    this.camera.position.copy(this.defaultCamPos);
    this.controls.setLookAt(new THREE.Vector3());
};

$(document).ready(function() {
    //Initialise app
    var container = document.getElementById("WebGL-output");
    var app = new Tate();
    app.init(container);
    app.createScene();
    app.createGUI();

    //GUI callbacks
    $('#infoOK').on("click", function() {
        app.resetCamera();
    });
    app.run();
});
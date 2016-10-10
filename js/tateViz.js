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

    //Camera animation
    this.camAnimating = false;
    this.cameraPath = new THREE.Vector3();
    this.camAnimateTime = 3;

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

    //Groups
    var nodeGroupTypes = [
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
    var numGroups = nodeGroupTypes.length;

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
        group.name = nodeGroupTypes[i];
        pos.set(groupRadius * Math.sin(groupAngle*i), 0, groupRadius * Math.cos(groupAngle*i));
        group.position.copy(pos);
        nodeGroups.push(group);
        this.scene.add(group);
        sphere = new THREE.Mesh(sphereGeom, sphereMat);
        sphere.position.copy(group.position);
        this.scene.add(sphere);
        pos.y += labelOffset;
        label = spriteManager.create(nodeGroupTypes[i], pos, labelScale, 32, 1, true, false);
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

    //Sort nodes into categories
    var type, j, node;
    for(i=0; i<tateData.length; ++i) {
        type = tateData[i]["Type of node"];
        for(j=0; j<numGroups; ++j) {
            if(type === nodeGroupTypes[j]) break;
        }
        node = this.createNode(type);
        if(node) {
            nodeGroups[j].add(node);
        }
    }
};

Tate.prototype.createNode = function(type) {
    //Create node according to type
    var geom = undefined, material = undefined, node;
    switch(type) {
        case "Artists":
            geom = SHAPES.Shapes['sphere'];
            material = SHAPES.Materials['red'];
            break;

        case "Researchers":
            geom = SHAPES.Shapes['cube'];
            material = SHAPES.Materials['orange'];
            break;

        case "Curators":
            geom = SHAPES.Shapes['cylinder'];
            material = SHAPES.Materials['yellow'];
            break;

        case "Instigators":
            geom = SHAPES.Shapes['octahedron'];
            material = SHAPES.Materials['green'];
            break;

        case "Performances":
            geom = SHAPES.Shapes['cone'];
            material = SHAPES.Materials['darkBlue'];
            break;

        case "Interventions":
            geom = SHAPES.Shapes['torus'];
            material = SHAPES.Materials['lightBlue'];
            break;

        case "Exhibitions":
            geom = SHAPES.Shapes['sphere'];
            material = SHAPES.Materials['purple'];
            break;

        case "Initiatives":
            geom = SHAPES.Shapes['cube'];
            material = SHAPES.Materials['brown'];
            break;

        case "Other":
            geom = SHAPES.Shapes['cylinder'];
            material = SHAPES.Materials['red'];
            break;

        case "Institutions - Art":
            geom = SHAPES.Shapes['octahedron'];
            material = SHAPES.Materials['orange'];
            break;

        case "Institutions - Other":
            geom = SHAPES.Shapes['cone'];
            material = SHAPES.Materials['yellow'];
            break;

        case "Public":
            geom = SHAPES.Shapes['torus'];
            material = SHAPES.Materials['green'];
            break;

        default:
            console.log("No type defined");
            break;
    }
    if(geom && material) {
        node = new THREE.Mesh(geom, material);
        return node;
    } else {
        return null;
    }
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

    var delta = THREE.clock.getDelta();

    if(this.selectedObject && !this.camAnimating) {
        this.tempPos.copy(this.selectedObject.position);
        this.tempPos.add(this.viewOffset);
        this.zoomTo(this.tempPos);
        this.camAnimating = true;
    }

    if(this.camAnimating) {
        this.camera.position.set(this.tempPos.x, this.tempPos.y, this.tempPos.z );
        this.controls.setLookAt(this.selectedObject.position);
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

Tate.prototype.zoomTo = function(zoomPos) {
    this.cameraPath.copy(zoomPos);
    this.cameraPath.sub(this.camera.position);
    this.camAnimateSpeed = this.cameraPath.length()/this.camAnimateTime;
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
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
    this.camRotating = false;
    this.cameraPath = new THREE.Vector3();
    this.camAnimateTime = 3;
    this.incPos = new THREE.Vector3();
    this.camRotateTime = 1;
    this.currentLookAt = new THREE.Vector3();

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
    var groupRadius = 300, groupAngle = (Math.PI*2) / numGroups, group, scene;
    var type, j, node;
    var mainNodeGroups = [];
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
        mainNodeGroups.push(group);
        this.scenes[this.currentScene].add(group);
        sphere = new THREE.Mesh(sphereGeom, sphereMat);
        group.add(sphere);
        node = this.createNode(nodeGroupTypes[i]);
        group.add(node);
        pos.set(0, labelOffset, 0);
        label = spriteManager.create(nodeGroupTypes[i], pos, labelScale, 32, 1, true, false);
        group.add(label);
        BaseApp.prototype.createScene.call(this);
    }

    this.nodeGroupTypes = nodeGroupTypes;

    //Sort nodes into categories
    //Internal nodes in different scenes
    var internalNodeGroups = [];
    for(i=0; i<numGroups; ++i) {
        group = new THREE.Object3D();
        group.name = nodeGroupTypes[i]+"Internal";
        internalNodeGroups.push(group);
        this.scenes[i+1].add(group);
    }

    for(i=0; i<tateData.length; ++i) {
        type = tateData[i]["Type of node"];
        for(j=0; j<numGroups; ++j) {
            if(type === nodeGroupTypes[j]) break;
        }
        node = this.createNode(type);
        if(node) {
            internalNodeGroups[j].add(node);
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

    var delta = this.clock.getDelta();

    if(this.selectedObject && !this.camRotating) {
        this.parent = this.selectedObject.parent;
        var world = this.parent.position.setFromMatrixPosition(this.selectedObject.matrixWorld);
        this.tempPos.copy(world);
        this.currentLookAt.copy(this.controls.getLookAt());
        this.rotateCameraTo(world);
        this.camRotating = true;
        this.selectedObject = null;
    }

    if(this.camRotating) {
        this.elapsedTime += delta;
        if(this.elapsedTime >= this.camRotateTime) {
            this.camRotating = false;
            this.elapsedTime = 0;
            this.controls.setLookAt(this.tempPos);
            this.currentLookAt.copy(this.tempPos);
            this.zoomTo(this.tempPos);
            this.camAnimating = true;
        } else {
            this.incPos.multiplyScalar(delta/this.camRotateTime);
            this.currentLookAt.add(this.incPos);
            this.controls.setLookAt(this.currentLookAt);
            this.incPos.copy(this.cameraPath);
        }
    }

    if(this.camAnimating) {
        this.elapsedTime += delta;
        if(this.elapsedTime >= this.camAnimateTime) {
            this.camAnimating = false;
            this.elapsedTime = 0;
            this.camera.position.copy(this.tempPos);
            this.resetCamera();
            this.currentScene = this.getScene(this.parent.name);
            if(this.currentScene === undefined) {
                console.log("No scene detected!");
            }
        } else {
            this.incPos.multiplyScalar(delta/this.camAnimateTime);
            this.camera.position.add(this.incPos);
            this.incPos.copy(this.cameraPath);
        }
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
    this.incPos.copy(this.cameraPath);
};

Tate.prototype.rotateCameraTo = function(pos) {
    //Alter lookat over set period
    this.cameraPath.copy(pos);
    this.cameraPath.sub(this.currentLookAt);
    this.incPos.copy(this.cameraPath);
};

Tate.prototype.getScene = function(name) {
    //Get scene number from name
    //Scene 0 is always default scene
    for(var i=0; i<this.nodeGroupTypes.length; ++i) {
        if(this.nodeGroupTypes[i] === name) return i+1;
    }

    return undefined;
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
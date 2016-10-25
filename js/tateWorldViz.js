/**
 * Created by tonyg on 20/10/2016.
 */

var X_AXIS=0, Y_AXIS=1, Z_AXIS=2;
var UP=0, LEFT=1, RIGHT=2, DOWN=3, HOME=4;
var MOVE_INC = 5;
var STOP=0;

//Init this app from base
function Tate() {
    BaseApp.call(this);
}

Tate.prototype = new BaseApp();

Tate.prototype.init = function(container) {
    BaseApp.prototype.init.call(this, container);

    //Key repeats
    this.keyRepeatTimer = undefined;
    this.checkTime = 50;
    this.x_movement = 0;
    this.y_movement = 0;
    this.z_movement = 0;

    //GUI
    this.guiControls = null;
    this.gui = null;
};

Tate.prototype.createScene = function() {
    //Create scene
    var _this = this;
    BaseApp.prototype.createScene.call(this);

    //Camera
    this.defaultCamPosY = 400;
    this.defaultCamPosZ = 400;
    this.currentLookAt = new THREE.Vector3();
    this.camera.position.set(0, this.defaultCamPosY, this.defaultCamPosZ);

    //Model loading
    this.xMax = 1000;
    this.xMin = -1000;
    this.yMax = 500;
    this.yMin = -500;

    this.loader = new THREE.JSONLoader();

    this.loader.load('./models/worldBase.json', function (geometry, materials) {
        var mesh = new THREE.Mesh(geometry, new THREE.MultiMaterial(materials));
        mesh.scale.set(50, 1, 50);
        var bbox = new THREE.Box3().setFromObject(mesh);

        _this.scenes[_this.currentScene].add(mesh);
    });

    //Groups
    var nodeGroupTypes = [
        "Artists",
        "Researchers/Thinkers",
        "Curators",
        "Instigators",
        "Performances",
        "Interventions",
        "Exhibitions",
        "Initiatives",
        "Other artwork",
        "Institutions - Art",
        "Institutions - Other",
        "Public"
    ];
    var numGroups = nodeGroupTypes.length;
    var group;
    var mainNodeGroups = [];
    for(i=0; i<numGroups; ++i) {
        group = new THREE.Object3D();
        group.name = nodeGroupTypes[i];
        mainNodeGroups.push(group);
        this.scenes[this.currentScene].add(group);
    }

    //Get data
    var labelScale = new THREE.Vector3(80, 60, 1);
    var i, j, nodeRadius = 5, nodeSegments = 24;
    var sphereGeom = new THREE.SphereBufferGeometry(nodeRadius, nodeSegments, nodeSegments);
    var sphereMat = new THREE.MeshLambertMaterial( {color: 0xffff00} );
    var mainGroup = new THREE.Object3D();
    this.lineGroup = new THREE.Object3D();
    var pos = new THREE.Vector3(), ground, mesh;
    this.pinNodes = [];
    var label, limit = 20, type, colour;
    var numNodes = tateData.length;
    //var numNodes = 20;
    for(i=0; i<numNodes; ++i) {
        pos = this.getNodePosition(tateData[i]["Location coordinates"], tateData[i]["Start"]);
        if(pos !== undefined) {
            type = tateData[i]["Type of node"];
            if(type === "" || type === undefined) {
                console.log("Invalid type");
                continue;
            }
            colour = this.getNodeColour(type);
            label = spriteManager.create(tateData[i]["Node name"], limit, colour, pos, labelScale, 32, 1, true, false);
            //mesh = new THREE.Mesh(sphereGeom, sphereMat);
            //mesh.position.copy(pos);
            this.pinNodes.push(label);
            ground = new THREE.Vector3(pos.x, 0, pos.z);
            this.drawLink(pos, ground, this.lineGroup, colour);
            mainGroup.add(label);
        } else {
            console.log("No location for ", i);
        }
    }
    this.scenes[this.currentScene].add(mainGroup);
    this.scenes[this.currentScene].add(this.lineGroup);
};

Tate.prototype.getNodePosition = function(location, date) {
    //Determine position from lat long
    if(!location) return undefined;

    var lat = parseFloat(location);
    if(isNaN(lat)) {
        console.log("Invalid latitude!");
        return undefined;
    }
    var longIndex = location.indexOf(",");
    if(longIndex < 0) {
        console.log("Invalid longitude");
        return undefined;
    }
    var long = location.substr(longIndex+1, location.length-longIndex);
    long = parseFloat(long);
    if(isNaN(long)) {
        console.log("Invalid longitude");
        return undefined;
    }

    lat = (lat/90)*this.yMax;
    long = (long/180)*this.xMax;
    date = date.slice(-4);
    date = parseFloat(date);
    if(isNaN(date)) {
        console.log("Invalid date!");
        return undefined;
    }
    date -= 1960;
    return new THREE.Vector3(long, date, -lat);
};

Tate.prototype.drawLink = function(from, to, group, lineColour) {
    var lineGeom = new THREE.Geometry();
    lineGeom.vertices.push(from, to);
    var link = new THREE.Line(lineGeom, lineColour);
    group.add(link);
};

Tate.prototype.getNodeColour = function(type) {
    //Get colour for specific node
    var colour = undefined;
    switch(type) {
        case "Artists":
            colour = LINES.LineColours["red"];
            break;

        case "Researchers/Thinkers":
            colour = LINES.LineColours["redOrange"];
            break;

        case "Curators":
            colour = LINES.LineColours["orange"];
            break;

        case "Instigators":
            colour = LINES.LineColours["yellowOrange"];
            break;

        case "Performances":
            colour = LINES.LineColours["yellow"];
            break;

        case "Interventions":
            colour = LINES.LineColours["yellowGreen"];
            break;

        case "Exhibitions":
            colour = LINES.LineColours["green"];
            break;

        case "Initiatives":
            colour = LINES.LineColours["blueGreen"];
            break;

        case "Other artwork":
            colour = LINES.LineColours["blue"];
            break;

        case "Institutions - Art":
            colour = LINES.LineColours["blueViolet"];
            break;

        case "Institutions - Other":
            colour = LINES.LineColours["violet"];
            break;

        case "Public":
            colour = LINES.LineColours["redViolet"];
            break;

        default:
            //DEBUG
            console.log("No colour for type ", type);
            break;
    }

    return colour;
};

Tate.prototype.createGUI = function() {
    //GUI - using dat.GUI
    var _this = this;
    this.guiControls = new function () {
        this.Background = '#5c5f64';
        this.LabelWidth = 1.0;
        this.LabelHeight = 1.0;
        this.LightX = 0;
        this.LightY = 50;
        this.LightZ = -600;
        this.ScaleFactor = 1;
    };

    var gui = new dat.GUI();

    //Add some folders
    this.guiAppear = gui.addFolder("Appearance");
    this.guiAppear.addColor(this.guiControls, 'Background').onChange(function (value) {
        _this.renderer.setClearColor(value, 1.0);
    });

    this.guiLight = gui.addFolder("Lights");
    //Light pos
    var lightX = this.guiLight.add(this.guiControls, 'LightX', -1000, 1000).step(10);
    lightX.onChange(function(value) {
        _this.onLightChange(X_AXIS, value);
    });

    var lightY = this.guiLight.add(this.guiControls, 'LightY', 0, 400).step(10);
    lightY.onChange(function(value) {
        _this.onLightChange(Y_AXIS, value);
    });

    var lightZ = this.guiLight.add(this.guiControls, 'LightZ', -1000, 200).step(10);
    lightZ.onChange(function(value) {
        _this.onLightChange(Z_AXIS, value);
    });

    var scale = gui.add(this.guiControls, 'ScaleFactor', 1, 30).step(1);
    scale.onChange(function(value) {
        _this.onScaleChange(value);
    });
    this.gui = gui;
};

Tate.prototype.update = function() {
    //Perform any updates

    var delta = this.clock.getDelta();

    BaseApp.prototype.update.call(this);
};

Tate.prototype.onLightChange = function(axis, pos) {
    //Alter light pos
    var light = this.scenes[this.currentScene].getObjectByName("PointLight");
    if(!light) {
        console.log("Couldn't get light!");
        return;
    }
    switch (axis) {
        case X_AXIS:
            light.position.x = pos;
            break;

        case Y_AXIS:
            light.position.y = pos;
            break;

        case Z_AXIS:
            light.position.z = pos;
            break;

        default:
            break;
    }
};

Tate.prototype.onScaleChange = function(value) {
    //Change pin height
    var currentScale = this.lineGroup.scale.y;
    this.lineGroup.scale.y = value;
    for(var i=0; i<this.pinNodes.length; ++i) {
        this.pinNodes[i].position.y = (this.pinNodes[i].position.y/currentScale) * value;
    }
};

Tate.prototype.moveCamera = function(direction) {
    //Move camera according to user input
    direction = direction.substr(4);
    var repeating = false;
    var _this = this;
    switch(direction) {
        case "Up":
            this.x_movement = 0;
            this.y_movement = 0;
            this.z_movement = -MOVE_INC;
            repeating = true;
            break;

        case "Down":
            this.x_movement = 0;
            this.y_movement = 0;
            this.z_movement = MOVE_INC;
            repeating = true;
            break;

        case "Right":
            this.x_movement = MOVE_INC;
            this.y_movement = 0;
            this.z_movement = 0;
            repeating = true;
            break;

        case "Left":
            this.x_movement = -MOVE_INC;
            this.y_movement = 0;
            this.z_movement = 0;
            repeating = true;
            break;

        case "ZoomIn":
            this.x_movement = 0;
            this.y_movement = -MOVE_INC;
            this.z_movement = -MOVE_INC;
            repeating = true;
            break;

        case "ZoomOut":
            this.x_movement = 0;
            this.y_movement = MOVE_INC;
            this.z_movement = MOVE_INC;
            repeating = true;
            break;

        case "Home":
            repeating = false;
            clearInterval(this.keyRepeatTimer);
            this.camera.position.set(0, this.defaultCamPosY, this.defaultCamPosZ);
            this.currentLookAt.set(0,0,0);
            this.controls.setLookAt(this.currentLookAt);
            break;

        case "Stop":
            clearInterval(this.keyRepeatTimer);
            break;

        default:
            break;
    }
    if(repeating) {
        this.keyRepeatTimer = setInterval(function() {
            _this.camera.position.x += _this.x_movement;
            _this.camera.position.y += _this.y_movement;
            _this.camera.position.z += _this.z_movement;
            _this.currentLookAt.x += _this.x_movement;
            _this.currentLookAt.y += _this.y_movement;
            _this.currentLookAt.z += _this.z_movement;
            _this.controls.setLookAt(_this.currentLookAt);
        }, this.checkTime);
    }
};

$(document).ready(function() {
    //Initialise app
    var container = document.getElementById("WebGL-output");
    var app = new Tate();
    app.init(container);
    app.createScene();
    app.createGUI();

    //GUI callbacks
    $("[id^=move]").on("mousedown", function() {
        app.moveCamera(this.id);
    });

    $("[id^=move]").on("mouseup", function() {
        app.moveCamera("moveStop");
    });

    app.run();
});

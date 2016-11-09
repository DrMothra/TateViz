/**
 * Created by tonyg on 20/10/2016.
 */

var X_AXIS=0, Y_AXIS=1, Z_AXIS=2;
var UP=0, LEFT=1, RIGHT=2, DOWN=3, HOME=4;
var MOVE_INC = 5;
var STOP=0;
var WIDTH = 0, HEIGHT = 1;
var MAP_DETAILED = 0, MAP_ZONES = 1, MAP_OUTLINE = 2;

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

    //Temp vectors
    this.temp = new THREE.Vector3();
};

Tate.prototype.createScene = function() {
    //Create scene
    var _this = this;
    BaseApp.prototype.createScene.call(this);

    this.rootGroup = new THREE.Object3D();
    this.scenes[this.currentScene].add(this.rootGroup);

    //Camera
    this.defaultCamPosY = 700;
    this.defaultCamPosZ = 700;
    this.currentLookAt = new THREE.Vector3();
    this.camera.position.set(0, this.defaultCamPosY, this.defaultCamPosZ);
    this.zoomInc = 1/100;

    //Offsets
    var viewOffset = 200;
    this.camOffsets = {};
    this.camOffsets.Home = new THREE.Vector3(0, viewOffset, 0);
    this.camOffsets.Top = new THREE.Vector3(0, 0, -687);
    this.camOffsets.Right = new THREE.Vector3(1050, 0, -128);
    this.camOffsets.Bottom = new THREE.Vector3(0, 0, 560);
    this.camOffsets.Left = new THREE.Vector3(-1280, 0, -150);

    //Model loading
    this.xMax = 1000;
    this.xMin = -1000;
    this.yMax = 500;
    this.yMin = -500;

    //Map textures
    var textureLoader = new THREE.TextureLoader();
    this.currentMap = 0;
    this.mapTextures = [];
    this.mapTextures.push(textureLoader.load( "models/dotted-world-map-light-grey.png" ));
    this.mapTextures.push(textureLoader.load( "models/dotted-world-map-blue.png" ));
    this.mapTextures.push(textureLoader.load( "models/dotted-world-map-purple.png" ));
    var mapInfo = [];
    //MapX, MapZ, ScaleX, ScaleZ
    var mapProperties = [-50, 85, 0.9, 0.8,
                        -70, 85, 0.9, 0.8,
                        -70, 85, 0.9, 0.8];
    var mapAdjust, index=0;
    for(var map=0; map<this.mapTextures.length; ++map) {
        mapAdjust = {};
        mapAdjust.MapX = mapProperties[index++];
        mapAdjust.MapZ = mapProperties[index++];
        mapAdjust.MapScaleX = mapProperties[index++];
        mapAdjust.MapScaleZ = mapProperties[index++];
        mapInfo.push(mapAdjust);
    }

    this.mapInfo = mapInfo;

    //Adjust initial map scale
    var currentMap = this.mapInfo[0];
    this.rootGroup.position.x = currentMap.MapX;
    this.rootGroup.position.z = currentMap.MapZ;
    this.rootGroup.scale.x = currentMap.MapScaleX;
    this.rootGroup.scale.z = currentMap.MapScaleZ;

    this.loader = new THREE.JSONLoader();

    this.loader.load('./models/worldBase.json', function (geometry, materials) {
        materials[0].map = _this.mapTextures[0];
        var mesh = new THREE.Mesh(geometry, new THREE.MultiMaterial(materials));
        mesh.scale.set(50, 1, 50);
        var bbox = new THREE.Box3().setFromObject(mesh);

        _this.scenes[_this.currentScene].add(mesh);
        _this.worldMesh = mesh;
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
    var lineNodeGroups = [];
    for(i=0; i<numGroups; ++i) {
        group = new THREE.Object3D();
        group.name = nodeGroupTypes[i];
        mainNodeGroups.push(group);
        this.rootGroup.add(group);
        group = new THREE.Object3D();
        group.name = nodeGroupTypes[i]+"Line";
        lineNodeGroups.push(group);
        this.rootGroup.add(group);
    }
    this.nodeGroupTypes = nodeGroupTypes;
    this.lineNodeGroups = lineNodeGroups;

    //Do any pre-sorting
    var i, j, year;
    var numNodes = tateData.length;
    this.minYear = 2106;
    this.maxYear = 2016;
    for(i=0; i<numNodes; ++i) {
        year = tateData[i].Start;
        year = year.slice(-4);
        year = parseFloat(year);
        if(isNaN(year)) {
            console.log("Invalid date!");
            continue;
        }
        if(year < this.minYear) this.minYear = year;
    }

    var nodeRadius = 5, nodeSegments = 24;
    var sphereGeom = new THREE.SphereBufferGeometry(nodeRadius, nodeSegments, nodeSegments);
    var pos = new THREE.Vector3();
    this.labelXScale = 100;
    this.labelYScale = 80;

    //Keep record of node parts
    this.pinNodes = [];
    this.labelNodes = [];
    this.lineNodes = [];
    this.mapNodes = [];
    this.mapInfoNodes = [];

    var mapNode, mapInfoNode, nodeGroup;
    var label, line, type, name, pin, base;

    for(i=0; i<numNodes; ++i) {
        pos = this.getNodePosition(tateData[i]["Location coordinates"], tateData[i].Start);
        if(pos !== undefined) {
            type = tateData[i]["Type of node"];
            if(type === "" || type === undefined) {
                console.log("Invalid type");
                continue;
            }
            for(j=0; j<numGroups; ++j) {
                if(type === nodeGroupTypes[j]) break;
            }
            mapNode = new MapNode();
            name = tateData[i]["Node short name"];
            if(!mapNode.init(type, name, pos)) {
                console.log("Couldn't create node!");
                continue;
            }
            //Graphical attributes
            mapNode.createGeometry(sphereGeom);
            mapNode.setIndex(i);
            this.mapNodes.push(mapNode);

            pin = mapNode.getPin();
            this.pinNodes.push(pin);

            line = mapNode.getLink();
            this.lineNodes.push(line);

            label = mapNode.getLabel();
            this.labelNodes.push(label);

            nodeGroup = mapNode.getNodeGroup();
            mainNodeGroups[j].add(nodeGroup);

            //Information
            mapInfoNode = new MapNodeInfo();
            this.mapInfoNodes.push(mapInfoNode);
            mapInfoNode.setIndex(i);
            mapInfoNode.setCountry(tateData[i].Country);
        }
    }
    this.mainNodeGroups = mainNodeGroups;

    //Sort by country
    var countryGroups = [];
    var countries = {};
    var country, countryGroup;
    var len;

    for(i=0, len=this.mapInfoNodes.length; i<len; ++i) {
        country = this.mapInfoNodes[i].getCountry();
        if(!countries[country]) {
            countries[country] = country;
            countryGroup = new THREE.Object3D();
            countryGroup.name = country;
            countryGroup.add(this.mapNodes[i].getNodeGroup());
            countryGroups.push(countryGroup);
            this.rootGroup.add(countryGroup);
        } else {
            countryGroup = this.scenes[this.currentScene].getObjectByName(country);
            if(countryGroup) {
                countryGroup.add(this.mapNodes[i].getNodeGroup());
            }
        }
    }

    //Calculate each country position
    /*
    var children;
    var total = new THREE.Vector3();
    for(i=0, len=countryGroups.length; i<len; ++i) {
        countryGroup = countryGroups[i];
        for(j=0, children=countryGroup.children.length; j<children; ++j) {
            total.add(countryGroup.children[j].position);
        }
        total.multiplyScalar(1/children);
        countryGroup.position.copy(total);
        total.set(0, 0, 0);
    }
    */
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

    date -= this.minYear;
    return new THREE.Vector3(long, date, -lat);
};

Tate.prototype.createGUI = function() {
    //GUI - using dat.GUI
    var _this = this;
    var guiControls = function () {
        this.Background = '#5c5f64';
        this.LabelWidth = 1.0;
        this.LabelHeight = 1.0;
        this.LightX = 0;
        this.LightY = 50;
        this.LightZ = -600;
        this.ScaleFactor = 5;
        this.LabelWidth = _this.labelXScale;
        this.LabelHeight = _this.labelYScale;
        this.YearMax = _this.maxYear;
        this.YearMin = _this.minYear;
        for(var i=0; i<_this.nodeGroupTypes.length; ++i) {
            this[_this.nodeGroupTypes[i]] = true;
        }
        this.ShowAll = true;
        this.MapGrey = true;
        this.MapBlue = false;
        this.MapPurple = false;
        this.MapX = 0;
        this.MapZ = 0;
        this.MapScaleX = 1;
        this.MapScaleZ = 1;
    };

    var controls = new guiControls();
    var gui = new dat.GUI();

    //Add some folders
    this.guiAppear = gui.addFolder("Appearance");
    this.guiAppear.addColor(controls, 'Background').onChange(function (value) {
        _this.renderer.setClearColor(value, 1.0);
    });

    this.guiLight = gui.addFolder("Lights");
    //Light pos
    var lightX = this.guiLight.add(controls, 'LightX', -1000, 1000).step(10);
    lightX.onChange(function(value) {
        _this.onLightChange(X_AXIS, value);
    });

    var lightY = this.guiLight.add(controls, 'LightY', 0, 400).step(10);
    lightY.onChange(function(value) {
        _this.onLightChange(Y_AXIS, value);
    });

    var lightZ = this.guiLight.add(controls, 'LightZ', -1000, 200).step(10);
    lightZ.onChange(function(value) {
        _this.onLightChange(Z_AXIS, value);
    });

    var scale = gui.add(controls, 'ScaleFactor', 1, 30).step(1);
    scale.onChange(function(value) {
        _this.onScaleChange(value);
    });

    var labelScale = gui.add(controls, 'LabelWidth', _this.labelXScale, _this.labelXScale+150).step(1);
    labelScale.onChange(function(value) {
        _this.onLabelScale(value, WIDTH);
    });

    labelScale = gui.add(controls, 'LabelHeight', _this.labelYScale, _this.labelYScale+150).step(1);
    labelScale.onChange(function(value) {
        _this.onLabelScale(value, HEIGHT);
    });

    var year = gui.add(controls, 'YearMax', this.minYear, this.maxYear).step(1);
    year.onChange(function() {
        _this.onYearChange();
    });

    year = gui.add(controls, 'YearMin', this.minYear, this.maxYear);
    year.onChange(function() {
        _this.onYearChange();
    });

    var group;
    this.guiGroups = gui.addFolder("Groups");
    for(var i=0; i<this.nodeGroupTypes.length; ++i) {
        (function(item) {
            group = _this.guiGroups.add(controls, _this.nodeGroupTypes[item]).onChange(function(value) {
                _this.showGroups(_this.nodeGroupTypes[item], value);
            });
            group.listen();
        })(i);
    }
    this.guiGroups.add(controls, "ShowAll").onChange(function(value) {
        _this.showGroups("ShowAll", value);
    });

    //Maps
    var range = 300;
    this.guiMaps = gui.addFolder("Maps");
    var mapTex = this.guiMaps.add(controls, "MapGrey").listen();
    mapTex.onChange(function(value) {
        _this.onTextureChanged(value, MAP_DETAILED);
        _this.guiControls.MapGrey = true;
    });

    mapTex = this.guiMaps.add(controls, "MapBlue").listen();
    mapTex.onChange(function(value) {
        _this.onTextureChanged(value, MAP_ZONES);
        _this.guiControls.MapBlue = true;
    });

    mapTex = this.guiMaps.add(controls, "MapPurple").listen();
    mapTex.onChange(function(value) {
        _this.onTextureChanged(value, MAP_OUTLINE);
        _this.guiControls.MapPurple = true;
    });

    var pos = this.guiMaps.add(controls, "MapX", -range, range).step(5);
    pos.onChange(function(value) {
        _this.onMapPosChange(value, X_AXIS);
    });

    pos = this.guiMaps.add(controls, "MapZ", -range, range).step(5);
    pos.onChange(function(value) {
        _this.onMapPosChange(value, Z_AXIS);
    });

    range = 5;
    scale = this.guiMaps.add(controls, "MapScaleX", 0.1, range).step(0.1);
    scale.onChange(function(value) {
        _this.onMapScaleChange(value, X_AXIS);
    });

    scale = this.guiMaps.add(controls, "MapScaleZ", 0.1, range).step(0.1);
    scale.onChange(function(value) {
        _this.onMapScaleChange(value, Z_AXIS);
    });

    this.gui = gui;
    this.guiControls = controls;
    this.onScaleChange(controls.ScaleFactor);
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
    var i;
    var currentScale = this.lineNodeGroups[0].scale.y;
    for(i=0; i<this.lineNodeGroups.length; ++i) {
        this.lineNodeGroups[i].scale.y = value;
    }

    for(i=0; i<this.pinNodes.length; ++i) {
        this.pinNodes[i].position.y = (this.pinNodes[i].position.y/currentScale) * value;
        this.labelNodes[i].position.y = this.pinNodes[i].position.y;
    }
};

Tate.prototype.onYearChange = function(value) {
    //Display nodes between year ranges
    var i, node, nodeYear, max, min;
    var currentScale = this.lineNodeGroups[0].scale.y;
    for(i=0; i<this.pinNodes.length; ++i) {
        node = this.pinNodes[i];
        if(!node.parent.visible) continue;
        nodeYear = (node.position.y/currentScale);
        max = this.guiControls.YearMax - this.minYear;
        min = this.guiControls.YearMin - this.minYear;
        node.visible = (nodeYear <= max && nodeYear >= min);
        this.lineNodes[i].visible = node.visible;
        this.labelNodes[i].visible = node.visible;
    }
};

Tate.prototype.onLabelScale = function(value, axis) {
    var i, nodeLength = this.labelNodes.length;
    switch(axis) {
        case WIDTH:
            for(i=0; i<nodeLength; ++i) {
                this.labelNodes[i].scale.x = value;
            }
            break;

        case HEIGHT:
            for(i=0; i<nodeLength; ++i) {
                this.labelNodes[i].scale.y = value;
            }
            break;

        default:
            break;
    }
};

Tate.prototype.onMapPosChange = function(value, axis) {
    switch(axis) {
        case X_AXIS:
            this.rootGroup.position.x = value;
            break;

        case Z_AXIS:
            this.rootGroup.position.z = value;
            break;

        default:
            break;
    }
};

Tate.prototype.onMapScaleChange = function(value, axis) {
    switch(axis) {
        case X_AXIS:
            this.rootGroup.scale.x = value;
            break;

        case Z_AXIS:
            this.rootGroup.scale.z = value;
            break;

        default:
            break;
    }
};

Tate.prototype.onTextureChanged = function(value, textureID) {
    this.guiControls.MapGrey = false;
    this.guiControls.MapBlue = false;
    this.guiControls.MapPurple = false;

    this.worldMesh.material.materials[0].map = this.mapTextures[textureID];
    this.worldMesh.material.materials[0].map.needsUpdate = true;

    //Adjust map scale
    var mapInfo = this.mapInfo[textureID];
    this.rootGroup.position.x = mapInfo.MapX;
    this.rootGroup.position.z = mapInfo.MapZ;
    this.rootGroup.scale.x = mapInfo.MapScaleX;
    this.rootGroup.scale.z = mapInfo.MapScaleZ;
};

Tate.prototype.showGroups = function(groupName, value) {
    //Show/hide groups
    var child, i, j, group;
    if(groupName === "ShowAll") {
        for(i=0; i<this.mainNodeGroups.length; ++i) {
            group = this.mainNodeGroups[i];
            group.visible = value;
            for(j=0; j<group.children.length; ++j) {
                child = group.children[j];
                if(child instanceof THREE.Sprite) {
                    child.visible = value;
                }
            }
        }
        for(i=0; i<this.lineNodeGroups.length; ++i) {
            group = this.lineNodeGroups[i];
            group.visible = value;
            for(j=0; j<group.children.length; ++j) {
                child = group.children[j];
                if(child instanceof THREE.Line) {
                    child.visible = value;
                }
            }
        }

        //Update interface
        for(i=0; i<this.nodeGroupTypes.length; ++i) {
            this.guiControls[this.nodeGroupTypes[i]] = value;
        }

        return;
    }

    var nodeGroup = this.scenes[this.currentScene].getObjectByName(groupName);
    if(!nodeGroup) {
        console.log("Invalid group");
        return;
    }

    var lineGroup = this.scenes[this.currentScene].getObjectByName(groupName+"Line");
    if(!lineGroup) {
        console.log("Invalid group");
        return;
    }

    nodeGroup.visible = value;
    for(i=0; i<nodeGroup.children.length; ++i) {
        child = nodeGroup.children[i];
        if(child instanceof THREE.Sprite) {
            child.visible = value;
        }
    }
    lineGroup.visible = value;
    for(i=0; i<lineGroup.children.length; ++i) {
        child = lineGroup.children[i];
        if(child instanceof THREE.Line) {
            child.visible = value;
        }
    }
    this.onYearChange();
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
            this.temp.subVectors(this.camera.position, this.currentLookAt);
            this.temp.multiplyScalar(-this.zoomInc);
            this.x_movement = this.temp.x;
            this.y_movement = this.temp.y;
            this.z_movement = this.temp.z;
            repeating = true;
            break;

        case "ZoomOut":
            this.temp.subVectors(this.camera.position, this.currentLookAt);
            this.temp.multiplyScalar(this.zoomInc);
            this.x_movement = this.temp.x;
            this.y_movement = this.temp.y;
            this.z_movement = this.temp.z;
            repeating = true;
            break;

        case "Home":
            repeating = false;
            clearInterval(this.keyRepeatTimer);
            this.controls.reset();
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

Tate.prototype.camOffset = function(direction) {
    direction = direction.substr(3);
    switch(direction) {
        case "Home":
            this.temp.copy(this.currentLookAt);
            this.temp.add(this.camOffsets[direction]);
            this.camera.position.copy(this.temp);
            break;

        case "Top":
        case "Right":
        case "Left":
        case "Bottom":
            this.camera.position.copy(this.camOffsets[direction]);
            break;

        default:
            break;
    }
};

$(document).ready(function() {
    //See if we have WebGL support
    if(!Detector.webgl) {
        $('#notSupported').show();
    }

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

    $("[id^=cam]").on("click", function() {
        app.camOffset(this.id);
    });

    app.run();
});

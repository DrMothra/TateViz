/**
 * Created by tonyg on 20/10/2016.
 */

var X_AXIS=0, Y_AXIS=1, Z_AXIS=2;
var UP=0, LEFT=1, RIGHT=2, DOWN=3, HOME=4;
var MOVE_INC = 5;
var STOP=0;
var WIDTH = 0, HEIGHT = 1;
var MAP_DETAILED = 0, MAP_ZONES = 1, MAP_OUTLINE = 2;
var TYPE = 0;

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

    this.currentCountry = "All";
};

Tate.prototype.createScene = function() {
    //Create scene
    var _this = this;
    BaseApp.prototype.createScene.call(this);

    //General helpers
    this.textureLoader = new THREE.TextureLoader();
    this.loader = new THREE.JSONLoader();
    this.xMax = 1000;
    this.xMin = -1000;
    this.yMax = 500;
    this.yMin = -500;

    //Scene hierarchy
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

    //Map textures
    this.createMaps();

    //Model loading
    this.loader.load('./models/worldBase.json', function (geometry, materials) {
        materials[0].map = _this.mapTextures[0];
        var mesh = new THREE.Mesh(geometry, new THREE.MultiMaterial(materials));
        mesh.scale.set(50, 1, 50);
        var bbox = new THREE.Box3().setFromObject(mesh);

        _this.scenes[_this.currentScene].add(mesh);
        _this.worldMesh = mesh;
        _this.worldMesh.visible = false;
    });

    //Groups
    this.groupRadius = 200;
    this.sortNodesByType();

    //Do any pre-sorting
    this.getYearRanges();

    var nodeRadius = 5, nodeSegments = 24;
    this.baseGeom = new THREE.SphereBufferGeometry(nodeRadius, nodeSegments, nodeSegments);
    var pos = new THREE.Vector3();
    this.labelXScale = 100;
    this.labelYScale = 80;

    //Keep record of node parts
    var numNodes = tateData.length;

    this.mapNodes = [];
    this.mapInfoNodes = [];

    var mapNode, mapInfoNode, nodeGroup, i, j;
    var label, type, name, typeIndex;
    var artist, artistNames = {};

    for(i=0; i<numNodes; ++i) {
        pos = this.getNodePosition(tateData[i]["Location coordinates"], tateData[i].Start);
        if(pos !== undefined) {
            type = tateData[i]["Type of node"];
            if(type === "" || type === undefined) {
                console.log("Invalid type");
                continue;
            }
            typeIndex = this.getTypeIndex(type);
            mapNode = new MapNode();
            name = tateData[i]["Node short name"];
            if(!mapNode.init(type, name, pos)) {
                console.log("Couldn't create node!");
                continue;
            }
            //Graphical attributes
            mapNode.createGeometry(this.baseGeom);
            mapNode.setIndex(i);
            this.mapNodes.push(mapNode);

            nodeGroup = mapNode.getNodeGroup();
            this.nodeTypeGroups[typeIndex].push(mapNode);

            //Information
            mapInfoNode = new MapNodeInfo();
            artist = tateData[i]["Made by"];
            if(artist !== "") {
                mapInfoNode.addCreator(artist);
                if(!artistNames[artist]) {
                    artistNames[artist] = [];
                    artistNames[artist].push(i);
                } else {
                    artistNames[artist].push(i);
                }
            }
            this.mapInfoNodes.push(mapInfoNode);
            mapInfoNode.setIndex(i);
            mapInfoNode.setCountry(tateData[i].Country);
        }
    }

    this.artistNames = artistNames;
    //Artists with multiple works
    this.multipleArtists = this.getMultipleArtists();

    //Add artist links
    var labelPos = new THREE.Vector3();
    var labelScale = new THREE.Vector3(200, 150, 1);
    var ids, nodeLength;
    //DEBUG
    //HARD CODE THIS FOR NOW!!!
    var CUBA = new THREE.Vector3(-457.85, 60, -128.31);
    var UK = new THREE.Vector3(-4.13, 60, -289);
    var USA = new THREE.Vector3(-539.63, 60, -217.4);
    var POLAND = new THREE.Vector3(116.92, 60, -290.56);
    var countryPos = [
        [CUBA, UK],
        [USA, UK],
        [USA],
        [POLAND, UK],
        [UK]
    ];
    var links, link, numArtists;
    var linkGroup = new THREE.Object3D();
    linkGroup.visible = false;
    this.rootGroup.add(linkGroup);
    for(i=0, numArtists=this.multipleArtists.length; i<numArtists; ++i) {
        ids = this.multipleArtists[i].nodes;
        for(j=0, nodeLength=ids.length; j<nodeLength; ++j) {
            labelPos.add(this.getMapNodePosition(ids[j]));
        }
        labelPos.multiplyScalar(1/nodeLength);
        labelPos.y = 75;
        label = spriteManager.create(this.multipleArtists[i].name, 0, LINES.LineColours.white, labelPos, labelScale, 32, 1, true, false);
        linkGroup.add(label);
        //Links
        links = countryPos[i];
        for(j=0, nodeLength=links.length; j<nodeLength; ++j) {
            link = this.drawLink(labelPos, links[j], LINES.LineColours.white);
            linkGroup.add(link);
        }
        labelPos.set(0, 0, 0);
    }
    this.linkGroup = linkGroup;

    //Sort by country
    this.sortNodesByCountry();

    //Calculate each country position
    this.sortCountryPosition();
};

Tate.prototype.createMaps = function() {
    this.currentMap = 0;
    this.mapTextures = [];
    this.mapTextures.push(this.textureLoader.load( "models/dotted-world-map-light-grey.png" ));
    this.mapTextures.push(this.textureLoader.load( "models/dotted-world-map-blue.png" ));
    this.mapTextures.push(this.textureLoader.load( "models/dotted-world-map-purple.png" ));
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
};

Tate.prototype.sortNodesByType = function() {
    var nodeTypes = [
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

    var numTypes = nodeTypes.length;
    var typeNodes, i;
    var nodeTypeGroups = [];
    for(i=0; i<numTypes; ++i) {
        typeNodes = [];
        nodeTypeGroups.push(typeNodes);
    }
    this.nodeTypeGroups = nodeTypeGroups;
    this.nodeTypes = nodeTypes;
};

Tate.prototype.sortNodesByCountry = function() {
    var countryGroups = [];
    var countryTitleGroups = [];
    var countries = [];
    var country, countryInfo, countryTitleGroup, countryNode, countryGroup;
    var i, j, numNodes, mapInfoNode;
    var found = false;

    for(i=0, numNodes=this.mapInfoNodes.length; i<numNodes; ++i) {
        mapInfoNode = this.mapInfoNodes[i];
        country = mapInfoNode.getCountry();
        found = false;
        for(j=0; j<countries.length; ++j) {
            if(countries[j].name === country) {
                countries[j].nodeIds.push(mapInfoNode.index);
                found = true;
                //Add mapnode to country group
                countryGroup = this.scenes[this.currentScene].getObjectByName(country+'Group');
                if(!countryGroup) continue;
                countryGroup.add(this.mapNodes[i].getNodeGroup());
                countryGroup.mapNodeIDs.push(i);
                break;
            }
        }
        if(!found) {
            countryInfo = {};
            countryInfo.name = country;
            countryInfo.nodeIds = [];
            countryInfo.nodeIds.push(mapInfoNode.index);
            countries.push(countryInfo);
            countryTitleGroup = new THREE.Object3D();
            countryTitleGroup.name = country+'Title';
            countryTitleGroups.push(countryTitleGroup);
            //Add representation for country nodes
            countryNode = this.createCountryNode(country);
            if(countryNode === undefined) continue;
            countryTitleGroup.add(countryNode);
            countryTitleGroup.visible = false;
            this.rootGroup.add(countryTitleGroup);
            //Store map nodes into country group as well
            countryGroup = new THREE.Object3D();
            countryGroup.name = country+'Group';
            countryGroups.push(countryGroup);
            countryGroup.add(this.mapNodes[i].getNodeGroup());
            countryGroup.visible = true;
            countryGroup.mapNodeIDs = [];
            countryGroup.mapNodeIDs.push(i);
            this.rootGroup.add(countryGroup);
        }
    }

    this.countryGroups = countryGroups;
    this.countryTitleGroups = countryTitleGroups;
    this.countries = countries;
};

Tate.prototype.sortCountryPosition = function() {
    var children, i, j, numCountries;
    var total = new THREE.Vector3();
    var countryIDs = [];
    for(i=0, numCountries=this.countries.length; i<numCountries; ++i) {
        countryIDs = this.countries[i].nodeIds;
        for(j=0, children=countryIDs.length; j<children; ++j) {
            total.add(this.getMapNodePosition(countryIDs[j]));
        }
        total.multiplyScalar(1/children);
        this.countryTitleGroups[i].position.set(total.x, 0, total.z);
        this.countryGroups[i].position.set(total.x, 0, total.z);
        this.countryGroups[i].radius = this.groupRadius;
        //DEBUG
        this.resizeGroup(this.countryGroups[i]);
        //this.resizeMapNodes(this.countryGroups[i]);
        total.set(0, 0, 0);
    }

    //Reset all children position
    var numGroups;
    for(i=0, numGroups=this.countryGroups.length; i<numGroups; ++i) {
        for(j=0, children=this.countryGroups[i].children.length; j<children; ++j) {
            this.countryGroups[i].children[j].position.set(0, 0, 0);
        }
    }

};

Tate.prototype.getTypeIndex = function(type) {
    var i, numTypes;
    for(i=0, numTypes=this.nodeTypes.length; i<numTypes; ++i) {
        if(this.nodeTypes[i] === type) return i;
    }

    return null;
};

Tate.prototype.getYearRanges = function() {
    var i, year;
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
};

Tate.prototype.getMultipleArtists = function() {
    var multipleArtists = [];
    var artistInfo;
    for(var key in this.artistNames) {
        if(this.artistNames[key].length > 1) {
            artistInfo = {};
            artistInfo.name = key;
            artistInfo.nodes = this.artistNames[key];
            multipleArtists.push(artistInfo);
        }
    }

    return multipleArtists.length ? multipleArtists : null;
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

Tate.prototype.getMapNodePosition = function(index) {
    var i, len;
    for(i=0, len=this.mapNodes.length; i<len; ++i) {
        if(this.mapNodes[i].index === index) {
            return this.mapNodes[i].getNodeGroupPosition();
        }
    }

    return null;
};

Tate.prototype.resizeGroup = function(group) {
    var length = group.children.length;
    if(length <= 1) {
        group.radius = 0;
    }
    var child, groupAngle, i, to = new THREE.Vector3();
    for(i=0; i<length; ++i) {
        groupAngle = (Math.PI*2) / length;
        child = group.mapNodeIDs[i];
        //child.position.set(group.radius * Math.sin(groupAngle*i), 0, group.radius * Math.cos(groupAngle*i));
        to.set(group.radius * Math.sin(groupAngle*i), 0, group.radius * Math.cos(groupAngle*i));
        this.mapNodes[child].updatePosition(to);
    }
};

Tate.prototype.resizeMapNodes = function(group) {
    var numChildren = group.children.length;
    if(numChildren <= 1) {
        group.radius = 0;
    }

    var groupAngle = (Math.PI*2) / numChildren;
    var i, numNodes, from=new THREE.Vector3(0, 60, 0), to=new THREE.Vector3();
    for(i=0, numNodes=group.mapNodeIDs.length; i<numNodes; ++i) {
        to.set(group.radius * Math.sin(groupAngle*i), 0, group.radius * Math.cos(groupAngle*i));
        this.mapNodes[i].updateLink(from, to);
    }
};

Tate.prototype.createCountryNode = function(country) {
    //Create country representation
    var pos = new THREE.Vector3(0, 60, 0);
    var countryNode = new MapNode();
    if(!countryNode.init("Country", country, pos)) {
        console.log("Couldn't create country node!");
        return undefined;
    }
    //Graphical attributes
    countryNode.setAlign(20);
    countryNode.setTextColour(LINES.LineColours.white);
    countryNode.createGeometry(this.baseGeom);
    countryNode.setIndex(-1);

    return countryNode.getNodeGroup();
};

Tate.prototype.drawLink = function(from, to, lineColour) {
    var lineGeom = new THREE.Geometry();
    var fromVec = new THREE.Vector3(from.x, from.y+20, from.z);
    lineGeom.vertices.push(fromVec, to);
    return new THREE.Line(lineGeom, lineColour);
};

Tate.prototype.createGUI = function() {
    //GUI - using dat.GUI
    var _this = this;
    var guiControls = function () {
        this.Background = '#5c5f64';
        this.LightX = 0;
        this.LightY = 50;
        this.LightZ = -600;
        this.ScaleFactor = 1;
        this.LabelWidth = _this.labelXScale;
        this.LabelHeight = _this.labelYScale;
        this.YearMax = _this.maxYear;
        this.YearMin = _this.minYear;
        for(var i=0; i<_this.nodeTypes.length; ++i) {
            this[_this.nodeTypes[i]] = true;
        }
        this.ShowAll = true;
        this.MapVisible = false;
        this.MapGrey = true;
        this.MapBlue = false;
        this.MapPurple = false;
        this.MapX = 0;
        this.MapZ = 0;
        this.MapScaleX = 1;
        this.MapScaleZ = 1;
        this.Country = "All";
        this.CountryGroup = false;
        this.Nodes = _this.mapNodes.length;
        this.GroupScale = _this.groupRadius;
        this.MadeBy = false;
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
    for(var i=0; i<this.nodeTypes.length; ++i) {
        (function(item) {
            group = _this.guiGroups.add(controls, _this.nodeTypes[item]).onChange(function(value) {
                _this.showGroups(_this.nodeTypes[item], value);
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
    var mapVis = this.guiMaps.add(controls, 'MapVisible').onChange(function(value) {
        _this.onChangeMapVis(value);
    });
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

    //Country data
    var countries = gui.addFolder("Countries");
    var len, countryNames = [];
    countryNames.push("All");
    for(i=0, len=this.countries.length; i<len; ++i) {
        countryNames.push(this.countries[i].name);
    }
    countries.add(controls, "Country", countryNames).onChange(function(value) {
        _this.onChangeCountry(value);
    });
    group = countries.add(controls, "CountryGroup").onChange(function(value) {
        _this.onShowCountry(value);
    });
    group.listen();

    var numNodes = countries.add(controls, "Nodes").listen();

    var groupScale = countries.add(controls, "GroupScale", this.groupRadius, 750);
    groupScale.onChange(function(value) {
        _this.onGroupScaleChange(value);
    });
    groupScale.listen();

    //Links
    var links = gui.addFolder("Links");
    links.add(controls, "MadeBy").onChange(function(value) {
        _this.onLinksChanged(value);
    });

    this.gui = gui;
    this.guiControls = controls;
};

Tate.prototype.update = function() {
    //Perform any updates

    var delta = this.clock.getDelta();
    if(this.selectedObject !== null) {
        var name = this.selectedObject.name;
        var index = name.indexOf("Label");
        if(index >= 0 && index === name.length-5) {
            name = name.substr(0, name.length-5);
        }
        var country = this.getCountry(name);
        if(country) {
            var info = this.getCountryInfo(name);
            $('#countryName').html(name);
            $('#countryInfo').show();
        } else {
            var mapNode = this.getMapNode(name);
            if(mapNode !== undefined) {
                index = mapNode.getIndex();
                $('#start').html(tateData[index].Start);
                $('#description').html(tateData[index].Description);
                $('#nodeName').html(name);
                $('#nodeInfo').show();
            }
        }

        this.selectedObject = null;
    }

    BaseApp.prototype.update.call(this);
};

Tate.prototype.getCountry = function(name) {
    var i, numCountries;
    for(i=0, numCountries=this.countries.length; i<numCountries; ++i) {
        if(name === this.countries[i].name) return true;
    }

    return false;
};

Tate.prototype.getMapNode = function(name) {
    var i, node, numNodes;
    for(i=0, numNodes=this.mapNodes.length; i<numNodes; ++i) {
        node = this.mapNodes[i];
        if(name === node.getName()) return node;
    }

    return undefined;
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
    //Change node height
    var i, numNodes;
    for(i=0, numNodes=this.mapNodes.length; i<numNodes; ++i) {
        this.mapNodes[i].scaleHeight(value);
    }
};

Tate.prototype.onYearChange = function() {
    //Display nodes between year ranges
    var i, mapNode, nodeGroup, numNodes, nodeYear, max, min;
    var currentScale = this.mapNodes[0].getLinkScale();
    for(i=0, numNodes=this.mapNodes.length; i<numNodes; ++i) {
        mapNode = this.mapNodes[i];
        if(!mapNode.active()) continue;
        nodeGroup = this.mapNodes[i].getNodeGroup();
        if(!nodeGroup.parent.visible) continue;
        nodeYear = (mapNode.getHeight()/currentScale);
        max = this.guiControls.YearMax - this.minYear;
        min = this.guiControls.YearMin - this.minYear;
        mapNode.visible(nodeYear <= max && nodeYear >= min);
    }
};

Tate.prototype.onLabelScale = function(value, axis) {
    var i, nodeLength = this.mapNodes.length;
    switch(axis) {
        case WIDTH:
            for(i=0; i<nodeLength; ++i) {
                this.mapNodes[i].updateLabelWidth(value);
            }
            break;

        case HEIGHT:
            for(i=0; i<nodeLength; ++i) {
                this.mapNodes[i].updateLabelHeight(value);
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

Tate.prototype.onGroupScaleChange = function(value) {
    if(this.currentCountry === "") {
        console.log("No current country defined!");
        return;
    }

    if(this.currentCountry === "All") {
        var i, length, group;
        for(i=0, length=this.countryGroups.length; i<length; ++i) {
            group = this.countryGroups[i];
            if(group.visible) {
                this.resizeGroup(group);
                group.radius = value;
            }
        }

        return;
    }

    //Only scale individual nodes - not main title node
    var countryGroup = this.scenes[this.currentScene].getObjectByName(this.currentCountry+"Group");
    if(!countryGroup) {
        console.log("No country group for country ", this.currentCountry);
        return;
    }

    if(!countryGroup.visible) {
        console.log("Nodes not visible - nothing to scale!");
        return;
    }

    countryGroup.radius = value;
    this.resizeGroup(countryGroup);
};

Tate.prototype.onChangeMapVis = function(value) {
    this.worldMesh.visible = value;
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

Tate.prototype.onChangeCountry = function(country) {
    this.currentCountry = country;
    if(this.currentCountry === "All") {
        this.guiControls.Nodes = this.mapNodes.length;
        return;
    }
    //Update other controls
    var countryGroup = this.scenes[this.currentScene].getObjectByName(this.currentCountry+"Group");
    if(!countryGroup) {
        console.log("No country group for country ", this.currentCountry);
        return;
    }
    this.guiControls.CountryGroup = !countryGroup.visible;
    this.guiControls.GroupScale = countryGroup.radius;
    this.guiControls.Nodes = countryGroup.children.length;
};

Tate.prototype.onShowCountry = function(value) {
    //Toggle country node and artworks
    if(this.currentCountry === "") {
        console.log("No current country defined!");
        return;
    }

    //Check for all countries
    if(this.currentCountry === "All") {
        var i, length;
        for(i=0, length=this.countryGroups.length; i<length; ++i) {
            this.countryGroups[i].visible = !value;
            this.countryTitleGroups[i].visible = value;
        }

        return;
    }

    var titleGroup = this.scenes[this.currentScene].getObjectByName(this.currentCountry+"Title");
    if(!titleGroup) {
        console.log("No title group for country ", this.currentCountry);
        return;
    }

    var countryGroup = this.scenes[this.currentScene].getObjectByName(this.currentCountry+"Group");
    if(!countryGroup) {
        console.log("No country group for country ", this.currentCountry);
        return;
    }

    titleGroup.visible = value;
    countryGroup.visible = !value;
};

Tate.prototype.onLinksChanged = function(value) {
    this.linkGroup.visible = value;
};

Tate.prototype.showGroups = function(groupName, value) {
    //Show/hide groups
    var i, j, nodeList, numGroups, numNodes;
    if(groupName === "ShowAll") {
        numGroups = this.nodeTypeGroups.length;
        for(i=0; i<numGroups; ++i) {
            nodeList = this.nodeTypeGroups[i];
            for(j=0, numNodes=nodeList.length; j<numNodes; ++j) {
                nodeList[j].visible(value);
                nodeList[j].active(value);
            }
        }

        //Update interface
        for(i=0; i<this.nodeTypes.length; ++i) {
            this.guiControls[this.nodeTypes[i]] = value;
        }

        return;
    }

    var typeIndex = this.getTypeIndex(groupName);
    nodeList = this.nodeTypeGroups[typeIndex];
    for(j=0, numNodes=nodeList.length; j<numNodes; ++j) {
        nodeList[j].visible(value);
        nodeList[j].active(value);
    }

    //this.onYearChange();
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

Tate.prototype.dismissNodeInfo = function() {
    $('#nodeInfo').hide();
};

Tate.prototype.dismissCountryInfo = function() {
    $('#countryInfo').hide();
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

    $("#closeNode").on("click", function() {
        app.dismissNodeInfo();
    });

    $("#closeCountry").on("click", function() {
        app.dismissCountryInfo();
    });

    app.run();
});

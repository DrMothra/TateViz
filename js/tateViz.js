/**
 * Created by DrTone on 04/12/2014.
 */
//Visualisation framework

var NUM_ROWS = 3;
var NUM_COLS = 3;
var WIDTH = 0;
var HEIGHT = 1;
var RED=0, BLUE=1, GREEN=2;

var NONE=0, ZOOM=1, INFO=2;

//Init this app from base
function Tate() {
    BaseApp.call(this);
}

Tate.prototype = new BaseApp();

Tate.prototype.init = function(container) {
    BaseApp.prototype.init.call(this, container);

    //Interactions
    this.interactionState = ZOOM;

    //Camera animation
    this.zoomAllowed = true;
    this.camAnimating = false;
    this.camRotating = false;
    this.cameraPath = new THREE.Vector3();
    this.camAnimateTime = 3;
    this.incPos = new THREE.Vector3();
    this.camRotateTime = 1;
    this.currentLookAt = new THREE.Vector3();

    //Media
    this.videoPlayer = document.getElementById("videoPlayer");
    this.videoPlayerSource = document.getElementById("videoPlayerSource");

    //GUI
    this.guiControls = null;
    this.gui = null;
};

Tate.prototype.createScene = function() {
    //Create scene
    var _this = this;
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
            node.name = tateData[i]["Node name"];
            node.index = i;

            node.linksInspired = tateData[i]["Inspired by"] !== null ? tateData[i]["Inspired by"] : [];
            node.linksInspire = tateData[i]["Inspires"] !== null ? tateData[i]["Inspires"] : [];
            node.linksOppose = tateData[i]["In opposition to"] !== null ? tateData[i]["In opposition to"] : [];
            node.linksResponse = tateData[i]["In response to"] !== null ? tateData[i]["In response to"] : [];
            node.linksWorks = tateData[i]["Works with"] !== null ? tateData[i]["Works with"] : [];
            node.linksAssociate = tateData[i]["Associated with"] !== null ? tateData[i]["Associated with"] : [];
            node.linksExhibited = tateData[i]["Exhibited with"] !== null ? tateData[i]["Exhibited with"] : [];
        }
    }

    //Display nodes within each group
    for(i=0; i<internalNodeGroups.length; ++i) {
        this.sortNodes(internalNodeGroups[i], 300);
    }
    this.internalNodeGroups = internalNodeGroups;
    //Link to other nodes in same group for now
    for(i=0; i<internalNodeGroups.length; ++i) {
        this.createLinks(internalNodeGroups[i], true);
    }

    //Draw everything
    group = new THREE.Object3D();
    group.name = "allNodes";
    this.mainScene = BaseApp.prototype.createScene.call(this);
    this.scenes[this.mainScene].add(group);
    for(i=0; i<tateData.length; ++i) {
        type = tateData[i]["Type of node"];
        for (j = 0; j < numGroups; ++j) {
            if (type === nodeGroupTypes[j]) break;
        }
        node = this.createNode(type);
        if (node) {
            group.add(node);
            node.name = tateData[i]["Node name"];
            node.index = i;

            node.linksInspired = tateData[i]["Inspired by"] !== null ? tateData[i]["Inspired by"] : [];
            node.linksInspire = tateData[i]["Inspires"] !== null ? tateData[i]["Inspires"] : [];
            node.linksOppose = tateData[i]["In opposition to"] !== null ? tateData[i]["In opposition to"] : [];
            node.linksResponse = tateData[i]["In response to"] !== null ? tateData[i]["In response to"] : [];
            node.linksWorks = tateData[i]["Works with"] !== null ? tateData[i]["Works with"] : [];
            node.linksAssociate = tateData[i]["Associated with"] !== null ? tateData[i]["Associated with"] : [];
            node.linksExhibited = tateData[i]["Exhibited with"] !== null ? tateData[i]["Exhibited with"] : [];
        }
    }
    this.mainGroup = group;
    this.sortNodes(group, 400);
    this.createLinks(group, false);
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

Tate.prototype.sortNodes = function(group, radius) {
    //Arrange nodes in group
    var numChildren = group.children.length;
    var groupAngle = (Math.PI*2) / numChildren;
    var label, node, labelOffset = 10;
    var pos = new THREE.Vector3();
    var labelScale = new THREE.Vector3(80, 60, 1);
    for(var i=0; i<numChildren; ++i) {
        node = group.children[i];
        node.position.set(radius * Math.sin(groupAngle*i), 0, radius * Math.cos(groupAngle*i));
        pos.copy(node.position);
        pos.y += labelOffset;
        label = spriteManager.create(node.name, pos, labelScale, 32, 1, true, false);
        group.add(label);
    }
};

function nodeInGroup(nodeIndex, group) {
    //See if this node in this group
    var child, i;
    for(i=0; i<group.children.length; ++i) {
        child = group.children[i];
        if(child instanceof THREE.Mesh) {
            if(nodeIndex === child.index) {
                return true;
            }
        }
    }

    return false;
}

Tate.prototype.getNodePos = function(nodeIndex, internal) {
    //Search groups for this node and get pos
    var i, j,child;
    if(!internal) {
        for(i=0; i<this.mainGroup.children.length; ++i) {
            child = this.mainGroup.children[i];
            if(child instanceof THREE.Mesh) {
                if(child.index === nodeIndex) {
                    return child.position;
                }
            }
        }
    } else {
        for(i=0; i<this.internalNodeGroups.length; ++i) {
            for(j=0; j<this.internalNodeGroups[i].children.length; ++j) {
                child = this.internalNodeGroups[i].children[j];
                if(child instanceof THREE.Mesh) {
                    if(child.index === nodeIndex) {
                        return child.position;
                    }
                }
            }
        }
    }

    return null;
};

Tate.prototype.drawLink = function(from, to, group, lineColour) {
    var lineGeom = new THREE.Geometry();
    lineGeom.vertices.push(from, to);
    var link = new THREE.Line(lineGeom, lineColour);
    group.add(link);
};

Tate.prototype.createLinks = function(group, checkGroup) {
    //Create links to other nodes
    var numChildren = group.children.length;
    var node, i, j, toNodeIndex, toNodePos = new THREE.Vector3();
    var validNode;
    for(i=0; i<numChildren; ++i) {
        node = group.children[i];
        if(node instanceof THREE.Mesh) {
            if(node["linksInspired"].length !== 0) {
                //See if links are in group
                for(j=0; j<node.linksInspired.length; ++j) {
                    toNodeIndex = node.linksInspired[j];
                    validNode = checkGroup ?  nodeInGroup(toNodeIndex, group) : true;
                    if(validNode) {
                        toNodePos = this.getNodePos(toNodeIndex, checkGroup);
                        this.drawLink(node.position, toNodePos, group, LINES.LineColours['red']);
                    }
                }
            }
            if(node.linksInspire.length !== 0) {
                //See if links are in group
                for(j=0; j<node.linksInspire.length; ++j) {
                    toNodeIndex = node.linksInspire[j];
                    validNode = checkGroup ?  nodeInGroup(toNodeIndex, group) : true;
                    if(validNode) {
                        toNodePos = this.getNodePos(toNodeIndex, checkGroup);
                        this.drawLink(node.position, toNodePos, group, LINES.LineColours['green']);
                    }
                }
            }
            if(node.linksOppose.length !== 0) {
                //See if links are in group
                for(j=0; j<node.linksOppose.length; ++j) {
                    toNodeIndex = node.linksOppose[j];
                    validNode = checkGroup ?  nodeInGroup(toNodeIndex, group) : true;
                    if(validNode) {
                        toNodePos = this.getNodePos(toNodeIndex, checkGroup);
                        this.drawLink(node.position, toNodePos, group, LINES.LineColours['darkBlue']);
                    }
                }
            }
            if(node.linksResponse.length !== 0) {
                //See if links are in group
                for(j=0; j<node.linksResponse.length; ++j) {
                    toNodeIndex = node.linksResponse[j];
                    validNode = checkGroup ?  nodeInGroup(toNodeIndex, group) : true;
                    if(validNode) {
                        toNodePos = this.getNodePos(toNodeIndex, checkGroup);
                        this.drawLink(node.position, toNodePos, group, LINES.LineColours['yellow']);
                    }
                }
            }
            if(node.linksWorks.length !== 0) {
                //See if links are in group
                for(j=0; j<node.linksWorks.length; ++j) {
                    toNodeIndex = node.linksWorks[j];
                    validNode = checkGroup ?  nodeInGroup(toNodeIndex, group) : true;
                    if(validNode) {
                        toNodePos = this.getNodePos(toNodeIndex, checkGroup);
                        this.drawLink(node.position, toNodePos, group, LINES.LineColours['orange']);
                    }
                }
            }
            if(node.linksAssociate.length !== 0) {
                //See if links are in group
                for(j=0; j<node.linksAssociate.length; ++j) {
                    toNodeIndex = node.linksAssociate[j];
                    validNode = checkGroup ?  nodeInGroup(toNodeIndex, group) : true;
                    if(validNode) {
                        toNodePos = this.getNodePos(toNodeIndex, checkGroup);
                        this.drawLink(node.position, toNodePos, group, LINES.LineColours['purple']);
                    }
                }
            }
            if(node.linksExhibited.length !== 0) {
                //See if links are in group
                for(j=0; j<node.linksExhibited.length; ++j) {
                    toNodeIndex = node.linksExhibited[j];
                    validNode = checkGroup ?  nodeInGroup(toNodeIndex, group) : true;
                    if(validNode) {
                        toNodePos = this.getNodePos(toNodeIndex, checkGroup);
                        this.drawLink(node.position, toNodePos, group, LINES.LineColours['lightBlue']);
                    }
                }
            }
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
    var labelWidth = this.guiAppear.add(this.guiControls, 'LabelWidth', 0.25,  10.0).step(0.25);
    labelWidth.onChange(function(value) {
        _this.scaleLabels(value, WIDTH);
    });

    var labelHeight = this.guiAppear.add(this.guiControls, 'LabelHeight', 0.25, 10.0).step(0.25);
    labelHeight.onChange(function(value) {
        _this.scaleLabels(value, HEIGHT);
    });

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

    switch (this.interactionState) {
        case NONE:
            break;

        case ZOOM:
            if(this.selectedObject && !this.camRotating && this.zoomAllowed) {
                this.parent = this.selectedObject.parent;
                var world = this.parent.position.setFromMatrixPosition(this.selectedObject.matrixWorld);
                this.tempPos.copy(world);
                this.currentLookAt.copy(this.controls.getLookAt());
                this.rotateCameraTo(world);
                this.camRotating = true;
                this.selectedObject = null;
                this.zoomAllowed = false;
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
                    $('#groupType').html(this.parent.name);
                    $('#groupInfo').show();
                    this.interactionState = INFO;
                } else {
                    this.incPos.multiplyScalar(delta/this.camAnimateTime);
                    this.camera.position.add(this.incPos);
                    this.incPos.copy(this.cameraPath);
                }
            }
            break;

        case INFO:
            if(this.selectedObject) {
                var record = this.getNodeData(this.selectedObject);
                $('#nodeName').html(record["Node name"]);
                $('#nodeDescription').html(record["Description"] !== "" ? record["Description"] : "No description available");
                $('#nodeImage').attr("src", record["Image link"] !== "" ? record["Image link"] : "images/imgHolder.jpg");
                if(record["Video link"] !== null) {
                    this.videoPlayerSource.setAttribute("src", record["Video link"]);
                    $('#nodeVideo').hide();
                    $('#videoPlayer').show();
                }
                $('#nodeInformation').show();
                this.selectedObject = null;
            }
            break;

        default:
            break;
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

Tate.prototype.goHome = function() {
    this.currentScene = 0;
    this.zoomAllowed = true;
    $("#nodeInformation").hide();
    $('#groupInfo').hide();
    this.interactionState = ZOOM;
    this.resetCamera();
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

Tate.prototype.getNodeData = function(node) {
    //Use index in node to retrieve data
    if(node.index === undefined) {
        console.log("No node index!!");
        return null;
    }

    //DEBUG
    console.log("Index = ", node.index);
    return tateData[node.index];
};

Tate.prototype.hideInfoPanel = function() {
    $('#nodeInformation').hide();
};

Tate.prototype.showAllNodes = function() {
    $('#groupInfo').hide();
    this.camera.position.set(0, 350, 830);
    this.interactionState = INFO;
    this.currentScene = this.mainScene;
};

Tate.prototype.getNumNodes = function(sceneNum) {
    return this.internalNodeGroups[sceneNum-1].children.length;
};

$(document).ready(function() {
    //Initialise app
    var container = document.getElementById("WebGL-output");
    var app = new Tate();
    app.init(container);
    app.createScene();
    app.createGUI();

    //GUI callbacks
    $('#home').on("click", function() {
        app.goHome();
    });

    $('#nodeInfoOK').on("click", function() {
        app.hideInfoPanel();
    });

    $('#showAll').on("click", function() {
        app.showAllNodes();
    });

    app.run();
});
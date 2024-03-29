/**
 * Created by atg on 08/11/2016.
 */
//Holds all the data for a node visualised on a map

var MapNode = function() {
    this.type = undefined;
    this.pin = undefined;
    this.link = undefined;
};

MapNode.prototype = {
    init: function(type, name, position) {
        var colour = this.getNodeColour(type);
        if(colour === undefined) {
            console.log("No colour for this type!");
            return false;
        }
        this.type = type;
        this.colour = colour;
        this.textColour = colour;
        this.name = name;
        this.isActive = true;
        this.nodePosition = new THREE.Vector3(position.x, position.y, position.z);
        this.position = new THREE.Vector3(0, position.y, 0);
        this.circleXScale = 30;
        this.circleYScale = 30;
        this.circleScale = new THREE.Vector3(this.circleXScale, this.circleYScale, 1);
        this.labelXScale = 100;
        this.labelYScale = 80;
        this.labelScale = new THREE.Vector3(this.labelXScale, this.labelYScale, 1);
        this.alignment = 20;
        this.labelPosition = new THREE.Vector3();
        this.baseGeom = undefined;

        //Create mapNode geometry
        this.nodeGroup = new THREE.Object3D();

        return true;
    },

    getNodeColour: function(type) {
        //Get colour for specific node
        var colour;
        switch (type) {
            case "Artists":
                colour = LINES.LineColours.red;
                break;

            case "Researchers/Thinkers":
                colour = LINES.LineColours.redOrange;
                break;

            case "Curators":
                colour = LINES.LineColours.orange;
                break;

            case "Instigators":
                colour = LINES.LineColours.yellowOrange;
                break;

            case "Performances":
                colour = LINES.LineColours.yellow;
                break;

            case "Interventions":
                colour = LINES.LineColours.yellowGreen;
                break;

            case "Exhibitions":
                colour = LINES.LineColours.green;
                break;

            case "Initiatives":
                colour = LINES.LineColours.blueGreen;
                break;

            case "Other artwork":
                colour = LINES.LineColours.blue;
                break;

            case "Institutions - Art":
                colour = LINES.LineColours.blueViolet;
                break;

            case "Institutions - Other":
                colour = LINES.LineColours.violet;
                break;

            case "Public":
                colour = LINES.LineColours.redViolet;
                break;

            case "Country":
                colour = LINES.LineColours.country;
                break;

            default:
                //DEBUG
                console.log("No colour for type ", type);
                break;
        }

        return colour;
    },

    setIndex: function(index) {
        this.index = index;
    },

    getIndex: function() {
        return this.index;
    },

    getType: function() {
        return this.type;
    },

    setAlign: function(alignment) {
        this.alignment = alignment;
    },

    setTextColour: function(colour) {
        this.textColour = colour;
    },

    createGeometry: function(geom) {
        this.baseGeom = geom;
        this.pin = this.createPin();
        this.nodeGroup.add(this.pin);
        this.link = this.createLink();
        this.nodeGroup.add(this.link);
        this.label = this.createLabel();
        this.nodeGroup.add(this.label);
        this.baseMesh = this.createBaseMesh();
        this.nodeGroup.add(this.baseMesh);
        this.nodeGroup.position.set(this.nodePosition.x, 0, this.nodePosition.z);
    },

    createPin: function() {
        return circleSpriteManager.create(this.name, this.colour, this.position, this.circleScale, 1, true);
    },

    getPin: function() {
        return this.pin;
    },

    visible: function(status) {
        if(status === undefined) {
            return this.nodeGroup.visible;
        }

        this.nodeGroup.visible = status;
    },

    active: function(status) {
        if (status === undefined) return this.isActive;

        this.isActive = status;
    },

    getLinkScale: function() {
        return this.link.scale.y;
    },

    createLink: function() {
        var lineGeom = new THREE.Geometry();
        var to = new THREE.Vector3(0, 0, 0);
        lineGeom.vertices.push(this.position, to);
        this.link = new THREE.Line(lineGeom, this.colour);
        return this.link;
    },

    getLink: function() {
        return this.link;
    },

    updateLink: function(from) {
        this.link.geometry.vertices[0].x = from.x;
        this.link.geometry.vertices[0].z = from.z;
        this.link.geometry.verticesNeedUpdate = true;
    },

    updatePosition: function(pos) {
        //Link
        this.link.geometry.vertices[0].x = pos.x;
        this.link.geometry.vertices[0].z = pos.z;
        this.link.geometry.verticesNeedUpdate = true;

        //Pin
        this.pin.position.x = pos.x;
        this.pin.position.z = pos.z;

        //Label
        this.label.position.x =  pos.x;
        this.label.position.z =  pos.z;
    },

    getHeight: function() {
        return this.position.y;
    },

    scaleHeight: function(scale) {
        //Link
        var currentScale = this.link.scale.y;
        this.link.scale.y = scale;

        //Pin
        this.pin.position.y = (this.pin.position.y/currentScale) * scale;

        //Label
        this.label.position.y = this.pin.position.y + this.alignment;
    },

    updateLabelWidth: function(width) {
        this.label.scale.x = width;
    },

    updateLabelHeight: function(height) {
        this.label.scale.y = height;
    },

    createLabel: function() {
        var limit = 20;
        this.labelPosition.copy(this.position);
        this.labelPosition.y += this.alignment;
        return spriteManager.create(this.name, limit, this.textColour, this.labelPosition, this.labelScale, 32, 1, true, true);
    },

    getLabel: function() {
        return this.label;
    },

    createBaseMesh: function() {
        var mesh = new THREE.Mesh(this.baseGeom, new THREE.MeshLambertMaterial( { color: this.colour.color}));
        mesh.position.set(this.position.x, 0, this.position.z);
        return mesh;
    },

    getNodeGroup: function() {
        return this.nodeGroup;
    },

    getNodeGroupPosition: function() {
        return this.nodePosition;
    },

    getName: function() {
        return this.name;
    }
};

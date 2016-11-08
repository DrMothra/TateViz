/**
 * Created by atg on 08/11/2016.
 */
//Holds all the data for a node visualised on a map

var MapNode = function() {
    this.type = undefined;
    this.pin = undefined;
    this.link = undefined;
    this.base = undefined;
};

MapNode.prototype = {
    init: function(type, name, pos) {
        var colour = this.getNodeColour(type);
        if(colour === undefined) {
            console.log("No colour for this type!");
            return false;
        }
        this.type = type;
        this.colour = colour;
        this.name = name;
        this.pos = new THREE.Vector3(pos.x, pos.y, pos.z);
        this.circleXScale = 30;
        this.circleYScale = 30;
        this.circleScale = new THREE.Vector3(this.circleXScale, this.circleYScale, 1);
        this.labelXScale = 100;
        this.labelYScale = 80;
        this.labelScale = new THREE.Vector3(this.labelXScale, this.labelYScale, 1);
        this.labelPosition = new THREE.Vector3();
        this.lineGeom = undefined;
        this.baseGeom = undefined;
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

            default:
                //DEBUG
                console.log("No colour for type ", type);
                break;
        }

        return colour;
    },

    setLineGeom: function(geom) {
        this.lineGeom = geom;
    },

    setBaseGeom: function(geom) {
        this.baseGeom = geom;
    },

    createPin: function() {
        this.circle = circleSpriteManager.create(this.name, this.colour, this.pos, this.circleScale, 1, true);
        this.link = this.createLink()
    },

    createLink: function() {
        var lineGeom = new THREE.Geometry();
        var to = new THREE.Vector3(this.pos.x, 0, this.pos.z);
        lineGeom.vertices.push(this.pos, to);
        return new THREE.Line(lineGeom, this.colour);
    },

    createLabel: function() {
        var limit = 20;
        var labelAlign = 50;
        this.labelPosition.copy(this.pos);
        this.labelPosition.x -= labelAlign;
        this.label = spriteManager.create(this.name, limit, this.colour, this.labelPosition, this.labelScale, 32, 1, true, false);
    },

    createBase: function() {
        var mesh = new THREE.Mesh(sphereGeom, new THREE.MeshLambertMaterial( { color: colour.color}));
        mesh.position.copy(ground);
    }
};

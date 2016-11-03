/**
 * Created by atg on 28/01/2015.
 */
//Manage all the labels (sprites) for the website

var circleSpriteManager = (function () {
    //Default values
    var defaultBorderThickness = 0;
    var backgroundColour = 'rgba(55, 55, 55, 1.0)';
    var borderColour = 'rgba(0, 0, 0, 1.0)';
    var defaultRadius = 20;

    var labels = [];
    var labelNames = [];

    //Default material
    var textureLoader = new THREE.TextureLoader();
    var spriteTexture = textureLoader.load( "textures/circle.png" );


    return {
        create: function(name, colour, position, scale, opacity, visible) {
            //Create sprite
            var spriteColour = colour.color;
            var spriteMaterial = new THREE.SpriteMaterial({
                    transparent: false,
                    opacity: opacity,
                    color: spriteColour,
                    map: spriteTexture}
            );

            var sprite = new THREE.Sprite(spriteMaterial);
            labels.push(sprite);
            sprite.name = name;
            labelNames.push(name);
            sprite.visible = visible;

            sprite.position.copy(position);
            sprite.scale.set(scale.x, scale.y, 1);

            return sprite;
        },

        setBorderProperties: function(thickNess, colour) {
            defaultBorderThickness = thickNess != undefined ? thickNess : defaultBorderThickness;
            borderColour = colour != undefined ? 'rgba('+colour.r+','+colour.g+','+colour.b+','+colour.a+')' : borderColour;
        },

        setBorderColour: function(colour) {
            if(colour != undefined) {
                var red = Math.round(colour[0]);
                var green = Math.round(colour[1]);
                var blue = Math.round(colour[2]);

                borderColour = "rgba(" + red + "," + green + "," + blue + "," + "1.0)";
            }
        },

        setBackgroundColour: function(colour) {
            if(colour != undefined) {
                var red = Math.round(colour[0]);
                var green = Math.round(colour[1]);
                var blue = Math.round(colour[2]);

                backgroundColour = "rgba(" + red + "," + green + "," + blue + "," + "1.0)";
            }
        },

        setTextColour: function(colour) {
            if(colour != undefined) {
                var red = Math.round(colour[0]);
                var green = Math.round(colour[1]);
                var blue = Math.round(colour[2]);

                textColour = "rgba(" + red + "," + green + "," + blue + "," + "1.0)";
            }
        },

        getSprite: function(name) {
            for(var i=0; i<labelNames.length; ++i) {
                if(labelNames[i] === name) {
                    return labels[i];
                }
            }

            return null;
        }
    };
})();


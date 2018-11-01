
var PLANETS = {
    earth: 0,
    moon: 1,
    saturn: 2,
    jupiter: 3,
    signature: 4,
    reflectcube: 5
};

// config for animation
var ANIMATE = {
    earth :{
        step: 0.2,
        axe: [0,0,1]
    },
    saturn: {
        step: .5,
        axe: [0,0,1]
    },
    jupiter: {
        step: .05,
        axe: [0,0,1]
    },
    signature: {
        step: 1.5,
        axe: [0,1,0]
    }
}

var planets = new right_child_left_sibling(PLANETS);

// definition for planets

var planets_components = {
    earth: function() {
        modelview = mult(modelview, translate(-10, -10, 30));
        modelview = mult(modelview, rotate(80, 0, 0, 1));
        modelview = mult(modelview, rotate(90, 0, 1, 0));

        modelview = animate(modelview, PLANETS.earth);
        normalMatrix = extractNormalMatrix(modelview);  // faire avant scale
        modelview = mult(modelview, scale4(5, 5,5));

        setColor(190,190,190);
        setTexture(TEXTURE.EARTH);
        sphere.render();
        modelview = mult(modelview, scale4(1/5,1/5,1/5));
    },

    moon: function() {

        angle[PLANETS.moon] += 1;
        modelview = mult(modelview, rotate(getAngle(PLANETS.earth) + getAngle(PLANETS.moon), 0, 0, 1));
        modelview = mult(modelview, translate(15, 0, 0));
        normalMatrix = extractNormalMatrix(modelview);  // faire avant scale
        modelview = mult(modelview, scale4(1.5, 1.5, 1.5));

        setColor(190,190,190);
        setShininess(100);
        setTexture(TEXTURE.MOON);

        sphere.render();
        modelview = mult(modelview, scale4(1/1.5,1/1.5,1/1.5));
    },

    saturn: function() {

        modelview = mult(modelview, translate(0, 27, -25));
        modelview = mult(modelview, rotate(20, 0, 0, 1));
        modelview = mult(modelview, rotate(-50, 1, 0, 0));

        modelview = animate(modelview, PLANETS.saturn);
        normalMatrix = extractNormalMatrix(modelview);  // faire avant scale
        modelview = mult(modelview, scale4(6, 6, 6));

        setColor(100,100,100);
        setTexture(TEXTURE.SATURN);
        sphere.render();
        modelview = mult(modelview, scale4(1/6,1/6,1/6));

        modelview = mult(modelview, scale4(15, 15, 15));
        setColor(100,100,100);
        setTexture(TEXTURE.SATURN_RING);
        m_ring.render();
    },

    jupiter: function() {

  	    modelview = mult(modelview, translate(100, 0, -150));
  	    modelview = mult(modelview, rotate(90, 1, 0, 0));

  	    modelview = animate(modelview, PLANETS.jupiter);

  	    normalMatrix = extractNormalMatrix(modelview);  // faire avant scale
  	    modelview = mult(modelview, scale4(50, 50, 50));

  	    setColor(100,100,100);
  	    setTexture(TEXTURE.JUPITER);

  	    sphere.render();
  	    modelview = mult(modelview, scale4(1/100,1/100,1/100));
    },

    signature: function() {
  	    modelview = mult(modelview, translate(-25, 0, -25));
  	    modelview = mult(modelview, rotate(90, 0, 1, 0));

  	    modelview = animate(modelview, PLANETS.signature);

  	    normalMatrix = extractNormalMatrix(modelview);  // faire avant scale
  	    modelview = mult(modelview, scale4(10, 10, 10));

  	    setColor(100,100,100);
  	    setTexture(TEXTURE.SIGNATURE);
  	    setTranslucent(0.5);

  	    m_cube.render();

  	    cleanTranslucent();

    },

    reflect_cube: function() {

      	switchProgram(PROGRAM.PROG_MAP);

  	    Minv = matrixinvert(modelview);

        modelview = mult(modelview, translate(-25, 25, -50));

  		  angle[PLANETS.reflectcube] += .5;
  		  modelview = mult(modelview, rotate(getAngle(PLANETS.reflectcube), 0, 1, 0));

  		  modelview = mult(modelview, scale4(10, 10, 10));

  	    setMapTexture(BOX_TEXTURE.SKYBOX);
  	    m_reflect_cube.render();

        // switch back just in case we draw something else
        switchProgram(PROGRAM.PROG);
    }
}

planets.initNodes = function(figure, id) {
    var m = mat4();

    switch (id) {
        case PLANETS.earth:
            figure[PLANETS.earth] = createNode(m, planets_components.earth, PLANETS.saturn, PLANETS.moon);
            break;

        case PLANETS.moon:
            figure[PLANETS.moon] = createNode(m, planets_components.moon, null, null);
            break;

        case PLANETS.saturn:
            figure[PLANETS.saturn] = createNode(m, planets_components.saturn, PLANETS.jupiter, null);
            break;

        case PLANETS.jupiter:
            figure[PLANETS.jupiter] = createNode(m, planets_components.jupiter, PLANETS.signature, null);
            break;

        case PLANETS.signature:
    		    figure[PLANETS.signature] = createNode(m, planets_components.signature, PLANETS.reflectcube, null);
    		    break;

        case PLANETS.reflectcube:
            figure[PLANETS.reflectcube] = createNode(m, planets_components.reflect_cube, null, null);
            break;
    }
}

// animation service

//--- public

// animation service
// example for use:
//      modelview = animate(modelview, PLANETS.EARTH);
function animate(modelview, code) {

    function getKeyByValue(object, value) {
        return Object.keys(object).find(key => object[key] === value);
    }
    var animate_code = getKeyByValue(PLANETS, code);

    angle[code] += ANIMATE[animate_code].step || 0;
    var axe = ANIMATE[animate_code].axe || [1,0,0];
    return mult(modelview, rotate(angle[code], axe[0], axe[1], axe[2]));
}

//--- private
var angle = new Array(Object.keys(PLANETS).length);
var i = 0;
for(i = 0; i < angle.length; i++) {angle[i] = 0;}

function getAngle(code) {
    return angle[code];
}


// -------------

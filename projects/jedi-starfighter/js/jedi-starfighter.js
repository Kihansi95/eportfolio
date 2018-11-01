// This program was developped by Daniel Audet and uses sections of code
// from http://math.hws.edu/eck/cs424/notes2013/19_GLSL.html
//
//  It has been adapted to be compatible with the "MV.js" library developped
//  for the book "Interactive Computer Graphics" by Edward Angel and Dave Shreiner.
//

"use strict";

var gl;   // The webgl context.

// Location of the coords attribute variable in the standard texture mappping shader program.
var CoordsLoc;
var NormalLoc;
var TexCoordLoc;

// Location of the attribute variables in the environment mapping shader program.
var aCoordsmap;
var aNormalmap;
var aTexCoordmap;

// Location of the uniform variables in the environment mapping shader program.
var uProjectionmap;
var uModelviewmap;
var uNormalMatrixmap;
var uMinvmap;
var uSkybox;

var Minv = mat3();  // matrix inverse of modelview

// Location of the coords attribute variable in the shader program used for texturing the environment box.
var aCoordsbox;
var aNormalbox;
var aTexCoordbox;

var uModelviewbox;
var uProjectionbox;
var uEnvbox;

// Location of the uniform variables in the standard texture mappping shader program.
var ProjectionLoc;
var ModelviewLoc;
var NormalMatrixLoc;
var alphaLoc;

var projection;             //--- projection matrix
var modelview;              // modelview matrix
var flattenedmodelview;     //--- flattened modelview matrix

var normalMatrix = mat3();  //--- create a 3X3 matrix that will affect normals

var rotator;   // A SimpleRotator object to enable rotation by mouse dragging.

var prog, progmap, progbox;  // shader program identifier

var  envbox;  // model identifiers

var lightPosition = vec4(20.0, 20.0, 100.0, 1.0);

var lightAmbient = vec4(1.0, 1.0, 1.0, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var materialAmbient = vec4(0.0, 0.1, 0.3, 1.0);
var materialDiffuse = vec4(0.48, 0.55, 0.69, 1.0);
var materialSpecular = vec4(0.48, 0.55, 0.69, 1.0);
var materialShininess = 100.0;

var ambientProduct, diffuseProduct, specularProduct;

function unflatten(matrix) {
    var result = mat4();
    result[0][0] = matrix[0]; result[1][0] = matrix[1]; result[2][0] = matrix[2]; result[3][0] = matrix[3];
    result[0][1] = matrix[4]; result[1][1] = matrix[5]; result[2][1] = matrix[6]; result[3][1] = matrix[7];
    result[0][2] = matrix[8]; result[1][2] = matrix[9]; result[2][2] = matrix[10]; result[3][2] = matrix[11];
    result[0][3] = matrix[12]; result[1][3] = matrix[13]; result[2][3] = matrix[14]; result[3][3] = matrix[15];

    return result;
}

// This function computes the transpose of the inverse of
// the upperleft part (3X3) of the modelview matrix (see http://www.lighthouse3d.com/tutorials/glsl-tutorial/the-normal-matrix/ )
function extractNormalMatrix(matrix) {

    var result = mat3();
    var upperleft = mat3();
    var tmp = mat3();

    upperleft[0][0] = matrix[0][0];  // if no scaling is performed, one can simply use the upper left
    upperleft[1][0] = matrix[1][0];  // part (3X3) of the modelview matrix
    upperleft[2][0] = matrix[2][0];

    upperleft[0][1] = matrix[0][1];
    upperleft[1][1] = matrix[1][1];
    upperleft[2][1] = matrix[2][1];

    upperleft[0][2] = matrix[0][2];
    upperleft[1][2] = matrix[1][2];
    upperleft[2][2] = matrix[2][2];

    tmp = matrixinvert(upperleft);
    result = transpose(tmp);

    return result;
}

function matrixinvert(matrix) {

    var result = mat3();

    var det = matrix[0][0] * (matrix[1][1] * matrix[2][2] - matrix[2][1] * matrix[1][2]) -
                 matrix[0][1] * (matrix[1][0] * matrix[2][2] - matrix[1][2] * matrix[2][0]) +
                 matrix[0][2] * (matrix[1][0] * matrix[2][1] - matrix[1][1] * matrix[2][0]);

    var invdet = 1 / det;

    // inverse of matrix m
    result[0][0] = (matrix[1][1] * matrix[2][2] - matrix[2][1] * matrix[1][2]) * invdet;
    result[0][1] = (matrix[0][2] * matrix[2][1] - matrix[0][1] * matrix[2][2]) * invdet;
    result[0][2] = (matrix[0][1] * matrix[1][2] - matrix[0][2] * matrix[1][1]) * invdet;
    result[1][0] = (matrix[1][2] * matrix[2][0] - matrix[1][0] * matrix[2][2]) * invdet;
    result[1][1] = (matrix[0][0] * matrix[2][2] - matrix[0][2] * matrix[2][0]) * invdet;
    result[1][2] = (matrix[1][0] * matrix[0][2] - matrix[0][0] * matrix[1][2]) * invdet;
    result[2][0] = (matrix[1][0] * matrix[2][1] - matrix[2][0] * matrix[1][1]) * invdet;
    result[2][1] = (matrix[2][0] * matrix[0][1] - matrix[0][0] * matrix[2][1]) * invdet;
    result[2][2] = (matrix[0][0] * matrix[1][1] - matrix[1][0] * matrix[0][1]) * invdet;

    return result;
}

function createProgram(gl, vertexShaderSource, fragmentShaderSource) {
    var vsh = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vsh, vertexShaderSource);
    gl.compileShader(vsh);
    if (!gl.getShaderParameter(vsh, gl.COMPILE_STATUS)) {
        throw "Error in vertex shader:  " + gl.getShaderInfoLog(vsh);
    }
    var fsh = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fsh, fragmentShaderSource);
    gl.compileShader(fsh);
    if (!gl.getShaderParameter(fsh, gl.COMPILE_STATUS)) {
        throw "Error in fragment shader:  " + gl.getShaderInfoLog(fsh);
    }
    var prog = gl.createProgram();
    gl.attachShader(prog, vsh);
    gl.attachShader(prog, fsh);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        throw "Link error in program:  " + gl.getProgramInfoLog(prog);
    }
    return prog;
}

function getTextContent(elementID) {
    var element = document.getElementById(elementID);
    var fsource = "";
    var node = element.firstChild;
    var str = "";
    while (node) {
        if (node.nodeType == 3) // this is a text node
            str += node.textContent;
        node = node.nextSibling;
    }
    return str;
}


var my_position = mat4();
var my_step = 0.5;
var ARROW = {
    LEFT:37,
    RIGHT: 39,
    UP: 38,
    DOWN: 40
}
function doKey(evt) {
    var rotationChanged = true;
    if(evt.ctrlKey) {
        switch (evt.keyCode) {
            case ARROW.UP:
                my_position = mult(my_position, translate(0, - my_step, 0));
                break;
            case ARROW.DOWN:
                my_position = mult(my_position, translate(0, my_step, 0));
                break;
        }
    }

    switch (evt.keyCode) {
        case ARROW.LEFT:
            my_position = mult(my_position, translate(my_step, 0, 0));
            break;        // left arrow
        case ARROW.RIGHT:
            my_position = mult(my_position, translate(- my_step, 0, 0));
            break;       // right arrow
        case ARROW.UP:
            my_position = mult(my_position, translate(0, 0, my_step));
            break;        // up arrow
        case ARROW.DOWN:
            my_position = mult(my_position, translate(0, 0, - my_step));
            break;        // down arrow
        default:
            console.log('key not handle');
    }
}

function render(){
    flattenedmodelview = rotator.getViewMatrix();
    modelview = unflatten(flattenedmodelview);

    gl.clear( gl.COLOR_BUFFER_BIT );

    if (ntextures_loaded == ntextures_tobeloaded) {

        // set all to default
        cleanColor();
        cleanTranslucent();

  	    // Draw the environment
  	    switchProgram(PROGRAM.PROG_BOX);
  	    setEnvTexture(BOX_TEXTURE.SKYBOX);
  	    envbox.render();

        // Draw the spacecraft
        modelview = mult(modelview, my_position);
  	    switchProgram(PROGRAM.PROG);
  		  traverse(spacecraft, SPACECRAFT.controlCenter);     // spacecraft
  		  traverse(planets, PLANETS.earth);

      requestAnimFrame( render );

    }
};

window.onload = function init() {
    try {
        var canvas = document.getElementById("glcanvas");
        gl = canvas.getContext("webgl");
        if (!gl) {
            gl = canvas.getContext("experimental-webgl");
        }
        if (!gl) {
            throw "Could not create WebGL context.";
        }

        projection = perspective(70.0, 1.0, 1.0, 2000.0);

        // LOAD SHADER  (environmental mapping)
        var vertexShaderSourcemap = getTextContent("vshadermap");
        var fragmentShaderSourcemap = getTextContent("fshadermap");
        progmap = createProgram(gl, vertexShaderSourcemap, fragmentShaderSourcemap);

        gl.useProgram(progmap);

        // locate variables for further use
        aCoordsmap = gl.getAttribLocation(progmap, "vcoords");
        aNormalmap = gl.getAttribLocation(progmap, "vnormal");
        aTexCoordmap = gl.getAttribLocation(progmap, "vtexcoord");

        uModelviewmap = gl.getUniformLocation(progmap, "modelview");
        uProjectionmap = gl.getUniformLocation(progmap, "projection");
        uNormalMatrixmap = gl.getUniformLocation(progmap, "normalMatrix");
        uMinvmap = gl.getUniformLocation(progmap, "minv");

        uSkybox = gl.getUniformLocation(progmap, "skybox");

        gl.uniformMatrix4fv(uProjectionmap, false, flatten(projection));

        // LOAD SHADER (for the environment)
        var vertexShaderSourceBox = getTextContent("vshaderbox");
        var fragmentShaderSourceBox = getTextContent("fshaderbox");
        progbox = createProgram(gl, vertexShaderSourceBox, fragmentShaderSourceBox);

        gl.useProgram(progbox);

        aCoordsbox = gl.getAttribLocation(progbox, "vcoords");
        aNormalbox = gl.getAttribLocation(progbox, "vnormal");
        aTexCoordbox = gl.getAttribLocation(progbox, "vtexcoord");

        uModelviewbox = gl.getUniformLocation(progbox, "modelview");
        uProjectionbox = gl.getUniformLocation(progbox, "projection");

        uEnvbox = gl.getUniformLocation(progbox, "envbox");

        gl.uniformMatrix4fv(uProjectionbox, false, flatten(projection));

        gl.enable(gl.DEPTH_TEST);

        // LOAD SHADER (standard texture mapping)
        var vertexShaderSource = getTextContent("vshader");
        var fragmentShaderSource = getTextContent("fshader");
        prog = createProgram(gl, vertexShaderSource, fragmentShaderSource);

        gl.useProgram(prog);

        // locate variables for further use
        CoordsLoc = gl.getAttribLocation(prog, "vcoords");
        NormalLoc = gl.getAttribLocation(prog, "vnormal");
        TexCoordLoc = gl.getAttribLocation(prog, "vtexcoord");

        ModelviewLoc = gl.getUniformLocation(prog, "modelview");
        ProjectionLoc = gl.getUniformLocation(prog, "projection");
        NormalMatrixLoc = gl.getUniformLocation(prog, "normalMatrix");

        alphaLoc = gl.getUniformLocation(prog, "alpha");
        gl.enable(gl.DEPTH_TEST);

        initTexture();

        //  create a "rotator" monitoring mouse mouvement
        rotator = new SimpleRotator(canvas);

        //  set initial camera position at z=40, with an "up" vector aligned with y axis
        //   (this defines the initial value of the modelview matrix )
        rotator.setView([0, 0, 1], [0, 1, 0], 40);

        gl.uniform4fv(gl.getUniformLocation(prog, "lightPosition"), flatten(lightPosition));
        gl.uniformMatrix4fv(ProjectionLoc, false, flatten(projection));

        // initialize the model
        initModel();

        // build stuff
        spacecraft.build();
        planets.build();
    }
    catch (e) {
        console.log(e);
        document.getElementById("message").innerHTML =
            "Could not initialize WebGL: " + e;
        return;
    }

    // Initialize a texture
    initTexture();

    document.addEventListener("keydown", doKey, false);

    render();
};

var PROGRAM = {PROG: 0, PROG_BOX:1, PROG_MAP:2};

// switch program dynamically
// example for use:
//      switchProgram(PROGRAM.PROG);
function switchProgram(code) {
    switch(code) {
        case PROGRAM.PROG:
            gl.useProgram(prog);

            gl.enableVertexAttribArray(CoordsLoc);
            gl.enableVertexAttribArray(NormalLoc);
            gl.enableVertexAttribArray(TexCoordLoc);
            alphaLoc = gl.getUniformLocation(prog, "alpha");
            break;

        case PROGRAM.PROG_BOX:
            gl.useProgram(progbox); // Select the shader program that is used for the environment box.

            gl.enableVertexAttribArray(aCoordsbox);
            gl.disableVertexAttribArray(aNormalbox);     // normals are not used for the box
            gl.disableVertexAttribArray(aTexCoordbox);   // texture coordinates not used for the box
            break;

        case PROGRAM.PROG_MAP:
            gl.useProgram(progmap);

            gl.enableVertexAttribArray(aCoordsmap);
            gl.enableVertexAttribArray(aNormalmap);
            gl.disableVertexAttribArray(aTexCoordmap);  // texture coordinates not used (environmental mapping)
            break;
        default:
            throw('unknown program');
    }
}

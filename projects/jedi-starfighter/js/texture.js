// need to be loaded before jedi-fighter

var ntextures_tobeloaded = 0;
var ntextures_loaded = 0;

// store texture
var textures = [];

// enum (code) texture
var TEXTURE = {

	// spacecraft
	FRONTWING: 0,
	R2D2HEAD: 1,
	R2D2BODY: 2,
	MIDDLEWING: 3,
	CONTROLCENTER: 4,
	BACKWING: 5,
	ENGINE: 6,
	ENGINEBOTTOM: 7,
	CONTROLCOVER: 8,

	// solar system
	EARTH: 9,
	MOON: 10,
	SATURN: 11,
	SATURN_RING: 12,
	JUPITER: 13,
	SIGNATURE: 14
};

var TEXTURE_SRC = {

	// spacecraft
	FRONTWING: "img/spacecraft/front-wing.jpg",
	R2D2HEAD: "img/spacecraft/r2d2-head.jpg",
	R2D2BODY: "img/spacecraft/r2d2-body.jpg",
	MIDDLEWING: "img/spacecraft/middle-wing.jpg",
	CONTROLCENTER: "img/spacecraft/control-center.jpg",
	BACKWING: "img/spacecraft/back-wing.jpg",
	ENGINE: "img/spacecraft/engine.png",
	ENGINEBOTTOM: "img/spacecraft/push-engine.jpg",
	CONTROLCOVER: "img/spacecraft/control-cover.jpg",

	// solar system
	EARTH: "img/solarsystem/earth.jpg",
	MOON: "img/solarsystem/moon.jpg",
	SATURN: "img/solarsystem/saturn.jpg",
	SATURN_RING: "img/solarsystem/saturn_ring.jpg",
	JUPITER: "img/solarsystem/jupiter.jpg",
	SIGNATURE: "img/solarsystem/signature.gif"
};

var BOX_TEXTURE = {
	SKYBOX: 0
};
// config for skybox
var ct = 0;
var box_texture = [];
var skybox_img = new Array(6);
var SKYBOX_TEXTURE_SRC = [
	"img/skybox/nebula_posx.png",
	"img/skybox/nebula_posy.png",
	"img/skybox/nebula_posz.png",
	"img/skybox/nebula_negx.png",
	"img/skybox/nebula_negy.png",
	"img/skybox/nebula_negz.png"

	// "img/ciel-nuages/posx.jpg",
	// "img/ciel-nuages/posy.jpg",
	// "img/ciel-nuages/posz.jpg",
	// "img/ciel-nuages/negx.jpg",
	// "img/ciel-nuages/negy.jpg",
	// "img/ciel-nuages/negz.jpg"

	// "img/solarsystem/signature.gif",
	// "img/solarsystem/signature.gif",
	// "img/solarsystem/signature.gif",
	// "img/solarsystem/signature.gif",
	// "img/solarsystem/signature.gif",
	// "img/solarsystem/signature.gif"
];

// only used in main js
function initTexture() {

	// iterate all the texture list to load image
	Object.keys(TEXTURE).forEach(function (code) {
		textures[TEXTURE[code]] = gl.createTexture();

		textures[TEXTURE[code]].image = new Image();
		textures[TEXTURE[code]].image.onload = function () {
			handleLoadedTexture(textures[TEXTURE[code]])
		};

		textures[TEXTURE[code]].image.src = TEXTURE_SRC[code];
		ntextures_tobeloaded++;
	});

	// now load the sky box texture and bind it to skybox_texture
	Object.keys(BOX_TEXTURE).forEach(function (code) {
		box_texture[BOX_TEXTURE[code]] = gl.createTexture();

		for(var i = 0; i < 6; i++) {
			skybox_img[i] = new Image();
			skybox_img[i].onload = function () {  // this function is called when the image download is complete
				handleLoadedTextureMap(box_texture[BOX_TEXTURE[code]]);
			};
			skybox_img[i].src = SKYBOX_TEXTURE_SRC[i];   // this line starts the image downloading thread
			ntextures_tobeloaded++;
		}

	})


}

// private
function handleLoadedTexture(texture) {
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

	ntextures_loaded++;

	render();  // Call render function when the image has been loaded (to insure the model is displayed)

	gl.bindTexture(gl.TEXTURE_2D, null);
}

function handleLoadedTextureMap(texture) {

	ct++;
	ntextures_loaded++;
	if(ct == 6) {
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
		var targets = [
			gl.TEXTURE_CUBE_MAP_POSITIVE_X,
			gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
			gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
			gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
			gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
			gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
		];

		for(var j = 0; j < 6; j++) {
			gl.texImage2D(targets[j], 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, skybox_img[j]);
			gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		}
		gl.generateMipmap(gl.TEXTURE_CUBE_MAP);

		gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);

	}

	render();  // Call render function when the image has been loaded (to insure the model is displayed)
}

/**
 * Set the texture for any object. If an element doesn't have texture, call this function without variable.
 * All the texture defined in the TEXTURE array.
 * This service function is only used in object's definition, not in main js file
 * Example:
 *      setTexture(TEXTURE.FRONTWING);
 *      // draw front wing shape
 *      ...
 *      setTexture();
 *      // draw interior engine
 * @param code : use with the ENUM in TEXTURE const.
 */
function setTexture(code) {

	// disable TexCoordLoc when absent texture.f
	// toggle boolean hasTexture so that fragment shader can generate object
	if(typeof code === 'undefined' || code === null) {
		gl.uniform1i(gl.getUniformLocation(prog, "hasTexture"), false);
		gl.disableVertexAttribArray(TexCoordLoc);
	} else {
		gl.activeTexture(gl['TEXTURE' + code]);
		gl.bindTexture(gl.TEXTURE_2D, textures[code]);
		gl.uniform1i(gl.getUniformLocation(prog, "texture"), code);         // send texture to sampler
		gl.uniform1i(gl.getUniformLocation(prog, "hasTexture"), true);
		gl.enableVertexAttribArray(TexCoordLoc);
	}
}

function setEnvTexture(code) {
	var index = Object.keys(TEXTURE).length + code;
	gl.activeTexture(gl['TEXTURE' + index]);
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, box_texture[code]);
	gl.uniform1i(uEnvbox, index);
}

function setMapTexture(code) {
	var index = Object.keys(TEXTURE).length + code;
	gl.activeTexture(gl['TEXTURE' + index]);
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, box_texture[code]);
	gl.uniform1i(uSkybox, index);
}


function setTranslucent(degree) {

	function clamp(value, min, max) {
		return Math.min(Math.max(value, min), max);
	}

	gl.uniform1f(alphaLoc, clamp(degree, 0, 1));
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.enable(gl.BLEND);
	gl.depthMask(false);
}

function cleanTranslucent() {
	gl.uniform1f(alphaLoc, 1.0);
	gl.disable(gl.BLEND);
	gl.depthMask(true);
}

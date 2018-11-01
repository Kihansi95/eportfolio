// models.js generates some basic model we'll use in spacecraft.js
// Must be loaded before spacecraft

var sphere, tetrahedron, squareTetra, hemicone, cylinder, hemisphere,
    m_cube, m_ring, pentagonprism, trapeziumprism, triangleprism, cylinder_non_top_insdide, cylinder_non_top_outside;

var reflect;

function initModel() {
    sphere = createModel(uvSphere(1, 32, 32));
    tetrahedron = createModel(uvTetrahedron(10));
    squareTetra = createModel(uvSquareTetrahedron(1, 1, 1 ));
    hemicone = createModel(uvQuartersphereOutside(1, 25, 1));

    cylinder = createModel(uvCylinder(1,1,32.0, false, false ));

    cylinder_non_top_insdide = createModel(uvCylinderInside(1,1,32.0, false, true ));
    cylinder_non_top_outside = createModel(uvCylinder(1,1,32.0, true, true ));

    hemisphere = createModel(uvHemisphereOutside(1,32,16));

    m_cube = createModel(cube(1));

    m_ring = createModel(ring(0.7,1, 40));

    pentagonprism = createModel(uvPentagonPrism(true, 1, .65, 0.8, 0.4)); // right/left = 1/2, front/back = 3/4, left/back = 0.8

    trapeziumprism = createModel(uvTrapeziumPrism(true, {a: .5, b: 1, c:0.5}, {a: 1, b: 3, c:1.2}, 3));

    triangleprism = createModel(uvCylinder(1,1, 3, false, false ));

    // create the env reflect box model
    m_reflect_cube = createModelmap(cube(1));
    m_reflect_hemisphere = createModelmap(uvHemisphereOutside(1,32,16));

    // create the environment
    envbox = createModelbox(cube(1000.0));
}

function createModel(modelData) {
    var model = {};
    model.coordsBuffer = gl.createBuffer();
    model.normalBuffer = gl.createBuffer();
    model.textureBuffer = gl.createBuffer();
    model.indexBuffer = gl.createBuffer();
    model.count = modelData.indices.length;

    gl.bindBuffer(gl.ARRAY_BUFFER, model.coordsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, modelData.vertexPositions, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, model.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, modelData.vertexNormals, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, model.textureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, modelData.vertexTextureCoords, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, modelData.indices, gl.STATIC_DRAW);

    model.render = function () {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.coordsBuffer);
        gl.vertexAttribPointer(CoordsLoc, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.vertexAttribPointer(NormalLoc, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.textureBuffer);
        gl.vertexAttribPointer(TexCoordLoc, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        gl.uniformMatrix4fv(ModelviewLoc, false, flatten(modelview));           //--- load flattened modelview matrix
        gl.uniformMatrix3fv(NormalMatrixLoc, false, flatten(normalMatrix));     //--- load flattened normal matrix

        gl.drawElements(gl.TRIANGLES, this.count, gl.UNSIGNED_SHORT, 0);
    };

    return model;
}

function createModelmap(modelData) {
	var model = {};
	model.coordsBuffer = gl.createBuffer();
	model.normalBuffer = gl.createBuffer();
	model.indexBuffer = gl.createBuffer();
	model.count = modelData.indices.length;

	gl.bindBuffer(gl.ARRAY_BUFFER, model.coordsBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, modelData.vertexPositions, gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, model.normalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, modelData.vertexNormals, gl.STATIC_DRAW);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, modelData.indices, gl.STATIC_DRAW);

	model.render = function () {
		gl.bindBuffer(gl.ARRAY_BUFFER, this.coordsBuffer);
		gl.vertexAttribPointer(aCoordsmap, 3, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
		gl.vertexAttribPointer(aNormalmap, 3, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

		gl.uniformMatrix4fv(uModelviewmap, false, flatten(modelview));    //--- load flattened modelview matrix
		gl.uniformMatrix3fv(uNormalMatrixmap, false, flatten(normalMatrix));  //--- load flattened normal matrix

		gl.uniformMatrix3fv(uMinvmap, false, flatten(Minv));  // send matrix inverse of modelview in order to rotate the skybox

		gl.drawElements(gl.TRIANGLES, this.count, gl.UNSIGNED_SHORT, 0);
	};
	return model;
}

// For creating the environment box.
function createModelbox(modelData) {
	var model = {};
	model.coordsBuffer = gl.createBuffer();
	model.indexBuffer = gl.createBuffer();
	model.count = modelData.indices.length;
	gl.bindBuffer(gl.ARRAY_BUFFER, model.coordsBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, modelData.vertexPositions, gl.STATIC_DRAW);
	console.log(modelData.vertexPositions.length);
	console.log(modelData.indices.length);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, modelData.indices, gl.STATIC_DRAW);
	model.render = function () {
		gl.bindBuffer(gl.ARRAY_BUFFER, this.coordsBuffer);
		gl.vertexAttribPointer(aCoordsbox, 3, gl.FLOAT, false, 0, 0);
		gl.uniformMatrix4fv(uModelviewbox, false, flatten(modelview));
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

		gl.drawElements(gl.TRIANGLES, this.count, gl.UNSIGNED_SHORT, 0);
	};
	return model;
}

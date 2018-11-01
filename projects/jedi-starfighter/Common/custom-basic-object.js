//---------------------- PRIVATE ----------------------------//
// return normal vector from u and v
function calcNormal(u, v) {
    return normalize(cross(u,v), false);
}

// create a context object that contains elements for generating object
function initContext() { return {coords: [], normals: [], texCoords: [], indices: []} }

// use the context object created by initContext
function flatternContext(context) {
    return {
        vertexPositions: new Float32Array(context.coords),
        vertexNormals: new Float32Array(context.normals),
        vertexTextureCoords: new Float32Array(context.texCoords),
        indices: new Uint16Array(context.indices)
    }
}

// create triangle face
function face3(xyz, nrm, texture, context) {

    var start = context.coords.length / 3;
    var i;
    for (i = 0; i < 9; i++) {
        context.coords.push(xyz[i]);
    }
    for (i = 0; i < 3; i++) {
        context.normals.push(nrm[0], nrm[1], nrm[2]);
    }
    context.texCoords = context.texCoords.concat(texture);
    context.indices.push(start, start + 1, start + 2);
}

// create rectangle face
function face4(xyz, nrm, texture, context) {
    texture = texture || [0, 0, 1, 0, 1, 1, 0, 1];

    var start = context.coords.length / 3;
    var i;
    for (i = 0; i < 12; i++) {
        context.coords.push(xyz[i]);
    }
    for (i = 0; i < 4; i++) {
        context.normals.push(nrm[0], nrm[1], nrm[2]);
    }
    //context.texCoords.push(0, 0, 1, 0, 1, 1, 0, 1);
    context.texCoords = context.texCoords.concat(texture);
    context.indices.push(start, start + 1, start + 2, start, start + 2, start + 3);
}

// create pentagone face
function face5(xyz, nrm, texture, context) {
    textture = texture || [0, 0, 0, 1, 1, 0];
    var start = context.coords.length / 3;
    var i;
    for (i = 0; i < 15; i++) {
        context.coords.push(xyz[i]);
    }
    for (i = 0; i < 5; i++) {
        context.normals.push(nrm[0], nrm[1], nrm[2]);
    }

    context.texCoords = context.texCoords.concat(texture);
    context.indices.push(start, start + 1, start + 2, start, start + 2, start + 3, start, start + 3, start + 4);
}

//---------------------- PUBLIC ----------------------------//
/**
 * Create a model of a tetrahedron. The tetrahedron havs one face in plan (xz)
 * and a vertex in the positive y-axis. The center of the face (xz) will be
 * in the center O (O, O, O)
 * @param side: the length of a side of the tetrahedron. If not given, the value will be 1.
 */
function uvTetrahedron(side) {
    var s = side || 1;
    var coords = [];
    var normals = []
    var texCoords = [];
    var indices = [];

    function face(xyz, nrm) {
        var start = coords.length / 3;
        var i;
        for (i = 0; i < 9; i++) {
            coords.push(xyz[i]);
        }
        for (i = 0; i < 3; i++) {
            normals.push(nrm[0], nrm[1], nrm[2]);
        }
        texCoords.push(0, 0, .5, 1, 1, 0);
        indices.push(start, start + 1, start + 2);
    }

    var sq3 = Math.sqrt(3);
    var sq6 = Math.sqrt(6);

    face([-s / 2, 0, -sq3 * s / 6, s / 2, 0, -sq3 * s / 6, 0, 0, sq3 * s / 3], [0, -1, 0]);    //A C B
    face([0, 0, sq3 * s / 3, s / 2, 0, -s * sq3 / 6, 0, sq6 * s / 3, 0], [1, 1, 1]);   //B C D
    face([0, 0, sq3 * s / 3, 0, sq6 * s / 3, 0, -s / 2, 0, -sq3 * s / 6], [-1, 1, 1]);  //B D A
    face([s / 2, 0, -s * sq3 / 6, -s / 2, 0, -s * sq3 / 6, 0, sq6 * s / 3, 0], [0, 1, -1]);  //C A D

    return {
        vertexPositions: new Float32Array(coords),
        vertexNormals: new Float32Array(normals),
        vertexTextureCoords: new Float32Array(texCoords),
        indices: new Uint16Array(indices)
    }
}

/**
 * Create a model of a tetrahedron. The tetrahedron havs one face in plan (xz)
 * and a vertex in the positive y-axis. The center of the face (xz) will be
 * in the center O (O, O, O)
 * @param width
 * @param height
 * @param depth
 */
function uvSquareTetrahedron(width, height, depth) {
    var w = (width || 1) / 2;
    var h = height || 1;
    var d = depth || 1;

    var context = initContext();

    face3([-w, 0, 0, w, 0, 0, 0, 0, d], [0, -1, 0], [0, 0, 1, 0, 0, 1], context);                             // A B C
    face3([-w, 0, 0, 0, 0, d, 0, h, 0], calcNormal([-w, 0, -d], [-w, -h, 0]), [0, 0, 0, 1, 1, 0], context);   // A C D
    face3([0, 0, d, w, 0, 0, 0, h, 0], calcNormal([w, -h, 0], [w, 0, -d]), [0, 1, 0, 0, 1, 0], context);      // C B D
    face3([w, 0, 0, -w, 0, 0, 0, h, 0], [0, 0, -1], [0, 0, 1, 0, 0, 1], context);                             //B A D

    return flatternContext(context);
}

/**
 * Create a model of a prism that has the square pentagon in upper and down face.
 * The left side of the pentagon will be longer then the right side of pentagone.
 * So do the back side compare to the front side.
 * @param {boolean} hasBottom: if false, only draw the surrounding faces
 * @param backSide: the longer of the back side.
 * @param frontSide: the longer of the front side.
 * @param left: the left side
 * @param right: the right side
 * @param height
 */
function uvPentagonPrism(hasBottom, backSide, frontSide, left, right, height) {
    var s = frontSide || 0.5;
    var b = backSide || 1;
    var l = left || 1;
    var r = right || 0.5;
    var h = height || 1;

    var context = initContext();

    if(typeof hasBottom === undefined) hasBottom = false;

    face4([b, 0, 0,      0, 0, 0,    0, h, 0,    b, h, 0], [0,0,-1], null, context);    // back
    face4([0, 0, 0,      0, 0, l,    0, h, l,    0, h, 0], [-1,0,0], null, context);      // left
    face4([b, 0, 0,      b, 0, r,    b, h, r,    b, h, 0], [1,0,0], null, context);    // first right
    face4([b, 0, r,      s, 0, l,    s, h, l,    b, h, r], calcNormal([0,-1,0], [b-s, 0, r-l]), null, context);  // second right //TODO normal vector
    face4([0, 0, l,      s, 0, l,    s, h, l,    0, h, l], [0,0,1], null, context); // front

    if(hasBottom) {
        face5([0, 0, 0,      0, 0, l,    s, 0, l,    b, 0, r,    b, 0, 0], [0,-1,0], [0,0, 0,1, s/b,1, 1, r/l, 1, 0], context); // downner
        face5([0, h, 0,      0, h, l,    s, h, l,    b, h, r,    b, h, 0], [0,1,0], [0,0, 0,1, s/b,1, 1, r/l, 1, 0], context); // upper
    }

    return flatternContext(context);
}

/**
 *
 * @param hasBottom
 * @param {Object} upper : contains attribute {a, b, c}
 * @param {Object} downer : contains attribute {a, b, c}
 * @param height
 */
function uvTrapeziumPrism(hasBottom, upper, downer, height) {

    var context = initContext();

    // set default values
    var u = upper || {};
    var d = downer || {};
    var h = height || 1;
    d.a = (d.a || 0.8)/2; d.b = (d.b || 1)/2; d.c = d.c || 1;           // default downder
    u.a = (u.a || 0.4) / 2; u.b = (u.b || 0.5) / 2; u.c = u.c || 0.5;   // default upper

    // set faces

    face4([-d.b, 0, 0,       d.b, 0, 0,      u.b, 0, h,     -u.b, 0, h],     [0, -1, 0], null, context); // bottom face
    face4([-d.b, 0, 0,      -u.b, 0, h,     -u.a, u.c, h,   -d.a, d.c, 0],   calcNormal([-d.b+u.b, 0, -h], [-d.b+d.a, -d.c, 0]), null, context); // left face
    face4([d.b, 0, 0,        d.a, d.c, 0,    u.a, u.c, h,    u.b, 0, h],     calcNormal([d.b-d.a, -d.c, 0], [d.b-u.b, 0, -h]), null, context); // right face
    face4([d.a, d.c, 0,     -d.a, d.c, 0,   -u.a, u.c, h,    u.a, u.c, h],   calcNormal([1, 0, 0], [d.a-u.a, d.c-u.c, -h]), null, context); // top face

    if(hasBottom) {
        face4([-d.b, 0, 0,      -d.a, d.c, 0,      d.a, d.c, 0,      d.b, 0, 0],     [0, 0, -1], null, context); // downer
        face4([-u.b, 0, h,      -u.a, u.c, h,      u.a, u.c, h,      u.b, 0, h],     [0, 0, 1], null, context); // upper
    }

    return flatternContext(context);
}

function uvTrianglePrism(largeSide, smallSide, height, angle) {
    var a = (smallSide || 1) / 2;
    var b = largeSide || 5;
    var h = height || 5;

    var delta = (1 + 1/Math.tan(radians(angle))) * h;
    function face(xyz, nrm) {
        var start = coords.length / 3;
        var i;
        for (i = 0; i < 12; i++) {
            coords.push(xyz[i]);
        }
        for (i = 0; i < 4; i++) {
            normals.push(nrm[0], nrm[1], nrm[2]);
        }
        texCoords.push(0, 0, 1, 0, 1, 1, 0, 1);
        indices.push(start, start + 1, start + 2, start, start + 2, start + 3);
    }

    face([-a, h, 0,     a, h, 0,    a, 0, delta,     -a, 0, delta],         [0, 0, -1]); // back
    face([-a, h, b,    -a, h, 0,   -a, 0, delta,     -a, 0, delta + b],     [-1, 0, 0]); // left
    face([ a, h, 0,     a, h, b,    a, 0, delta+b,    a, 0, delta],         [1, 0, 0]); // right
    face([-a, h, 0,     a, h, 0,    a, 0, delta,     -a, 0, delta], [0, 0, 1]); // front
}

function uvCylinderInside(radius, height, slices, noTop, noBottom) {
    radius = radius || 0.5;
    height = height || 2 * radius;
    slices = slices || 32;
    var vertexCount = 2 * (slices + 1);
    if (!noTop)
        vertexCount += slices + 2;
    if (!noBottom)
        vertexCount += slices + 2;
    var triangleCount = 2 * slices;
    if (!noTop)
        triangleCount += slices;
    if (!noBottom)
        triangleCount += slices;
    var vertices = new Float32Array(vertexCount * 3);
    var normals = new Float32Array(vertexCount * 3);
    var texCoords = new Float32Array(vertexCount * 2);
    var indices = new Uint16Array(triangleCount * 3);
    var du = 2 * Math.PI / slices;
    var kv = 0;
    var kt = 0;
    var k = 0;
    var i, u;
    for (i = 0; i <= slices; i++) {
        u = i * du;
        var c = Math.cos(u);
        var s = Math.sin(u);
        vertices[kv] = c * radius;
        normals[kv++] = -c;
        vertices[kv] = s * radius;
        normals[kv++] = -s;
        vertices[kv] = -height / 2;
        normals[kv++] = 0;
        texCoords[kt++] = i / slices;
        texCoords[kt++] = 0;
        vertices[kv] = c * radius;
        normals[kv++] = -c;
        vertices[kv] = s * radius;
        normals[kv++] = -s;
        vertices[kv] = height / 2;
        normals[kv++] = 0;
        texCoords[kt++] = i / slices;
        texCoords[kt++] = 1;
    }
    for (i = 0; i < slices; i++) {
        indices[k++] = 2 * i;
        indices[k++] = 2 * i + 3;
        indices[k++] = 2 * i + 1;
        indices[k++] = 2 * i;
        indices[k++] = 2 * i + 2;
        indices[k++] = 2 * i + 3;
    }
    var startIndex = kv / 3;
    if (!noBottom) {
        vertices[kv] = 0;
        normals[kv++] = 0;
        vertices[kv] = 0;
        normals[kv++] = 0;
        vertices[kv] = -height / 2;
        normals[kv++] = 1;
        texCoords[kt++] = 0.5;
        texCoords[kt++] = 0.5;
        for (i = 0; i <= slices; i++) {
            u = 2 * Math.PI - i * du;
            var c = Math.cos(u);
            var s = Math.sin(u);
            vertices[kv] = c * radius;
            normals[kv++] = 0;
            vertices[kv] = s * radius;
            normals[kv++] = 0;
            vertices[kv] = -height / 2;
            normals[kv++] = 1;
            texCoords[kt++] = 0.5 - 0.5 * c;
            texCoords[kt++] = 0.5 + 0.5 * s;
        }
        for (i = 0; i < slices; i++) {
            indices[k++] = startIndex;
            indices[k++] = startIndex + i + 1;
            indices[k++] = startIndex + i + 2;
        }
    }
    var startIndex = kv / 3;
    if (!noTop) {
        vertices[kv] = 0;
        normals[kv++] = 0;
        vertices[kv] = 0;
        normals[kv++] = 0;
        vertices[kv] = height / 2;
        normals[kv++] = -1;
        texCoords[kt++] = 0.5;
        texCoords[kt++] = 0.5;
        for (i = 0; i <= slices; i++) {
            u = i * du;
            var c = Math.cos(u);
            var s = Math.sin(u);
            vertices[kv] = c * radius;
            normals[kv++] = 0;
            vertices[kv] = s * radius;
            normals[kv++] = 0;
            vertices[kv] = height / 2;
            normals[kv++] = -1;
            texCoords[kt++] = 0.5 + 0.5 * c;
            texCoords[kt++] = 0.5 + 0.5 * s;
        }
        for (i = 0; i < slices; i++) {
            indices[k++] = startIndex;
            indices[k++] = startIndex + i + 1;
            indices[k++] = startIndex + i + 2;
        }
    }
    return {
        vertexPositions: vertices,
        vertexNormals: normals,
        vertexTextureCoords: texCoords,
        indices: indices
    };
}

function uvHemiCone(radius, height, slices, noBottom) {
    radius = radius || 0.5;
    height = height || 2 * radius;
    slices = slices || 32;
    var fractions = [0, 0.5, 0.75, 0.875, 0.9375];
    var vertexCount = fractions.length * (slices + 1) + slices;
    if (!noBottom)
        vertexCount += slices + 2;
    var triangleCount = (fractions.length - 1) * slices * 2 + slices;
    if (!noBottom)
        triangleCount += slices;
    var vertices = new Float32Array(vertexCount * 3);
    var normals = new Float32Array(vertexCount * 3);
    var texCoords = new Float32Array(vertexCount * 2);
    var indices = new Uint16Array(triangleCount * 3);
    var normallength = Math.sqrt(height * height + radius * radius);
    var n1 = height / normallength;
    var n2 = radius / normallength;
    var du = 2 * Math.PI / slices;
    var kv = 0;
    var kt = 0;
    var k = 0;
    var i, j, u;
    for (j = 0; j < fractions.length; j++) {
        var uoffset = (j % 2 == 0 ? 0 : 0.5);
        // var uoffset = 0.5;
        for (i = 0; i <= slices; i++) {
            var h1 = -height / 2 + fractions[j] * height;
            u = (i + uoffset) * du;
            var c = Math.cos(u);
            var s = Math.sin(u);
            vertices[kv] = c * radius * (1 - fractions[j]);
            normals[kv++] = c * n1;
            vertices[kv] = s * radius * (1 - fractions[j]);
            normals[kv++] = s * n1;
            vertices[kv] = h1;
            normals[kv++] = n2;
            texCoords[kt++] = (i + uoffset) / slices;
            texCoords[kt++] = fractions[j];
        }
    }
    var k = 0;
    for (j = 0; j < fractions.length - 1; j++) {
        var row1 = j * (slices + 1);
        var row2 = (j + 1) * (slices + 1);
        for (i = 0; i < slices; i++) {
            indices[k++] = row1 + i;
            indices[k++] = row2 + i + 1;
            indices[k++] = row2 + i;
            indices[k++] = row1 + i;
            indices[k++] = row1 + i + 1;
            indices[k++] = row2 + i + 1;
        }
    }
    var start = kv / 3 - (slices + 1);
    for (i = 0; i < slices; i++) { // slices points at top, with different normals, texcoords
        u = (i + 0.5) * du;
        var c = Math.cos(u);
        var s = Math.sin(u);
        vertices[kv] = 0;
        normals[kv++] = c * n1;
        vertices[kv] = 0;
        normals[kv++] = s * n1;
        vertices[kv] = height / 2;
        normals[kv++] = n2;
        texCoords[kt++] = (i + 0.5) / slices;
        texCoords[kt++] = 1;
    }
    for (i = 0; i < slices; i++) {
        indices[k++] = start + i;
        indices[k++] = start + i + 1;
        indices[k++] = start + (slices + 1) + i;
    }
    if (!noBottom) {
        var startIndex = kv / 3;
        vertices[kv] = 0;
        normals[kv++] = 0;
        vertices[kv] = 0;
        normals[kv++] = 0;
        vertices[kv] = -height / 2;
        normals[kv++] = -1;
        texCoords[kt++] = 0.5;
        texCoords[kt++] = 0.5;
        for (i = 0; i <= slices; i++) {
            u = 2 * Math.PI - i * du;
            var c = Math.cos(u);
            var s = Math.sin(u);
            vertices[kv] = c * radius;
            normals[kv++] = 0;
            vertices[kv] = s * radius;
            normals[kv++] = 0;
            vertices[kv] = -height / 2;
            normals[kv++] = -1;
            texCoords[kt++] = 0.5 - 0.5 * c;
            texCoords[kt++] = 0.5 + 0.5 * s;
        }
        for (i = 0; i < slices; i++) {
            indices[k++] = startIndex;
            indices[k++] = startIndex + i + 1;
            indices[k++] = startIndex + i + 2;
        }
    }
    return {
        vertexPositions: vertices,
        vertexNormals: normals,
        vertexTextureCoords: texCoords,
        indices: indices
    };
}

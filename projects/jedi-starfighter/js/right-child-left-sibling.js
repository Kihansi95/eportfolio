


// convention: _private and public
function right_child_left_sibling(definition) {

    // enum id for each elements
    this._definition = definition;

    this.initNodes = function(figure, id){throw "Not implemented"};

    // structure
    this._figure= [];
    for (var i = 0; i < Object.keys(this._definition).length; i++) this._figure[i] = createNode(null, null, null, null);

    this.build = function() {
        for (i = 0; i < Object.keys(this._definition).length; i++) this.initNodes(this._figure, i);
    };

    this.getFigure= function() {
        return this._figure;
    };
};

var stack = [];
function traverse(structure, id) {
    if(id == null) return;
    stack.push(modelview);
    var figure = structure.getFigure();
    modelview = mult(modelview, figure[id].transform);
    figure[id].render();
    if(figure[id].child != null) this.traverse(structure, figure[id].child);
    modelview = stack.pop();
    if(figure[id].sibling != null) this.traverse(structure, figure[id].sibling);
}

function createNode(transform, render, sibling, child) {
    var node = {
        transform: transform,
        render: render,
        sibling: sibling,
        child: child
    };
    return node;
}

//-------------------------------------------

function scale4(a, b, c) {
    var result = mat4();
    result[0][0] = a;
    result[1][1] = b;
    result[2][2] = c;
    return result;
}

//--------------------------------------------

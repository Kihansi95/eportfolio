function shear(angle) {

    angle = angle || 45;

    var result = mat4();

    result[0][1] =  1/Math.tan(radians(angle));

    return result;
}
"use strict";

var canvas;
var gl;
var program;

// rows and columns 
var nRows = 20;
var nColumns = 20;

// point array and normal array
var pointsArray = [];
var normalsArray = [];

// eye position 
var radius = 2;
var theta  = 0.3;
var phi    = 0.0;

// ortho projection 
var near = -10;
var far = 10;
var left = -1.5;
var right = 1.5;
var ytop = 1.5;
var bottom = -1.5;

// model-view
var eye, eyeLoc;
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

// connect to html
var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var normalMatrix, normalMatrixLoc;
var ambientProduct, diffuseProduct, specularProduct;

// basic colors
const black = vec4(0.0, 0.0, 0.0, 1.0);
const red = vec4(1.0, 0.0, 0.0, 1.0);
const blue = vec4(0.0,0.0,1.0,1.0);
const green = vec4(0.0,0.5,0.0,1.0);
const magenta = vec4(1.0, 0.0, 1.0, 1.0);
const yellow = vec4(1.0, 1.0, 0.0, 1.0);
const orange = vec4(1.0,165/255,0.0,1.0);
const white = vec4(1.0, 1.0, 1.0, 1.0);
const gray = vec4(0.2, 0.2, 0.2, 1.0 );

// light and material
var lightPosition = vec4(2.0, 2.0, 2.0, 1.0 );

var lightAmbient = gray;
var lightDiffuse = orange;
var lightSpecular = white;

var materialAmbient = white;
var materialDiffuse =  white;
var materialSpecular = white;

var materialShininess = 50.0;

var lightModel = 0, lightModelLoc;

// default choices
var shading = "Gouraud";
var shape = "sphere"

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    // enable depth testing and polygon offset
    // so lines will be in front of filled triangles

    gl.enable(gl.DEPTH_TEST);

    // add positions
    addpoints(shape);

    // Load shaders and initialize attribute buffers
    if (shading == "Gouraud")
        program = initShaders( gl, "Gouraud-vertex-shader", "Gouraud-fragment-shader" );
    else if (shading == "Phong")
        program = initShaders( gl, "Phong-vertex-shader", "Phong-fragment-shader" );
    gl.useProgram( program );

    // set lights
    set_light();

    // push point array and color array in buffers
    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );

    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    normalMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );
    eyeLoc = gl.getUniformLocation( program, "eye" );

    // menus
    var menu_shading = document.getElementById("menu_shading");
    menu_shading.addEventListener("change", function(){
        switch (menu_shading.selectedIndex){
            case 0:
                shading = "Gouraud";
                init();
                break;
            case 1:
                shading = "Phong"
                init();
                break;
        }
    })

    // shapes
    var menu_shape = document.getElementById("menu_shape");
    menu_shape.addEventListener("change", function(){
        switch (menu_shape.selectedIndex){
            case 0:
                shape = "sphere";
                init();
                break;
            case 1:
                shape = "torus"
                init();
                break;
        }
    })

    // light model
    // add code here to receive the value of light model from the menu
    var menu_light = document.getElementById("menu_light");
    menu_light.addEventListener("change", function(){
        switch (menu_light.selectedIndex){
            case 0:
                lightModel = 0;
                break;
            case 1:
                lightModel = 1;
                break;
            case 2:
                lightModel = 2;
                break;
            case 3:
                lightModel = 3;
                break;
        }
        // ?
        gl.uniform1i(lightModelLoc, lightModel);
        set_light();
    })

    // ambient color
    var menu_ambient = document.getElementById("menu_ambient");
    menu_ambient.addEventListener("change", function(){
        switch (menu_ambient.selectedIndex){
            case 0:
                lightAmbient = gray;
                set_light();
                break;
            case 1:
                lightAmbient = black;
                set_light();
                break;
            case 2:
                lightAmbient = red;
                set_light();
                break;
            case 3:
                lightAmbient = blue;
                set_light();
                break;
        }
    })

    // diffuse color
    // add code here to set the diffuse color
    var menu_diffuse = document.getElementById("menu_diffuse");
    menu_diffuse.addEventListener("change", function(){
        switch (menu_diffuse.selectedIndex){
            case 0:
                lightDiffuse = orange;
                set_light();
                break;
            case 1:
                lightDiffuse = green;
                set_light();
                break;
            case 2:
                lightDiffuse = magenta;
                set_light();
                break;
            case 3:
                lightDiffuse = yellow;
                set_light();
                break;
        }
    })

    // specular color
    // add code here to set the specular color
    var menu_specular = document.getElementById("menu_specular");
    menu_specular.addEventListener("change", function(){
        switch (menu_specular.selectedIndex){
            case 0:
                lightSpecular = white;
                set_light();
                break;
            case 1:
                lightSpecular = red;
                set_light();
                break;
            case 2:
                lightSpecular = blue;
                set_light();
                break;
            case 3:
                lightSpecular = green;
                set_light();
                break;
        }
    })

    render();
}

function addpoints(shape) {
    pointsArray = [];
    normalsArray = [];
    var theta_data1, theta_data2, phi_data1, phi_data2;
    var r_data = 1.0;

    // sphere
    if(shape == "sphere"){
        // add code here to push positions and normals of vertices to pointArray and normalsArray
        for (var i = 0; i < nRows; ++i) {
            for (var j = 0; j < nColumns; ++j) {
                theta_data1 = Math.PI * (i/(nRows-1) - 0.5);
                phi_data1 = 2 * Math.PI * (j/(nColumns-1));
                theta_data2 = Math.PI * ((i+1)/(nRows-1) - 0.5);
                phi_data2 = 2 * Math.PI * ((j+1)/(nColumns-1));
    
                var p1, p2, p3, p4;
                p1 = get_xyz_sphere(r_data, theta_data1, phi_data1);
                p2 = get_xyz_sphere(r_data, theta_data2, phi_data1);
                p3 = get_xyz_sphere(r_data, theta_data2, phi_data2);
                p4 = get_xyz_sphere(r_data, theta_data1, phi_data2);

                // grid
                pointsArray.push(p1);
                pointsArray.push(p2);
                pointsArray.push(p3);

                pointsArray.push(p1);
                pointsArray.push(p3);
                pointsArray.push(p4);

                normalsArray.push(p1[0],p1[1], p1[2], 0.0);
                normalsArray.push(p2[0],p2[1], p2[2], 0.0);
                normalsArray.push(p3[0],p3[1], p3[2], 0.0);

                normalsArray.push(p1[0],p1[1], p1[2], 0.0);
                normalsArray.push(p3[0],p3[1], p3[2], 0.0);
                normalsArray.push(p4[0],p4[1], p4[2], 0.0);
            }
        }

    }
    // torus
    else if(shape == "torus"){
        // add code here to push positions and normals of vertices to pointArray and normalsArray
        for (var i = 0; i < nRows; ++i) {
            for (var j = 0; j < nColumns; ++j) {
                theta_data1 = 2 * Math.PI * (i/(nRows-1) - 0.5);
                phi_data1 = 2 * Math.PI * (j/(nColumns-1));
                theta_data2 = 2 * Math.PI * ((i+1)/(nRows-1) - 0.5);
                phi_data2 = 2 * Math.PI * ((j+1)/(nColumns-1));
    
                var p1, p2, p3, p4;
                p1 = get_xyz_torus(r_data, 0.2, theta_data1, phi_data1);
                p2 = get_xyz_torus(r_data, 0.2, theta_data2, phi_data1);
                p3 = get_xyz_torus(r_data, 0.2, theta_data2, phi_data2);
                p4 = get_xyz_torus(r_data, 0.2, theta_data1, phi_data2);

                pointsArray.push(p1);
                pointsArray.push(p2);
                pointsArray.push(p3);

                pointsArray.push(p1);
                pointsArray.push(p3);
                pointsArray.push(p4);

                normalsArray.push(get_torus_normal(theta_data1, phi_data1))
                normalsArray.push(get_torus_normal(theta_data2, phi_data1))
                normalsArray.push(get_torus_normal(theta_data2, phi_data2))

                normalsArray.push(get_torus_normal(theta_data1, phi_data1))
                normalsArray.push(get_torus_normal(theta_data2, phi_data2))
                normalsArray.push(get_torus_normal(theta_data1, phi_data2))
            }
        }

    }
}

// sphere
function get_xyz_sphere(r, theta, phi){
    // add code here to return coordinates for sphere
    return vec4(
        r * Math.cos(theta) * Math.sin(phi),
        r * Math.sin(theta),
        r * Math.cos(theta) * Math.cos(phi),
        1.0
    );
}

// torus
function get_xyz_torus(R, r, theta, phi){
    // add code here to return coordinates for torus
    return vec4(
        ((R + r * Math.cos(theta)) * Math.sin(phi)),
        (r * Math.sin(theta)),
        ((R + r * Math.cos(theta)) * Math.cos(phi)),
        1.0
    );
}

// normal of torus
// http://web.cs.ucdavis.edu/~amenta/s12/findnorm.pdf
function get_torus_normal(theta, phi){
    /* tangent vector with respect to big circle */
    var tx = -Math.sin(phi);
    var ty = Math.cos(phi);
    var tz = 0;
    /* tangent vector with respect to little circle */
    var sx = Math.cos(phi)*(-Math.sin(theta));
    var sy = Math.sin(phi)*(-Math.sin(theta));
    var sz = Math.cos(theta);
    /* normal is cross-product of tangents */
    var nx = ty*sz - tz*sy;
    var ny = tz*sx - tx*sz;
    var nz = tx*sy - ty*sx;

    return vec4(nx,ny,nz,0.0);
}

// set light
function set_light(){

    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);
    
    // connect
    gl.uniform4fv( gl.getUniformLocation(program,
        "ambientProduct"),flatten(ambientProduct) );
     gl.uniform4fv( gl.getUniformLocation(program,
        "diffuseProduct"),flatten(diffuseProduct) );
     gl.uniform4fv( gl.getUniformLocation(program,
        "specularProduct"),flatten(specularProduct) );
     gl.uniform4fv( gl.getUniformLocation(program,
        "lightPosition"),flatten(lightPosition) );
     gl.uniform1f( gl.getUniformLocation(program,
        "shininess"),materialShininess );
}

var render = function() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    eye = vec3(radius*Math.cos(theta)*Math.sin(phi),
        radius*Math.sin(theta), radius*Math.cos(theta)*Math.cos(phi));

    modelViewMatrix = lookAt(eye, at , up);

    projectionMatrix = ortho(left, right, bottom, ytop, near, far);

    normalMatrix = [
        vec3(modelViewMatrix[0][0], modelViewMatrix[0][1], modelViewMatrix[0][2]),
        vec3(modelViewMatrix[1][0], modelViewMatrix[1][1], modelViewMatrix[1][2]),
        vec3(modelViewMatrix[2][0], modelViewMatrix[2][1], modelViewMatrix[2][2])
    ];

    gl.uniform3fv(eyeLoc, flatten(eye) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
    gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix) );
    
    for( var i=0; i<pointsArray.length; i+=3)
        gl.drawArrays( gl.TRIANGLES, i, 3 );

    requestAnimFrame(render);
}

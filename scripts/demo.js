// import libraries

import * as THREE from "../build/three.module.js";

import { OrbitControls } from "../examples/jsm/controls/OrbitControls.js";
import { TransformControls } from "../examples/jsm/controls/TransformControls.js";

import { Rhino3dmLoader } from "../examples/jsm/loaders/3DMLoader.js";

import Stats from "../examples/jsm/libs/stats.module.js";

import { GUI } from "../examples/jsm/libs/dat.gui.module.js";

import { OBJLoader } from "../examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "../examples/jsm/loaders/MTLLoader.js";

// init variables
let cameraPersp, cameraOrtho, currentCamera;
let scene, renderer;
let control, orbit, stats;
let gui;
let terra, simplified, result_01, result_02, result_03;
var results = [];

var lowEnd = 1;
var highEnd = 12;
var months = [];
while (lowEnd <= highEnd) {
  months.push(lowEnd++);
}
let initMonthIdx = 0;
let currentMonth = months[initMonthIdx];

// let raycaster;
// let context_mesh;
// let INTERSECTED;
// const mouse = new THREE.Vector2();

const effectController = {
  showTerra: false,
  showSimplified: false,
  showResult: false,
  // showLines: true,
  // minDistance: 150,
  // limitConnections: false,
  // maxConnections: 20,
  // particleCount: 500,
};

// init & render
init();
animate();

// functions
function init() {
  // add raycaster
  // raycaster = new THREE.Raycaster();

  // create renderer
  renderer = new THREE.WebGLRenderer({ antialiasing: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  // renderer.physicallyCorrectLights = true;
  document.body.appendChild(renderer.domElement);

  // create camera
  const aspect = window.innerWidth / window.innerHeight;

  cameraPersp = new THREE.PerspectiveCamera(50, aspect, 0.01, 30000);
  cameraOrtho = new THREE.OrthographicCamera(
    -600 * aspect,
    600 * aspect,
    600,
    -600,
    0.01,
    30000
  );
  currentCamera = cameraPersp;

  currentCamera.position.set(0, 200, 200);
  currentCamera.lookAt(0, 0, 0);

  // create scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xa1a1a1);

  // add grid and axes helper
  // const gridHelper = new THREE.GridHelper( 200, 20, 0x888888, 0x444444 );
  // gridHelper.position.y = -27.648109;
  // scene.add( gridHelper );

  const axesHelper = new THREE.AxesHelper(20);
  axesHelper.position.x = -110;
  axesHelper.position.y = -27.648109;
  axesHelper.position.z = -110;
  scene.add(axesHelper);

  // add light
  // directional light
  const light1 = new THREE.DirectionalLight(0xffffff, 0.8);
  light1.position.set(-10000, 10000, 10000);
  scene.add(light1);

  const light2 = new THREE.DirectionalLight(0xffffff, 0.6);
  light1.position.set(10000, -10000, -10000);
  scene.add(light2);

  // ambient light
  scene.add(new THREE.AmbientLight(0xffffff, 0.7));

  // hemisphere light
  // var hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
  // hemiLight.position.set( 0, 1000, 0 );
  // scene.add( hemiLight );

  // create mesh mat
  var meshMaterial_b = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    opacity: 0.5,
    transparent: true,
    wireframe: false,
  });

  const meshMaterial_c = new THREE.MeshLambertMaterial({
    color: 0x0e0e0e,
    opacity: 1.0,
    transparent: false,
    wireframe: false,
  });

  const meshMaterial_pv = new THREE.MeshLambertMaterial({
    color: 0x0000ff,
    opacity: 1.0,
    transparent: false,
    wireframe: false,
  });

  const meshMaterial_sun = new THREE.MeshLambertMaterial({
    color: 0xffff00,
    opacity: 1.0,
    transparent: false,
    wireframe: false,
  });

  const line_mat = new THREE.LineBasicMaterial({
    color: 0x090909,
    linewidth: 10,
    // linecap: 'round', //ignored by WebGLRenderer
    // linejoin:  'round' //ignored by WebGLRenderer
  });

  // ---- orbit control
  orbit = new OrbitControls(currentCamera, renderer.domElement);
  orbit.update();
  orbit.addEventListener("change", render);

  control = new TransformControls(currentCamera, renderer.domElement);
  control.addEventListener("change", render);
  control.addEventListener("dragging-changed", function (event) {
    orbit.enabled = !event.value;
  });

  // add mesh
  // const mesh = new THREE.Mesh( geometry, material );
  // const mesh = new THREE.Mesh( geometry, meshMaterial ); // add mesh mat
  // scene.add( mesh );

  // init 3dm loader
  const loader = new Rhino3dmLoader();
  loader.setLibraryPath("../examples/jsm/libs/rhino3dm/");

  // ---- test loading 3dm files

  // loader.load('./models/building.3dm',
  //             function ( object ) {
  //                 object.traverse (
  //                     function( child ) {
  //                         if ( child instanceof THREE.Mesh ) {
  //                             child.material = meshMaterial_b;
  //                         }
  //                     }
  //                 );
  //                 scene.add( object );
  //                 // control.attach( object );
  //                 // scene.add( control );
  //             } );

  // loader.load('./models/context.3dm',
  //             function ( object ) {
  //                 object.traverse (
  //                     function( child ) {
  //                         if ( child instanceof THREE.Mesh ) {
  //                             child.material = meshMaterial_c;
  //                         }
  //                     }
  //                 );
  //                 scene.add( object );
  //             } );

  // // test
  // loader.load('./models/context.3dm',
  //             function ( object ) {
  //                 object.traverse (
  //                     function( child ) {
  //                         if ( child instanceof THREE.Mesh ) {
  //                             context_mesh = new THREE.Mesh(child.geometry, meshMaterial_c);
  //                             // child.material = meshMaterial_c;
  //                         }
  //                     } );
  //                 // scene.add( object );
  //                 scene.add( context_mesh );
  //             } );

  // loader.load('./models/pv.3dm',
  //             function ( object ) {
  //                 object.traverse (
  //                     function( child ) {
  //                         if ( child instanceof THREE.Mesh ) {
  //                             child.material = meshMaterial_pv; }
  //                 } );
  //                 scene.add( object );
  //             });

  // loader.load('./models/result.3dm',
  // 			function ( object ) {
  //                 object.traverse (
  //                     function( child ) {
  //                         if ( child instanceof THREE.Mesh ) {
  //                             child.material = meshMaterial;
  //                         }
  //                     }
  //                 );
  //                 scene.add( object );
  //             }
  // );

  // loader.load('./models/sunpath.3dm',
  //         function ( object ) {
  //             object.traverse (
  //                 function( child ) {
  //                     if ( child instanceof THREE.Line ) {
  //                         child.material = line_mat; }
  //             } );
  //             scene.add( object );
  //         });

  // loader.load('./models/terra.3dm',
  //         function ( object ) {
  //             object.traverse (
  //                 function( child ) {
  //                     if ( child instanceof THREE.Mesh ) {
  //                         child.material = meshMaterial_b; }
  //             } );
  //             scene.add( object );
  //         });

  //load terra model

  loader.load(
    "../examples/models/3dm/terra_3dm/terra_simplified.3dm",
    function (object) {
      object.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
          child.material = meshMaterial_b;
        }
      });
      simplified = object;
      simplified.visible = false;
      scene.add(simplified);
      console.log("...simplified building added");
    }
  );

  // loader.load('./models/terra_pv.3dm',
  //             function ( object ) {
  //                 object.traverse (
  //                     function( child ) {
  //                         if ( child instanceof THREE.Mesh ) {
  //                             child.geometry.translate(0, 0.1, 0);
  //                             child.material = meshMaterial_pv;
  //                         }
  //                     }
  //                 );
  //                 scene.add( object );
  //             } );

  // load sun path
  loader.load(
    "../examples/models/3dm/terra_3dm/terra_sunpath.3dm",
    function (object) {
      object.traverse(function (child) {
        if (child instanceof THREE.Line) {
          child.material = line_mat;
        }
      });
      scene.add(object);
      console.log("...sunpath loaded");
    }
  );

  loader.load(
    "../examples/models/3dm/terra_3dm/terra_num.3dm",
    function (object) {
      object.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
          child.material = meshMaterial_c;
          child.material.side = THREE.DoubleSide;
        }
      });
      scene.add(object);
      console.log("...numbers added");
    }
  );

  // load results
  for (var i = 1; i <= 12; i++) {
    loader.load(
      "../examples/models/3dm/terra_3dm/terra_sunhour_" + i.toString() + ".3dm",
      function (object) {
        object.traverse(function (child) {
          if (child instanceof THREE.Mesh) {
            child.geometry.translate(0, 0.3, 0);
          }
        });
        var result_i = object;
        result_i.visible = false;
        scene.add(result_i);
        results.push(result_i);
      }
    );
    console.log("...result", i, "is loaded");
  }

  // loader.load(
  //     './models/terra_sunhour_01.3dm',
  //     function ( object ) {
  //         object.traverse (
  //             function( child ) {
  //                 if ( child instanceof THREE.Mesh ) {
  //                     child.geometry.translate(0, 0.1, 0);
  //                 }
  //             }
  //         );
  //         result_01 = object;
  //         result_01.visible = false;
  //         scene.add( result_01 );
  //         results.push( result_01 );
  //         console.log('...result_01 loaded');
  //     }
  // );

  // loader.load(
  //     './models/terra_sunhour_02.3dm',
  //     function ( object ) {
  //         object.traverse (
  //             function( child ) {
  //                 if ( child instanceof THREE.Mesh ) {
  //                     child.geometry.translate(0, 0.1, 0);
  //                 }
  //             }
  //         );
  //         result_02 = object;
  //         result_02.visible = false;
  //         scene.add( result_02 );
  //         results.push( result_02 );
  //         console.log('...result_02 loaded');
  //     }
  // );

  // loader.load(
  //     './models/terra_sunhour_03.3dm',
  //     function ( object ) {
  //         object.traverse (
  //             function( child ) {
  //                 if ( child instanceof THREE.Mesh ) {
  //                     child.geometry.translate(0, 0.1, 0);
  //                 }
  //             }
  //         );
  //         result_03 = object;
  //         result_03.visible = false;
  //         scene.add( result_03 );
  //         results.push( result_03 );
  //         console.log('...result_03 loaded');
  //     }
  // );

  // load sun geometry
  // loader.load(
  //     './models/terra_sun_01.3dm',
  //     function ( object ) {
  //         object.traverse (
  //             function( child ) {
  //                 if ( child instanceof THREE.Mesh ) {
  //                     child.material = meshMaterial_sun;
  //                     // child.material.side = THREE.DoubleSide;
  //                 }
  //         } );
  //         scene.add( object );
  //         console.log('...suns added');
  //     }
  // );

  // loader.load(
  //     './models/terra_sun_03.3dm',
  //     function ( object ) {
  //         object.traverse (
  //             function( child ) {
  //                 if ( child instanceof THREE.Mesh ) {
  //                     child.material = meshMaterial_sun;
  //                     // child.material.side = THREE.DoubleSide;
  //                 }
  //         } );
  //         scene.add( object );
  //         console.log('...suns added');
  //     }
  // );

  // load obj file
  const objName = "terra";

  new MTLLoader()
    .setPath("../examples/models/obj/terra_obj/")
    .load("texture.mtl", function (materials) {
      materials.preload();
      new OBJLoader()
        .setMaterials(materials)
        .setPath("../examples/models/obj/terra_obj/")
        .load("texture.obj", function (object) {
          object.rotateX(-0.5 * Math.PI);
          terra = object;
          scene.add(terra);
          terra.visible = false;
          console.log("...terra obj loaded");
        });
    });

  // init stats
  stats = new Stats();
  document.body.appendChild(stats.dom);

  // init gui
  initGUI(meshMaterial_b);

  // add event listener
  window.addEventListener("resize", onWindowResize, false);

  window.addEventListener("keydown", function (event) {
    switch (event.keyCode) {
      case 81: // Q
        control.setSpace(control.space === "local" ? "world" : "local");
        break;

      case 16: // Shift
        control.setTranslationSnap(100);
        control.setRotationSnap(THREE.MathUtils.degToRad(15));
        control.setScaleSnap(0.25);
        break;

      case 87: // W
        control.setMode("translate");
        break;

      case 69: // E
        control.setMode("rotate");
        break;

      case 82: // R
        control.setMode("scale");
        break;

      case 67: // C
        const position = currentCamera.position.clone();

        currentCamera = currentCamera.isPerspectiveCamera
          ? cameraOrtho
          : cameraPersp;
        currentCamera.position.copy(position);

        orbit.object = currentCamera;
        control.camera = currentCamera;

        currentCamera.lookAt(orbit.target.x, orbit.target.y, orbit.target.z);
        onWindowResize();
        break;

      case 86: // V
        const randomFoV = Math.random() + 0.1;
        const randomZoom = Math.random() + 0.1;

        cameraPersp.fov = randomFoV * 160;
        cameraOrtho.bottom = -randomFoV * 500;
        cameraOrtho.top = randomFoV * 500;

        cameraPersp.zoom = randomZoom * 5;
        cameraOrtho.zoom = randomZoom * 5;
        onWindowResize();
        break;

      case 187:
      case 107: // +, =, num+
        control.setSize(control.size + 0.1);
        break;

      case 189:
      case 109: // -, _, num-
        control.setSize(Math.max(control.size - 0.1, 0.1));
        break;

      case 88: // X
        control.showX = !control.showX;
        break;

      case 89: // Y
        control.showY = !control.showY;
        break;

      case 90: // Z
        control.showZ = !control.showZ;
        break;

      case 32: // Spacebar
        control.enabled = !control.enabled;
        break;
    }
  });

  window.addEventListener("keyup", function (event) {
    switch (event.keyCode) {
      case 16: // Shift
        control.setTranslationSnap(null);
        control.setRotationSnap(null);
        control.setScaleSnap(null);
        break;
    }
  });

  // document.addEventListener( 'mousemove', onDocumentMouseMove, false );
}

function onWindowResize() {
  const aspect = window.innerWidth / window.innerHeight;

  cameraPersp.aspect = aspect;
  cameraPersp.updateProjectionMatrix();

  cameraOrtho.left = cameraOrtho.bottom * aspect;
  cameraOrtho.right = cameraOrtho.top * aspect;
  cameraOrtho.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  render();
}

function initGUI(meshMaterial_b) {
  gui = new GUI({ width: 300 });
  const buildingFolder = gui.addFolder("Building");
  buildingFolder.add(effectController, "showTerra").onChange(function (value) {
    terra.visible = value;
  });
  buildingFolder
    .add(effectController, "showSimplified")
    .onChange(function (value) {
      simplified.visible = value;
    });
  buildingFolder.add(meshMaterial_b, "opacity", 0, 1.0);
  buildingFolder.add(meshMaterial_b, "wireframe");
  buildingFolder.open();

  const resultFolder = gui.addFolder("Result");

  resultFolder.add(effectController, "showResult").onChange(function (value) {
    // results[ currentMonth - 1 ].visible = value;

    results.forEach(function (item, index) {
      if (index == currentMonth - 1) {
        item.visible = value;
      } else {
        item.visible = false;
      }
    });

    // if ( value ) {  control.attach( result ); scene.add(control); }
    // else { control.detach(); };
  });

  resultFolder
    .add(months, months[0], 1, 12, 1)
    .name("month")
    .onChange(function (value) {
      // results[currentMonth].visible = false;
      currentMonth = value;
      console.log("current month:", value);

      results.forEach(function (item, index) {
        if (index == value - 1 && effectController.showResult == true) {
          item.visible = true;
        } else {
          item.visible = false;
        }
      });

      // for ( i=0; i< 2; i++ ) {
      //     if ( i == currentMonth ) {
      //          results[i].visible = true;
      //     } else { results[i].visible = false;
      //     }
      // }
    });

  resultFolder.open();
}

function animate() {
  requestAnimationFrame(animate);
  render();
  stats.update();
}

function render() {
  // // find intersectoin
  // currentCamera.updateMatrixWorld();

  // raycaster.setFromCamera( mouse, currentCamera );

  // const intersects = raycaster.intersectObjects( scene.children );

  // if ( intersects.length > 0 ) {

  //     // if ( INTERSECTED != intersects[ 0 ].object ) {

  //     //     if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

  //     //     INTERSECTED = intersects[ 0 ].object;
  //     //     INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
  //     //     INTERSECTED.material.emissive.setHex( 0xff0000 );

  //     // }

  //     intersects[ 0 ].object.material.color.set( 0xff0000 );

  // } else {

  //     // if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

  //     INTERSECTED = null;

  // }

  renderer.render(scene, currentCamera);
}

// function onDocumentMouseMove( event ) {
//     event.preventDefault();
//     mouse.x =   ( event.clientX / window.innerWidth  ) * 2 - 1;
//     mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
// }

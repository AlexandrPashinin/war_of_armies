
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import scene from './components/scene.js';

const sceneComponent = new scene();

const loader = new GLTFLoader()
loader.load(
  '/modal/duck.gltf',
  (gltf) => {
    console.log('success');
    console.log(gltf);
    sceneComponent.scene.add(gltf.scene);
    sceneComponent.render();
  },
  function ( xhr ) {
    console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
  },
  function ( error ) {
    console.log( 'An error happened' );
  }
);

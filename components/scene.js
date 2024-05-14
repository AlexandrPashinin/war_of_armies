import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createArmies } from './UnitLogic.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';

export default function Scene() {
  let camera, scene, renderer, controls;
  const stats = new Stats();
  document.body.appendChild(stats.dom);
  init();

  function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x999999);

    const light = new THREE.DirectionalLight(0xffffff, 3);
    light.position.set(0.5, 1.0, 0.5).normalize();
    scene.add(light);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 500);
    camera.position.y = 5;
    camera.position.z = 10;
    scene.add(camera);

    const grid = new THREE.GridHelper(50, 50, 0xffffff, 0x7b7b7b);
    scene.add(grid);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.addEventListener('change', render);
    controls.update();

    window.addEventListener('resize', onWindowResize);

    render();
    tick();
  }
  function tick() {
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
    createArmies(scene);
    stats.update();
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
  }

  function render() {
    renderer.render(scene, camera);

  }
}

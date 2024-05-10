import * as THREE from 'three';

export function createArmies(scene) {
  let army1 = [];
  let army2 = [];
  
  const spacing = 12;
  const fieldSize = 45;
  
  // create armies 1
  for (let i = 0; i < 2; i++) {
    const squareGeometry = new THREE.BoxGeometry(1, 1, 1);
    const squareMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const square = new THREE.Mesh(squareGeometry, squareMaterial);
    square.position.set(-(Math.random() * (fieldSize / 2 - 1)), 0, (Math.random() * fieldSize) - fieldSize / 2);
    army1.push(square);
    scene.add(square);
  }
  
  // create armies 2
  for (let i = 0; i < 2; i++) {
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set((Math.random() * (fieldSize / 2 - 1)), 0, (Math.random() * fieldSize) - fieldSize / 2);
    army2.push(cube);
    scene.add(cube);
  }
  
  // update box
  function update() {
    army1.forEach(cube1 => {
      cube1.position.z += 0.1;
      if (cube1.position.z > fieldSize / 2 || cube1.position.z < -fieldSize / 2) {
        cube1.position.z = Math.sign(cube1.position.z) * (fieldSize / 2);
      }
    });
    
    army2.forEach(cube2 => {
      cube2.position.z -= 0.1;
      if (cube2.position.z > fieldSize / 2 || cube2.position.z < -fieldSize / 2) {
        cube2.position.z = Math.sign(cube2.position.z) * (fieldSize / 2);
      }
    });
    
    requestAnimationFrame(update);
  }
  
 
  update();
}

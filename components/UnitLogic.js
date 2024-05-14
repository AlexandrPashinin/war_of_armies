import * as THREE from 'three';
import { maxUnitsPerArmy, fieldSize,countArmy} from '/characteristics/army.js';
import {speed,unitRadius,initialHealth,attackDamage ,attackCooldown,radiusAttack} from '/characteristics/unit.js';
let army1 = [];
let army2 = [];
let scene
export function createArmies(sceneRef) {
  scene = sceneRef

  // create army 1
  while (army1.length < maxUnitsPerArmy && army1.length < countArmy) {
    const squareGeometry = new THREE.BoxGeometry(1, 1, 1);
    const squareMaterial = new THREE.MeshBasicMaterial({ color: 'red' });
    const square = new THREE.Mesh(squareGeometry, squareMaterial);
    square.position.set(-(Math.random() * (fieldSize / 2 - 1)), 0, (Math.random() * fieldSize) - fieldSize / 2);
    army1.push({ cube: square, moving: true, health: initialHealth, attackCooldownTimer: attackCooldown });
    scene.add(square);
  }

  // create army 2
  while (army2.length < maxUnitsPerArmy && army2.length < countArmy) {
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set((Math.random() * (fieldSize / 2 - 1)), 0, (Math.random() * fieldSize) - fieldSize / 2);
    army2.push({ cube: cube, moving: true, health: initialHealth, attackCooldownTimer: attackCooldown });
    scene.add(cube);
  }

  // update box
  function update() {
    army1.forEach(unit1 => {
      if (unit1.moving) {
        let closestEnemy = null;
        let closestDistance = Infinity;
        army2.forEach(unit2 => {
          const distance = unit1.cube.position.distanceTo(unit2.cube.position);
          if (distance < closestDistance && distance > unitRadius && !army1.includes(unit2)) {
            closestDistance = distance;
            closestEnemy = unit2;
          }
        });
        if (closestEnemy && closestDistance <= radiusAttack) {
          unit1.moving = false;
          attack(unit1, closestEnemy);
        } else {
          const direction = closestEnemy ? closestEnemy.cube.position.clone().sub(unit1.cube.position).normalize() : new THREE.Vector3();
          const moveDistance = Math.min(speed, closestDistance - radiusAttack);
          unit1.cube.position.add(direction.multiplyScalar(moveDistance));
        }
      }
    });

    army2.forEach(unit2 => {
      if (unit2.moving) {
        let closestEnemy = null;
        let closestDistance = Infinity;
        army1.forEach(unit1 => {
          const distance = unit2.cube.position.distanceTo(unit1.cube.position);
          if (distance < closestDistance && distance > unitRadius && !army2.includes(unit1)) {
            closestDistance = distance;
            closestEnemy = unit1;
          }
        });
        if (closestEnemy && closestDistance <= radiusAttack) {
          unit2.moving = false;
          attack(unit2, closestEnemy);
        } else {
          const direction = closestEnemy ? closestEnemy.cube.position.clone().sub(unit2.cube.position).normalize() : new THREE.Vector3();
          const moveDistance = Math.min(speed, closestDistance - radiusAttack);
          unit2.cube.position.add(direction.multiplyScalar(moveDistance));
        }
      }
    });

    requestAnimationFrame(update);
  }

  update();
}

function attack(attacker, target) {
  if (attacker.attackCooldownTimer === 0) {
    target.health -= attackDamage;
    attacker.attackCooldownTimer = attackCooldown;
    console.log(`The Army Cube is attacking! Target's health: ${target.health}`);
    if (target.health <= 0) {
      scene.remove(target.cube);
      army1 = army1.filter(unit => unit.cube !== target.cube);
      army2 = army2.filter(unit => unit.cube !== target.cube);
    }
  }

  attacker.attackCooldownTimer = Math.max(attacker.attackCooldownTimer - 1, 0);

  if (attacker.health > 0 && attacker.attackCooldownTimer === 0 && target.health > 0) {
    setTimeout(() => {
      attack(attacker, target);
    }, attackCooldown * 1000);
  } else {
    attacker.moving = true;
  }
}

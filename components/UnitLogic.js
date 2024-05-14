import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { maxUnitsPerArmy, fieldSize, countArmy } from '/characteristics/army.js';
import { speed, unitRadius, initialHealth, attackDamage, attackCooldown, radiusAttack } from '/characteristics/unit.js';

let army1 = [];
let army2 = [];
let scene;
let model, mixer;
let prevTime = Date.now();

export function createArmies(sceneRef) {
    scene = sceneRef;

    const loader = new GLTFLoader();
    loader.load(
        '/public/Horse.glb',
        (gltf) => {
            model = gltf.scene;
            mixer = new THREE.AnimationMixer(model);
            mixer.clipAction(gltf.animations[0]).setDuration(1).play();
            initializeArmies();
            update();
        },
    );
}

function setMaterialColor(object, color) {
    object.traverse((child) => {
        if (child.isMesh) {
            child.material = new THREE.MeshBasicMaterial({ color: color });
        }
    });
}

function initializeArmies() {
    const redColor = 0xff0000;

    // create army 1
    while (army1.length < maxUnitsPerArmy && army1.length < countArmy) {
        const soldier = model.clone();
        setMaterialColor(soldier, redColor);
        soldier.scale.set(0.009, 0.0099, 0.011);
        soldier.rotateY(Math.PI); // Rotate 180 degrees initially
        soldier.position.set(-(Math.random() * (fieldSize / 2 - 1)), 0, (Math.random() * fieldSize) - fieldSize / 2);
        army1.push({ model: soldier, moving: true, health: initialHealth, attackCooldownTimer: attackCooldown });
        scene.add(soldier);
    }

    // create army 2
    while (army2.length < maxUnitsPerArmy && army2.length < countArmy) {
        const soldier = model.clone();
        soldier.scale.set(0.009, 0.00999, 0.011);
        soldier.rotateY(Math.PI); // Rotate 180 degrees initially
        soldier.position.set((Math.random() * (fieldSize / 2 - 1)), 0, (Math.random() * fieldSize) - fieldSize / 2);
        army2.push({ model: soldier, moving: true, health: initialHealth, attackCooldownTimer: attackCooldown });
        scene.add(soldier);
    }
}

function update() {
    const time = Date.now();
    const delta = (time - prevTime) * 0.001;
    prevTime = time;

    if (mixer) {
        mixer.update(delta);
    }

    army1.forEach(unit1 => {
        if (unit1.moving) {
            let closestEnemy = null;
            let closestDistance = Infinity;
            army2.forEach(unit2 => {
                const distance = unit1.model.position.distanceTo(unit2.model.position);
                if (distance < closestDistance && distance > unitRadius && !army1.includes(unit2)) {
                    closestDistance = distance;
                    closestEnemy = unit2;
                }
            });
            if (closestEnemy && closestDistance <= radiusAttack) {
                unit1.moving = false;
                attack(unit1, closestEnemy);
            } else {
                const direction = closestEnemy ? closestEnemy.model.position.clone().sub(unit1.model.position).normalize() : new THREE.Vector3();
                const moveDistance = Math.min(speed, closestDistance - radiusAttack);
                unit1.model.position.add(direction.multiplyScalar(moveDistance));
                rotateTowardsTarget(unit1.model, direction);
            }
        }
    });

    army2.forEach(unit2 => {
        if (unit2.moving) {
            let closestEnemy = null;
            let closestDistance = Infinity;
            army1.forEach(unit1 => {
                const distance = unit2.model.position.distanceTo(unit1.model.position);
                if (distance < closestDistance && distance > unitRadius && !army2.includes(unit1)) {
                    closestDistance = distance;
                    closestEnemy = unit1;
                }
            });
            if (closestEnemy && closestDistance <= radiusAttack) {
                unit2.moving = false;
                attack(unit2, closestEnemy);
            } else {
                const direction = closestEnemy ? closestEnemy.model.position.clone().sub(unit2.model.position).normalize() : new THREE.Vector3();
                const moveDistance = Math.min(speed, closestDistance - radiusAttack);
                unit2.model.position.add(direction.multiplyScalar(moveDistance));
                rotateTowardsTarget(unit2.model, direction);
            }
        }
    });

    requestAnimationFrame(update);
}

function rotateTowardsTarget(model, direction) {
    const angle = Math.atan2(direction.x, direction.z);
    model.rotation.y = angle;
}

function attack(attacker, target) {
    if (attacker.attackCooldownTimer === 0) {
        target.health -= attackDamage;
        attacker.attackCooldownTimer = attackCooldown;
        console.log(`The Army Cube is attacking! Target's health: ${target.health}`);
        if (target.health <= 0) {
            scene.remove(target.model);
            army1 = army1.filter(unit => unit.model !== target.model);
            army2 = army2.filter(unit => unit.model !== target.model);
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

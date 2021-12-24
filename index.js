import * as THREE from 'three';
// import easing from './easing.js';
import metaversefile from 'metaversefile';
const {useApp, useFrame, useWorld, useActivate, useLoaders, usePhysics, addTrackedApp, useDefaultModules, useCleanup} = metaversefile;

const baseUrl = import.meta.url.replace(/(\/)[^\/\\]*$/, '$1');

const localVector = new THREE.Vector3();
const localQuaternion = new THREE.Quaternion();

const fruitFileNames = [
  // 'Egg_Fruit_dream.glb',
  // 'Lavender_Berry_dream.glb',
  'Long_Apple_dream.glb',
  // 'Red_Shroom_dream.glb',
  // 'Slime_Fruit_dream.glb',
  // 'Squid_Squash_dream.glb',
];

export default () => {
  const app = useApp();
  const world = useWorld();
  const physics = usePhysics();

  const _loadFruit = async fileName => {
    /* const app = await world.addObject(`${baseUrl}fruit/`);
    return app; */
    const m = await metaversefile.import(`${baseUrl}fruit/`);
    const app = metaversefile.createApp();
    app.setComponent('fileName', fileName);
    await metaversefile.addModule(app, m);
    return app;
    // return await metaversefile.load(u);
  };
  const _loadGlb = async fileName => {
    const u = `${baseUrl}${fileName}`;
    let o = await new Promise((accept, reject) => {
      const {gltfLoader} = useLoaders();
      gltfLoader.load(u, accept, function onprogress() {}, reject);
    });
    o = o.scene;
    // window.fruit = o;
    return o;
  };

  const subApps = [];
  let physicsIds = [];
  (async () => {
    const os = await Promise.all(fruitFileNames.map(fruitFileName => _loadFruit(fruitFileName))
      .concat([
        /* (async () => {
          const u = `${baseUrl}fruit.glb`;
          let o = await new Promise((accept, reject) => {
            const {gltfLoader} = useLoaders();
            gltfLoader.load(u, accept, function onprogress() {}, reject);
          });
          window.fruit = o;
          return o;
        })(), */
        _loadGlb('plant.glb'),
        _loadGlb('plant2.glb'),
      ])
    );
    const [
      // eggFruit,
      // lavenderBerry,
      longApple,
      // redShroom,
      // slimeFruit,
      // squidSquash,
      plant,
      plant2,
    ] = os;
    const fruits = [
      // eggFruit,
      // lavenderBerry,
      longApple,
      // redShroom,
      // slimeFruit,
      // squidSquash,
    ];
    /* for (const fruit of fruits) {
      fruit.scale.multiplyScalar(0.2);
    } */
    plant.scale.multiplyScalar(5);
    plant2.scale.multiplyScalar(0.02);
    app.add(plant);
    app.add(plant2);
    app.add(longApple);
    /* for (const o of os) {
      app.add(o);
    } */
    app.updateMatrixWorld();

    subApps.push(...fruits);

    /* // visibility
    for (const f of fruits) {
      f.visible = false;
    }
    eggFruit.visible = true; */
    
    activateCb = e => {
      console.log('activate', e);
    };
    frameCb = (timestamp, timeDiff) => {
      /* // console.log('use frame', timestamp, timeDiff);
      localQuaternion.setFromAxisAngle(localVector.set(0, 0, 1), Math.sin(timestamp / 1000) * 0.1);
      for (const o of os) {
        o.quaternion.copy(localQuaternion);
      } */
    };
  })();
  
  /* const physicsMaterial = new THREE.Vector3(0.5, 0.5, 0);
  const physicsObject = physics.addCapsuleGeometry(app.position, app.quaternion, 0.3, 0, physicsMaterial);
  physicsIds.push(physicsObject); */
  
  app.getPhysicsObjects = () => {
    const result = [];
    for (const subApp of subApps) {
      result.push(...subApp.getPhysicsObjects());
    }
    return result;
  };

  let activateCb = null;
  let frameCb = null;
  useActivate(() => {
    activateCb && activateCb();
  });
  useFrame(({timestamp, timeDiff}) => {
    frameCb && frameCb(timestamp, timeDiff);
  });

  useCleanup(() => {
    for (const physicsId of physicsIds) {
      physics.removeGeometry(physicsId);
    }
  });

  return app;
};
const reactiveEffects = new WeakMap();
let activeEffect = null;
let t;
function ref(value) {
  return new Proxy(
    { value },
    {
      get(target, key) {
        track(target);
        return target[key];
      },
      set(target, key, value) {
        if (t) clearTimeout(t);
        t = setTimeout(() => {
          trigger(target);
        }, 0);
        target[key] = value;
      },
    }
  );
}

function track(target) {
  if (activeEffect) {
    const effects = getSubscribersForProperty(target);
    effects.add(activeEffect);
  }
}

function trigger(target) {
  const effects = getSubscribersForProperty(target);
  effects.forEach((effect) => effect());
}

function getSubscribersForProperty(target) {
  let effects = reactiveEffects.get(target);
  if (!effects) {
    reactiveEffects.set(target, new Set());
    effects = reactiveEffects.get(target);
  }

  return effects;
}

function watchEffect(cb) {
  const effect = () => {
    activeEffect = effect;
    cb();
    activeEffect = null;
  };

  effect();
}

/**
 * TESTING
 */

let a = ref(4);
let b = ref(1);
let c = a + b;

watchEffect(() => {
  c = a.value + b.value;

  console.log(c);
});

setInterval(() => {
  a.value += Math.floor(Math.random() * 10);
  b.value += Math.floor(Math.random() * 10);
}, 1000);

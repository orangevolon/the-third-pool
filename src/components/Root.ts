import { Scene } from './Scene';
import { Component } from './types';

export function Root(): Component {
  const scene = Scene({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const container = document.createElement('div');
  container.setAttribute('id', 'container');

  const onResize = () => {
    scene.onUpdate?.({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  };

  const onMount = () => {
    container.appendChild(scene.element);
    window.addEventListener('resize', onResize);
    scene.onMount?.();
  };

  const onUnmount = () => {
    container.removeChild(scene.element);
    window.removeEventListener('resize', onResize);
    scene.onUnmount?.();
  };

  return { element: container, onMount, onUnmount };
}

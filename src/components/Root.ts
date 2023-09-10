import { Scene } from './Scene';
import { Component } from './types';

export function Root(): Component {
  const canvasSize = Math.max(window.innerWidth, window.innerHeight);

  const scene = Scene({
    width: canvasSize,
    height: canvasSize,
  });

  const container = document.createElement('div');
  container.setAttribute('id', 'container');
  scene.element.setAttribute('id', 'scene');

  const onMount = () => {
    container.appendChild(scene.element);
    scene.onMount?.();
  };

  const onUnmount = () => {
    container.removeChild(scene.element);
    scene.onUnmount?.();
  };

  return { element: container, onMount, onUnmount };
}

"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const PARTICLE_COUNT = 80;

export default function ParticleBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 1000);
        camera.position.z = 22;

        const renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setClearColor(0x000000, 0);

        const group = new THREE.Group();
        const outerSphere = new THREE.Mesh(
          new THREE.SphereGeometry(12, 28, 28),
          new THREE.MeshBasicMaterial({
            color: 0x800020,
            wireframe: true,
            transparent: true,
            opacity: 0.24,
          }),
        );
        const innerSphere = new THREE.Mesh(
          new THREE.IcosahedronGeometry(7, 2),
          new THREE.MeshBasicMaterial({
            color: 0xd97706,
            wireframe: true,
            transparent: true,
            opacity: 0.16,
          }),
        );

        const particlePositions = new Float32Array(PARTICLE_COUNT * 3);
        for (let index = 0; index < particlePositions.length; index += 1) {
          particlePositions[index] = (Math.random() - 0.5) * 45;
        }

        const particles = new THREE.Points(
          new THREE.BufferGeometry().setAttribute(
            "position",
            new THREE.Float32BufferAttribute(particlePositions, 3),
          ),
          new THREE.PointsMaterial({
            color: 0xb45309,
            size: 0.22,
            transparent: true,
            opacity: 0.62,
            sizeAttenuation: true,
          }),
        );

        group.add(outerSphere, innerSphere, particles);
        scene.add(group);

        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        let animationFrame = 0;
        let visible = !document.hidden;

        function resize() {
          const width = window.innerWidth;
          const height = window.innerHeight;
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height, false);
        }

        function render() {
          if (!visible) {
            animationFrame = 0;
            return;
          }

          if (!reducedMotion) {
            outerSphere.rotation.y += 0.0015;
            outerSphere.rotation.x += 0.0008;
            innerSphere.rotation.y -= 0.002;
            innerSphere.rotation.z += 0.001;
            particles.rotation.y += 0.0005;
          }

          renderer.render(scene, camera);
          animationFrame = window.requestAnimationFrame(render);
        }

        function handleVisibilityChange() {
          visible = !document.hidden;
          if (visible && !animationFrame) {
            render();
          }
        }

        resize();
        window.addEventListener("resize", resize);
        document.addEventListener("visibilitychange", handleVisibilityChange);
        render();

        return () => {
          window.removeEventListener("resize", resize);
          document.removeEventListener("visibilitychange", handleVisibilityChange);
          if (animationFrame) window.cancelAnimationFrame(animationFrame);

          outerSphere.geometry.dispose();
          outerSphere.material.dispose();
          innerSphere.geometry.dispose();
          innerSphere.material.dispose();
          particles.geometry.dispose();
          particles.material.dispose();
          renderer.dispose();
        };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 block"
      style={{ width: "100vw", height: "100dvh", zIndex: 0 }}
    />
  );
}

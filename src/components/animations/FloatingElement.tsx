'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function FloatingElement() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const mount = mountRef.current;
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.z = 5;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // Gold material
    const goldMaterial = new THREE.MeshStandardMaterial({
      color: 0xc9a84c,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0x4a3a10,
      emissiveIntensity: 0.3,
    });

    const emeraldMaterial = new THREE.MeshStandardMaterial({
      color: 0x1b4332,
      metalness: 0.5,
      roughness: 0.3,
      emissive: 0x0a1a14,
      emissiveIntensity: 0.2,
    });

    const creamMaterial = new THREE.MeshStandardMaterial({
      color: 0xfaf7f2,
      metalness: 0.1,
      roughness: 0.6,
      emissive: 0x8a7a60,
      emissiveIntensity: 0.05,
    });

    // Geometries
    const geometries = [
      new THREE.OctahedronGeometry(0.5, 0),
      new THREE.TetrahedronGeometry(0.4, 0),
      new THREE.IcosahedronGeometry(0.35, 0),
      new THREE.OctahedronGeometry(0.3, 0),
      new THREE.TetrahedronGeometry(0.25, 0),
      new THREE.IcosahedronGeometry(0.45, 0),
      new THREE.OctahedronGeometry(0.2, 0),
    ];

    const materials = [goldMaterial, emeraldMaterial, creamMaterial, goldMaterial, emeraldMaterial, goldMaterial, creamMaterial];

    const meshes: THREE.Mesh[] = [];
    const floatOffsets: number[] = [];
    const rotationSpeeds: { x: number; y: number; z: number }[] = [];

    geometries.forEach((geo, i) => {
      const mesh = new THREE.Mesh(geo, materials[i]);
      const angle = (i / geometries.length) * Math.PI * 2;
      const radius = 1.8 + Math.random() * 0.8;
      mesh.position.set(
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 1
      );
      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      scene.add(mesh);
      meshes.push(mesh);
      floatOffsets.push(Math.random() * Math.PI * 2);
      rotationSpeeds.push({
        x: (Math.random() - 0.5) * 0.01,
        y: (Math.random() - 0.5) * 0.015,
        z: (Math.random() - 0.5) * 0.008,
      });
    });

    // Central star shape
    const starShape = new THREE.Shape();
    const outerR = 0.6, innerR = 0.25, points = 8;
    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const r = i % 2 === 0 ? outerR : innerR;
      if (i === 0) starShape.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
      else starShape.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
    }
    starShape.closePath();

    const extrudeSettings = { depth: 0.08, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02 };
    const starGeo = new THREE.ExtrudeGeometry(starShape, extrudeSettings);
    const starMesh = new THREE.Mesh(starGeo, new THREE.MeshStandardMaterial({
      color: 0xc9a84c,
      metalness: 0.9,
      roughness: 0.1,
      emissive: 0x6a4a10,
      emissiveIntensity: 0.4,
    }));
    starMesh.position.set(0, 0, 0);
    scene.add(starMesh);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xc9a84c, 2, 10);
    pointLight1.position.set(3, 3, 3);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x1b4332, 1.5, 10);
    pointLight2.position.set(-3, -2, 2);
    scene.add(pointLight2);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 5, 5);
    scene.add(directionalLight);

    // Mouse interaction
    let mouseX = 0, mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Rotate star
      starMesh.rotation.z = elapsed * 0.3;
      starMesh.rotation.x = Math.sin(elapsed * 0.4) * 0.2;

      // Float and rotate particles
      meshes.forEach((mesh, i) => {
        const offset = floatOffsets[i];
        mesh.position.y += Math.sin(elapsed * 0.8 + offset) * 0.003;
        mesh.rotation.x += rotationSpeeds[i].x;
        mesh.rotation.y += rotationSpeeds[i].y;
        mesh.rotation.z += rotationSpeeds[i].z;
      });

      // Camera follows mouse gently
      camera.position.x += (mouseX * 0.3 - camera.position.x) * 0.05;
      camera.position.y += (mouseY * 0.3 - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

      // Orbit light
      pointLight1.position.x = Math.cos(elapsed * 0.5) * 3;
      pointLight1.position.z = Math.sin(elapsed * 0.5) * 3;

      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="w-full h-full"
      style={{ willChange: 'transform' }}
    />
  );
}

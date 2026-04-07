"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Html,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import { Eye, User } from "lucide-react";
import * as THREE from "three";

import { buildPlanner3DSceneDocument, mmToWorld, type Planner3DItem, type PlannerDocument } from "./types";

interface Planner3DViewerProps {
  document: PlannerDocument;
  className?: string;
}

type ViewerCameraMode = "orbit" | "walk";
type PlannerSceneDocument = ReturnType<typeof buildPlanner3DSceneDocument>;

function resolveItemColor(item: Planner3DItem) {
  if (item.color) return item.color;
  const category = item.category.toLowerCase();
  if (category.includes("storage")) return "#4b5563";
  if (category.includes("seat") || category.includes("sofa")) return "#8d6b4f";
  if (category.includes("table")) return "#c08a45";
  if (category.includes("desk") || category.includes("work")) return "#6f8594";
  return "#6f7e87";
}

function PlannerRoomShell({ room }: { room: PlannerSceneDocument["room"] }) {
  const halfWidth = mmToWorld(room.widthMm) / 2;
  const halfDepth = mmToWorld(room.depthMm) / 2;
  const wallHeight = mmToWorld(room.wallHeightMm);
  const wallThickness = mmToWorld(room.wallThicknessMm);
  const floorThickness = mmToWorld(room.floorThicknessMm);

  return (
    <group>
      <mesh receiveShadow position={[0, -floorThickness / 2, 0]}>
        <boxGeometry args={[mmToWorld(room.widthMm), floorThickness, mmToWorld(room.depthMm)]} />
        <meshStandardMaterial color="#1a2230" roughness={0.98} metalness={0.02} />
      </mesh>
      <mesh receiveShadow position={[0, wallHeight / 2, -halfDepth - wallThickness / 2]}>
        <boxGeometry args={[mmToWorld(room.widthMm) + wallThickness * 2, wallHeight, wallThickness]} />
        <meshStandardMaterial color="#233044" roughness={0.82} metalness={0.03} />
      </mesh>
      <mesh receiveShadow position={[0, wallHeight / 2, halfDepth + wallThickness / 2]}>
        <boxGeometry args={[mmToWorld(room.widthMm) + wallThickness * 2, wallHeight, wallThickness]} />
        <meshStandardMaterial color="#202b3b" roughness={0.82} metalness={0.03} />
      </mesh>
      <mesh receiveShadow position={[-halfWidth - wallThickness / 2, wallHeight / 2, 0]}>
        <boxGeometry args={[wallThickness, wallHeight, mmToWorld(room.depthMm)]} />
        <meshStandardMaterial color="#263245" roughness={0.82} metalness={0.03} />
      </mesh>
      <mesh receiveShadow position={[halfWidth + wallThickness / 2, wallHeight / 2, 0]}>
        <boxGeometry args={[wallThickness, wallHeight, mmToWorld(room.depthMm)]} />
        <meshStandardMaterial color="#263245" roughness={0.82} metalness={0.03} />
      </mesh>
      <gridHelper
        args={[Math.max(mmToWorld(room.widthMm), mmToWorld(room.depthMm)) + 2, 16, "#334155", "#1f2937"]}
        position={[0, 0.001, 0]}
      />
    </group>
  );
}

function PlannerItemMesh({ room, item }: { room: PlannerSceneDocument["room"]; item: Planner3DItem }) {
  const halfWidth = mmToWorld(room.widthMm) / 2;
  const halfDepth = mmToWorld(room.depthMm) / 2;
  const width = mmToWorld(item.sizeMm.widthMm);
  const depth = mmToWorld(item.sizeMm.depthMm);
  const height = mmToWorld(item.sizeMm.heightMm);
  const x = mmToWorld(item.centerMm.xMm) - halfWidth;
  const z = mmToWorld(item.centerMm.yMm) - halfDepth;
  const y = height / 2;
  const rotationY = ((item.rotationDeg ?? 0) * Math.PI) / 180;

  return (
    <group position={[x, y, z]} rotation={[0, rotationY, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={resolveItemColor(item)} roughness={0.72} metalness={0.08} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, height / 2 - 0.01, 0]}>
        <boxGeometry args={[width * 0.92, Math.min(mmToWorld(18), height * 0.18), depth * 0.92]} />
        <meshStandardMaterial color="#d2d8de" roughness={0.34} metalness={0.06} />
      </mesh>
      <Html center transform distanceFactor={10} position={[0, height / 2 + 0.14, 0]} style={{ pointerEvents: "none" }}>
        <div className="min-w-[7rem] rounded-full border border-white/10 bg-slate-950/82 px-3 py-1 text-center text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-slate-100 shadow-[0_12px_30px_-18px_rgba(15,23,42,0.95)] backdrop-blur-md">
          {item.name}
        </div>
      </Html>
    </group>
  );
}

function OrbitCamera({ room }: { room: PlannerSceneDocument["room"] }) {
  const controlsTarget = [0, mmToWorld(room.wallHeightMm * 0.42), 0] as const;
  const longestEdge = Math.max(room.widthMm, room.depthMm);
  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[mmToWorld(longestEdge * 0.95), mmToWorld(room.wallHeightMm * 0.82), mmToWorld(longestEdge * 1.05)]}
        fov={42}
        near={0.1}
        far={120}
      />
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        minDistance={4}
        maxDistance={22}
        maxPolarAngle={Math.PI / 2.05}
        target={controlsTarget}
      />
    </>
  );
}

function WalkCamera({ room }: { room: PlannerSceneDocument["room"] }) {
  const gl = useThree((state) => state.gl);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const moveSpeed = 0.05;
  const lookSpeed = 0.002;
  const keys = useRef<Set<string>>(new Set());
  const euler = useRef(new THREE.Euler(0, 0, 0, "YXZ"));
  const isPointerLocked = useRef(false);

  useEffect(() => {
    const camera = cameraRef.current;
    if (!camera) return;

    camera.position.set(-mmToWorld(room.widthMm) / 2 + 0.45, 1.7, 0);
    euler.current.y = Math.PI / 2;

    const handleKeyDown = (event: KeyboardEvent) => keys.current.add(event.key.toLowerCase());
    const handleKeyUp = (event: KeyboardEvent) => keys.current.delete(event.key.toLowerCase());
    const handleMouseMove = (event: MouseEvent) => {
      if (!isPointerLocked.current) return;
      euler.current.y -= event.movementX * lookSpeed;
      euler.current.x -= event.movementY * lookSpeed;
      euler.current.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, euler.current.x));
    };
    const handlePointerLockChange = () => {
      isPointerLocked.current = document.pointerLockElement === gl.domElement;
    };
    const handleCanvasClick = () => {
      if (!isPointerLocked.current) {
        void gl.domElement.requestPointerLock();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("pointerlockchange", handlePointerLockChange);
    gl.domElement.addEventListener("click", handleCanvasClick);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("pointerlockchange", handlePointerLockChange);
      gl.domElement.removeEventListener("click", handleCanvasClick);
      if (document.pointerLockElement === gl.domElement) {
        void document.exitPointerLock();
      }
    };
  }, [gl, room.depthMm, room.widthMm]);

  useFrame(() => {
    const camera = cameraRef.current;
    if (!camera) return;

    camera.quaternion.setFromEuler(euler.current);

    const direction = new THREE.Vector3();
    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0));

    if (keys.current.has("w")) direction.add(forward);
    if (keys.current.has("s")) direction.sub(forward);
    if (keys.current.has("a")) direction.sub(right);
    if (keys.current.has("d")) direction.add(right);

    if (direction.lengthSq() > 0) {
      camera.position.add(direction.normalize().multiplyScalar(moveSpeed));
    }

    const halfWidth = mmToWorld(room.widthMm) / 2 - 0.3;
    const halfDepth = mmToWorld(room.depthMm) / 2 - 0.3;
    camera.position.set(
      Math.max(-halfWidth, Math.min(halfWidth, camera.position.x)),
      1.7,
      Math.max(-halfDepth, Math.min(halfDepth, camera.position.z)),
    );
  });

  return <PerspectiveCamera ref={cameraRef} makeDefault fov={70} near={0.1} far={120} />;
}

function PlannerScene({ document, cameraMode }: { document: PlannerDocument; cameraMode: ViewerCameraMode }) {
  const sceneDocument = buildPlanner3DSceneDocument(document);
  const { room, items } = sceneDocument;

  return (
    <>
      <color attach="background" args={["#0b1120"]} />
      <fog attach="fog" args={["#0b1120", 10, 28]} />
      <Environment preset="warehouse" />
      <ambientLight intensity={0.92} />
      <hemisphereLight intensity={0.58} groundColor="#0f172a" color="#dbeafe" />
      <directionalLight position={[6, 12, 9]} intensity={1.65} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
      <spotLight position={[-8, 10, -5]} angle={0.34} penumbra={0.7} intensity={0.9} color="#cbd5e1" />

      {cameraMode === "orbit" ? <OrbitCamera room={room} /> : <WalkCamera room={room} />}
      <PlannerRoomShell room={room} />
      {items.map((item) => <PlannerItemMesh key={item.id} room={room} item={item} />)}
      <ContactShadows position={[0, 0.005, 0]} opacity={0.42} scale={Math.max(mmToWorld(room.widthMm), mmToWorld(room.depthMm)) * 1.2} blur={2.6} far={12} />
      <Html position={[-mmToWorld(room.widthMm) / 2 + 0.2, mmToWorld(room.wallHeightMm) + 0.16, -mmToWorld(room.depthMm) / 2 + 0.2]} style={{ pointerEvents: "none" }}>
        <div className="rounded-2xl border border-white/10 bg-slate-950/82 px-3 py-2 text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-slate-100 backdrop-blur-md">
          mm scene
        </div>
      </Html>
    </>
  );
}

export function Planner3DViewer({ document, className }: Planner3DViewerProps) {
  const [cameraMode, setCameraMode] = useState<ViewerCameraMode>("orbit");

  return (
    <div className={`relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/60 shadow-[0_30px_90px_-48px_rgba(15,23,42,0.95)] ${className ?? ""}`}>
      <Suspense
        fallback={
          <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_top,#0f172a_0%,#020617_72%)]">
            <div className="rounded-full border border-sky-300/30 px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-sky-100/80">Preparing 3D scene</div>
          </div>
        }
      >
        <Canvas shadows dpr={[1, 1.75]} gl={{ antialias: true, alpha: false }} className="absolute inset-0">
          <PlannerScene document={document} cameraMode={cameraMode} />
        </Canvas>
      </Suspense>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-950/55 to-transparent" />

      <div className="absolute bottom-4 right-4 z-20 flex gap-2">
        <button type="button" onClick={() => setCameraMode("orbit")} className={`flex items-center gap-2 rounded-full border px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] transition ${cameraMode === "orbit" ? "border-sky-200/60 bg-sky-300/25 text-sky-50" : "border-white/12 bg-slate-950/78 text-slate-200 hover:border-sky-200/30 hover:text-sky-100"}`}>
          <Eye className="h-4 w-4" /> Orbit
        </button>
        <button type="button" onClick={() => setCameraMode("walk")} className={`flex items-center gap-2 rounded-full border px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] transition ${cameraMode === "walk" ? "border-sky-200/60 bg-sky-300/25 text-sky-50" : "border-white/12 bg-slate-950/78 text-slate-200 hover:border-sky-200/30 hover:text-sky-100"}`}>
          <User className="h-4 w-4" /> Walk
        </button>
      </div>

      <div className="absolute left-4 top-4 z-20 flex max-w-[18rem] flex-col gap-2">
        <div className="rounded-2xl border border-white/12 bg-slate-950/78 px-4 py-3 text-[0.72rem] uppercase tracking-[0.18em] text-slate-100 backdrop-blur-md">
          <div className="font-semibold text-sky-100">{cameraMode === "orbit" ? "Orbit Preview" : "Walkthrough Preview"}</div>
          <div className="mt-1 text-[0.66rem] tracking-[0.14em] text-slate-300">
            {cameraMode === "orbit" ? "Drag to inspect the document-mapped scene." : "Click into the canvas, then use WASD and mouse look."}
          </div>
        </div>
        {cameraMode === "walk" ? (
          <div className="rounded-2xl border border-white/12 bg-slate-950/78 px-4 py-3 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-slate-200 backdrop-blur-md">
            WASD move | Mouse look | Pointer lock
          </div>
        ) : null}
      </div>
    </div>
  );
}

'use client'

import { Suspense, useRef, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Environment,
  Grid,
  Text,
  Html,
} from '@react-three/drei'
import { useFloorPlannerStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Eye, User, RotateCcw } from 'lucide-react'
import * as THREE from 'three'

export function Viewer3D() {
  const { cameraMode, setCameraMode, roomConfig, placedFurniture } = useFloorPlannerStore()
  const [showControls, setShowControls] = useState(true)

  return (
    <div className="w-full h-full relative">
      <Canvas shadows>
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>

      {/* Camera Mode Controls */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        <Button
          variant={cameraMode === 'orbit' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setCameraMode('orbit')}
          className="shadow-lg"
        >
          <Eye className="h-4 w-4 mr-2" />
          Orbit
        </Button>
        <Button
          variant={cameraMode === 'firstPerson' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setCameraMode('firstPerson')}
          className="shadow-lg"
        >
          <User className="h-4 w-4 mr-2" />
          Walk
        </Button>
      </div>

      {/* First Person Controls Help */}
      {cameraMode === 'firstPerson' && (
        <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur rounded-lg p-3 shadow-lg">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">WASD</span> - Move | 
            <span className="font-medium ml-1">Mouse</span> - Look around
          </p>
        </div>
      )}
    </div>
  )
}

function Scene() {
  const { cameraMode, roomConfig, placedFurniture } = useFloorPlannerStore()

  // Convert cm to meters for 3D
  const scale = 0.01
  const roomWidth = roomConfig.width * scale
  const roomDepth = roomConfig.depth * scale
  const roomHeight = roomConfig.height * scale

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight position={[-10, 10, -5]} intensity={0.3} />

      {/* Environment */}
      <Environment preset="lobby" />

      {/* Camera */}
      {cameraMode === 'orbit' ? (
        <OrbitCamera roomWidth={roomWidth} roomDepth={roomDepth} roomHeight={roomHeight} />
      ) : (
        <FirstPersonCamera roomWidth={roomWidth} roomDepth={roomDepth} roomHeight={roomHeight} />
      )}

      {/* Room */}
      <Room width={roomWidth} depth={roomDepth} height={roomHeight} />

      {/* Grid */}
      <Grid
        args={[roomWidth * 2, roomDepth * 2]}
        position={[0, 0.001, 0]}
        cellSize={0.5}
        cellThickness={0.5}
        cellColor="#6b7280"
        sectionSize={1}
        sectionThickness={1}
        sectionColor="#374151"
        fadeDistance={50}
        fadeStrength={1}
        infiniteGrid
      />

      {/* Furniture */}
      {placedFurniture.map((item) => (
        <Furniture3D 
          key={item.id} 
          item={item} 
          roomWidth={roomWidth}
          roomDepth={roomDepth}
          scale={scale}
        />
      ))}
    </>
  )
}

function OrbitCamera({ 
  roomWidth, 
  roomDepth, 
  roomHeight 
}: { 
  roomWidth: number
  roomDepth: number
  roomHeight: number
}) {
  const controlsRef = useRef<any>(null)
  
  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[roomWidth * 0.8, roomHeight * 2, roomDepth * 0.8]}
        fov={60}
      />
      <OrbitControls
        ref={controlsRef}
        target={[0, roomHeight / 4, 0]}
        maxPolarAngle={Math.PI / 2.1}
        minDistance={2}
        maxDistance={Math.max(roomWidth, roomDepth) * 2}
        enableDamping
        dampingFactor={0.05}
      />
    </>
  )
}

function FirstPersonCamera({ 
  roomWidth, 
  roomDepth, 
  roomHeight 
}: { 
  roomWidth: number
  roomDepth: number
  roomHeight: number
}) {
  const { camera, gl } = useThree()
  const moveSpeed = 0.05
  const lookSpeed = 0.002
  const keys = useRef<Set<string>>(new Set())
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'))
  const isPointerLocked = useRef(false)

  useEffect(() => {
    // Position camera at entrance
    camera.position.set(-roomWidth / 2 + 0.5, 1.7, 0)
    euler.current.y = Math.PI / 2

    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current.add(e.key.toLowerCase())
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current.delete(e.key.toLowerCase())
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isPointerLocked.current) return

      euler.current.y -= e.movementX * lookSpeed
      euler.current.x -= e.movementY * lookSpeed
      euler.current.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, euler.current.x))
    }

    const handlePointerLockChange = () => {
      isPointerLocked.current = document.pointerLockElement === gl.domElement
    }

    const handleClick = () => {
      if (!isPointerLocked.current) {
        gl.domElement.requestPointerLock()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('pointerlockchange', handlePointerLockChange)
    gl.domElement.addEventListener('click', handleClick)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('pointerlockchange', handlePointerLockChange)
      gl.domElement.removeEventListener('click', handleClick)
      if (document.pointerLockElement) {
        document.exitPointerLock()
      }
    }
  }, [camera, gl, roomWidth])

  useFrame(() => {
    // Apply rotation
    camera.quaternion.setFromEuler(euler.current)

    // Get movement direction
    const direction = new THREE.Vector3()
    const forward = new THREE.Vector3()
    const right = new THREE.Vector3()

    camera.getWorldDirection(forward)
    forward.y = 0
    forward.normalize()

    right.crossVectors(forward, new THREE.Vector3(0, 1, 0))

    if (keys.current.has('w')) direction.add(forward)
    if (keys.current.has('s')) direction.sub(forward)
    if (keys.current.has('a')) direction.sub(right)
    if (keys.current.has('d')) direction.add(right)

    direction.normalize().multiplyScalar(moveSpeed)
    camera.position.add(direction)

    // Keep within room bounds
    const halfWidth = roomWidth / 2 - 0.3
    const halfDepth = roomDepth / 2 - 0.3
    camera.position.x = Math.max(-halfWidth, Math.min(halfWidth, camera.position.x))
    camera.position.z = Math.max(-halfDepth, Math.min(halfDepth, camera.position.z))
    camera.position.y = 1.7 // Eye height
  })

  return (
    <PerspectiveCamera
      makeDefault
      fov={75}
    />
  )
}

function Room({ 
  width, 
  depth, 
  height 
}: { 
  width: number
  depth: number
  height: number 
}) {
  return (
    <group>
      {/* Floor */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]} 
        receiveShadow
      >
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#e5e7eb" />
      </mesh>

      {/* Walls */}
      {/* Back wall */}
      <mesh position={[0, height / 2, -depth / 2]} receiveShadow>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color="#f3f4f6" side={THREE.DoubleSide} />
      </mesh>

      {/* Front wall */}
      <mesh position={[0, height / 2, depth / 2]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color="#f3f4f6" side={THREE.DoubleSide} />
      </mesh>

      {/* Left wall */}
      <mesh position={[-width / 2, height / 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[depth, height]} />
        <meshStandardMaterial color="#e5e7eb" side={THREE.DoubleSide} />
      </mesh>

      {/* Right wall */}
      <mesh position={[width / 2, height / 2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[depth, height]} />
        <meshStandardMaterial color="#e5e7eb" side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

function Furniture3D({ 
  item, 
  roomWidth, 
  roomDepth,
  scale 
}: { 
  item: any
  roomWidth: number
  roomDepth: number
  scale: number 
}) {
  if (!item.furniture) return null

  const { furniture } = item
  const width = furniture.width_cm * scale * item.scale_x
  const depth = furniture.depth_cm * scale * item.scale_y
  const height = furniture.height_cm * scale

  // Convert 2D position to 3D
  // In 2D: (0,0) is top-left of room, in 3D: (0,0,0) is center
  const x = (item.x_position * scale) - roomWidth / 2
  const z = (item.y_position * scale) - roomDepth / 2
  const y = height / 2

  const color = getCategoryColor3D(furniture.category)

  return (
    <group
      position={[x, y, z]}
      rotation={[0, -item.rotation * (Math.PI / 180), 0]}
    >
      {/* Main body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Label - HTML overlay */}
      <Html
        position={[0, height / 2 + 0.1, 0]}
        center
        style={{ pointerEvents: 'none' }}
      >
        <div className="bg-card/90 backdrop-blur px-2 py-1 rounded text-xs whitespace-nowrap">
          {furniture.name}
        </div>
      </Html>
    </group>
  )
}

function getCategoryColor3D(category: string): string {
  switch (category) {
    case 'workstation': return '#93c5fd' // blue
    case 'desk': return '#fcd34d' // amber
    case 'chair': return '#86efac' // green
    case 'table': return '#c4b5fd' // purple
    case 'storage': return '#fdba74' // orange
    case 'seating': return '#f9a8d4' // pink
    default: return '#d1d5db' // gray
  }
}

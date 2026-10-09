"use client";

import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { Component, Suspense, memo, useEffect, useRef, useState, type MutableRefObject, type ReactNode } from "react";
import { MathUtils, Mesh, Group, SRGBColorSpace, Texture, Vector3 } from "three";
import { projects, type Project } from "@/lib/projects";

export type DragState = { x: number; y: number; distance: number; down: boolean };
const placements = [
  { x: -.335, y: .205, z: .4, width: .172, rotate: -.14 },
  { x: .325, y: .195, z: -.1, width: .156, rotate: .12 },
  { x: -.105, y: .295, z: -.6, width: .113, rotate: .08 },
  { x: .135, y: -.18, z: .5, width: .172, rotate: -.1 },
  { x: .385, y: -.215, z: -.55, width: .123, rotate: .16 },
  { x: -.4, y: -.235, z: -.6, width: .117, rotate: -.13 },
  { x: -.175, y: -.23, z: .25, width: .144, rotate: .08 },
  { x: .155, y: .29, z: -.85, width: .102, rotate: -.15 },
];

type SceneProps = {
  active: number;
  focus: number | null;
  highlighted: number | null;
  canAnimate: boolean;
  mobile: boolean;
  reduced: boolean;
  drag: MutableRefObject<DragState>;
  onHover: (index: number | null) => void;
  onOpen: (index: number) => void;
  onReady: () => void;
};

// Drei reruns this callback when its identity changes. Keep it stable so
// hovering never marks all eight textures dirty and uploads them again.
function configureTexture(texture: Texture) {
  if (texture.colorSpace !== SRGBColorSpace) {
    texture.colorSpace = SRGBColorSpace;
    texture.needsUpdate = true;
  }
}

// Switching the texture URL also switches the callback once. Drei's onLoad
// effect depends on the callback, so the mobile asset receives its color space.
function configureMobileTexture(texture: Texture) { configureTexture(texture); }

function FrameBudget({ active, focus, mobile, reduced, drag, canAnimate }: Pick<SceneProps, "active" | "focus" | "mobile" | "reduced" | "drag" | "canAnimate">) {
  const invalidate = useThree((state) => state.invalidate);
  const gl = useThree((state) => state.gl);
  const setDpr = useThree((state) => state.setDpr);
  const width = useThree((state) => state.size.width);
  const height = useThree((state) => state.size.height);

  useEffect(() => {
    if (!canAnimate && !reduced) return;
    const canvas = gl.domElement;
    let frame = 0;
    let lastRender = 0;
    let lastTick = 0;
    let slowFrames = 0;
    let reducedResolution = false;
    let activeUntil = performance.now() + 800;
    const openingUntil = performance.now() + 1500;

    const tick = (now: number) => {
      frame = 0;
      if (document.hidden) return;
      const interacting = drag.current.down || now < activeUntil || now < openingUntil || focus !== null;
      // Degrade once on devices that consistently miss frames, without
      // resizing the drawing buffer repeatedly during a drag.
      if (lastTick && now - lastTick > 34) slowFrames++;
      else slowFrames = Math.max(0, slowFrames - 1);
      lastTick = now;
      if (!reducedResolution && slowFrames >= 10) {
        setDpr(1);
        reducedResolution = true;
      }
      const interval = 1000 / (interacting ? 60 : 30);
      if (!lastRender || now - lastRender >= interval - .5 || reduced) {
        invalidate();
        lastRender = now;
      }
      // Touch galleries settle completely. Desktop keeps its gentle float
      // at 30fps and returns to 60fps for pointer and focus motion.
      if (!reduced && (!mobile || interacting)) frame = requestAnimationFrame(tick);
    };

    const wake = () => {
      activeUntil = performance.now() + 700;
      if (!frame && !document.hidden) {
        lastRender = 0;
        lastTick = 0;
        frame = requestAnimationFrame(tick);
      }
    };
    const visibility = () => {
      if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
      else wake();
    };
    const events = ["pointermove", "pointerdown", "pointerup", "pointerleave"] as const;
    for (const event of events) canvas.addEventListener(event, wake, { passive: true });
    document.addEventListener("visibilitychange", visibility);
    wake();
    return () => {
      cancelAnimationFrame(frame);
      for (const event of events) canvas.removeEventListener(event, wake);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [active, focus, mobile, reduced, drag, invalidate, gl, setDpr, width, height, canAnimate]);
  return null;
}

const ProjectPlane = memo(function ProjectPlane({ project, index, ...props }: SceneProps & { project: Project; index: number }) {
  const mesh = useRef<Mesh>(null);
  const texture = useTexture(`/art/gallery/${project.slug}${props.mobile ? "-mobile" : ""}.webp`, props.mobile ? configureMobileTexture : configureTexture);
  const hovered = useRef(false);
  const targetScale = useRef(new Vector3());
  const entryStart = useRef<number | null>(null);
  const viewport = useThree((state) => state.viewport);
  const camera = useThree((state) => state.camera);
  const position = placements[index];
  const relative = ((index - props.active + projects.length + 4) % projects.length) - 4;
  const visible = !props.mobile || Math.abs(relative) <= 1;
  const screen = viewport.getCurrentViewport(camera, [0, 0, position.z]);
  const width = props.mobile ? screen.width * .72 : Math.min(screen.width * position.width, screen.height * .37);
  const isFocused = props.focus === index;
  const targetX = props.mobile ? relative * screen.width * .79 : position.x * screen.width;
  const targetY = props.mobile ? -.025 * screen.height : position.y * screen.height;
  const targetZ = props.mobile ? -Math.abs(relative) * .65 : position.z;
  const [initialPosition] = useState<[number, number, number]>(() => [targetX, targetY, targetZ]);
  const [initialScale] = useState<[number, number, number]>(() => [width, width * 1.25, 1]);

  useFrame((state, delta) => {
    if (!mesh.current || !visible || (!props.canAnimate && !props.reduced)) return;
    if (entryStart.current === null) entryStart.current = state.clock.elapsedTime;
    const progress = props.reduced ? 1 : MathUtils.clamp((state.clock.elapsedTime - entryStart.current - index * .035) / .82, 0, 1);
    const entryOffset = Math.pow(1 - progress, 3);
    const emphasized = hovered.current || props.highlighted === index;
    const damping = props.reduced ? 1 : 1 - Math.exp(-Math.min(delta, .05) * 7);
    const float = props.reduced || props.mobile ? 0 : Math.sin(state.clock.elapsedTime * .45 + index * 1.4) * .038;
    mesh.current.position.x = MathUtils.lerp(mesh.current.position.x, isFocused ? 0 : targetX * (1 + entryOffset * .16), damping);
    mesh.current.position.y = MathUtils.lerp(mesh.current.position.y, isFocused ? 0 : targetY + float + entryOffset * .28, damping);
    mesh.current.position.z = MathUtils.lerp(mesh.current.position.z, isFocused ? 3.3 : targetZ + (emphasized ? .35 : 0) - entryOffset * .9, damping);
    mesh.current.rotation.z = MathUtils.lerp(mesh.current.rotation.z, isFocused ? 0 : (props.mobile ? relative * -.055 : position.rotate) + entryOffset * (index % 2 ? .12 : -.12), damping);
    mesh.current.rotation.y = MathUtils.lerp(mesh.current.rotation.y, isFocused ? 0 : props.mobile ? relative * -.18 : state.pointer.x * .06, damping);
    const scale = (emphasized || isFocused ? 1.055 : 1) * (1 - entryOffset * .32);
    mesh.current.scale.lerp(targetScale.current.set(width * scale, width * 1.25 * scale, 1), damping);
  });

  const hover = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    if (props.drag.current.down) return;
    hovered.current = true;
    props.onHover(index);
    document.body.style.cursor = "pointer";
  };
  return <mesh ref={mesh} visible={visible && (props.canAnimate || props.reduced)} position={initialPosition} scale={initialScale}
    onPointerOver={hover}
    onPointerOut={() => { hovered.current = false; props.onHover(null); document.body.style.cursor = ""; }}
    onClick={(event) => { event.stopPropagation(); if (props.drag.current.distance < 8) props.onOpen(index); }}>
    <planeGeometry args={[1, 1]} />
    <meshBasicMaterial map={texture} toneMapped={false} />
  </mesh>;
});

const Gallery = memo(function Gallery(props: SceneProps) {
  const group = useRef<Group>(null);
  const { onReady } = props;
  useEffect(() => { onReady(); }, [onReady]);
  useFrame((state, delta) => {
    if (!group.current || props.mobile || props.reduced) return;
    const damping = 1 - Math.exp(-Math.min(delta, .05) * 3.5);
    group.current.rotation.y = MathUtils.lerp(group.current.rotation.y, props.focus !== null ? 0 : MathUtils.clamp(props.drag.current.x * .0013, -.48, .48) + state.pointer.x * .045, damping);
    group.current.rotation.x = MathUtils.lerp(group.current.rotation.x, props.focus !== null ? 0 : MathUtils.clamp(props.drag.current.y * .0007, -.16, .16) - state.pointer.y * .025, damping);
  });
  return <>
    <group ref={group}>{projects.map((project, index) => <ProjectPlane key={project.slug} project={project} index={index} {...props} />)}</group>
    <FrameBudget active={props.active} focus={props.focus} mobile={props.mobile} reduced={props.reduced} drag={props.drag} canAnimate={props.canAnimate} />
  </>;
});

class SceneErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

const GalleryScene = memo(function GalleryScene({ fallback, onContextLost, ...props }: SceneProps & { fallback: ReactNode; onContextLost: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => () => {
    document.body.style.cursor = "";
    canvasRef.current?.removeEventListener("webglcontextlost", onContextLost);
  }, [onContextLost]);
  return <SceneErrorBoundary fallback={fallback}>
    <Canvas camera={{ position: [0, 0, 10], fov: 40, near: .1, far: 40 }} dpr={props.mobile ? 1 : [1, 1.35]} frameloop="demand"
      gl={{ antialias: true, alpha: true, stencil: false, powerPreference: props.mobile ? "default" : "high-performance" }} fallback={fallback}
      onCreated={({ gl }) => {
        canvasRef.current = gl.domElement;
        gl.domElement.addEventListener("webglcontextlost", onContextLost, { once: true });
      }}>
      <Suspense fallback={null}><Gallery {...props} /></Suspense>
    </Canvas>
  </SceneErrorBoundary>;
});

export default GalleryScene;

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { 
  Heart, 
  Brain, 
  Activity, 
  Maximize2, 
  RotateCcw, 
  Layers, 
  Zap, 
  Sliders, 
  ChevronUp, 
  ChevronDown, 
  Eye, 
  EyeOff, 
  Info,
  Sparkles,
  Download
} from 'lucide-react';

export type OrganModelType = 'heart' | 'brain' | 'spine';

interface AnatomyPart {
  name: string;
  category: 'core' | 'vascular' | 'neural' | 'structural';
  mesh: THREE.Mesh | THREE.Group;
  initialPos: THREE.Vector3;
  explodeDirection: THREE.Vector3;
  color: string;
  description: string;
}

export const ThreeAnatomyViewer: React.FC<{
  initialOrgan?: OrganModelType;
  className?: string;
}> = ({ initialOrgan = 'heart', className = '' }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Active Organ State
  const [activeOrgan, setActiveOrgan] = useState<OrganModelType>(initialOrgan);
  const [explodedAmount, setExplodedAmount] = useState<number>(0);
  const [isBeating, setIsBeating] = useState<boolean>(true);
  const [bpm, setBpm] = useState<number>(72);
  const [wireframe, setWireframe] = useState<boolean>(false);
  const [layerFilter, setLayerFilter] = useState<'all' | 'core' | 'vascular' | 'structural'>('all');
  const [selectedPart, setSelectedPart] = useState<AnatomyPart | null>(null);
  const [isDockCollapsed, setIsDockCollapsed] = useState<boolean>(false);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(true);
  const [isSoftwareRenderer, setIsSoftwareRenderer] = useState<boolean>(false);

  // Internal Three.js references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const partsRef = useRef<AnatomyPart[]>([]);
  const animFrameId = useRef<number | null>(null);

  // Interaction controls state
  const isDraggingRef = useRef<boolean>(false);
  const prevPointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const cameraAngleRef = useRef<{ theta: number; phi: number; radius: number }>({
    theta: Math.PI / 4,
    phi: Math.PI / 3,
    radius: 7.5
  });
  const targetAngleRef = useRef<{ theta: number; phi: number; radius: number }>({
    theta: Math.PI / 4,
    phi: Math.PI / 3,
    radius: 7.5
  });

  // Procedural biological textures generator
  const createTissueBumpTexture = (type: 'cardiac' | 'cortex' | 'bone'): THREE.CanvasTexture => {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Base tone
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, size, size);

    if (type === 'cardiac') {
      // Myocardial striated fibrous noise
      for (let y = 0; y < size; y += 4) {
        ctx.strokeStyle = `rgba(${Math.floor(100 + Math.random() * 80)}, ${Math.floor(100 + Math.random() * 80)}, ${Math.floor(100 + Math.random() * 80)}, 0.35)`;
        ctx.lineWidth = 2 + Math.random() * 2;
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x < size; x += 16) {
          ctx.lineTo(x, y + Math.sin(x * 0.05) * 3);
        }
        ctx.stroke();
      }
      // Micro-capillary specks
      for (let i = 0; i < 400; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const r = Math.random() * 2.5;
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(230, 230, 230, 0.4)' : 'rgba(40, 40, 40, 0.4)';
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (type === 'cortex') {
      // Gyri & Sulci convolutions
      for (let i = 0; i < 80; i++) {
        ctx.strokeStyle = 'rgba(40, 40, 40, 0.5)';
        ctx.lineWidth = 6 + Math.random() * 8;
        ctx.lineCap = 'round';
        ctx.beginPath();
        let cx = Math.random() * size;
        let cy = Math.random() * size;
        ctx.moveTo(cx, cy);
        for (let s = 0; s < 5; s++) {
          cx += (Math.random() - 0.5) * 60;
          cy += (Math.random() - 0.5) * 60;
          ctx.lineTo(cx, cy);
        }
        ctx.stroke();
      }
    } else {
      // Osteocyte micro-porosity
      for (let i = 0; i < 800; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        ctx.fillStyle = Math.random() > 0.6 ? 'rgba(210, 210, 210, 0.5)' : 'rgba(50, 50, 50, 0.4)';
        ctx.beginPath();
        ctx.arc(x, y, 1 + Math.random() * 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  };

  // Radial contact shadow under models
  const createContactShadowMesh = (): THREE.Mesh => {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, 'rgba(5, 8, 20, 0.7)');
    grad.addColorStop(0.4, 'rgba(5, 8, 20, 0.35)');
    grad.addColorStop(0.8, 'rgba(5, 8, 20, 0.08)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(canvas);
    const geo = new THREE.PlaneGeometry(8, 8);
    const mat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = -2.8;
    return mesh;
  };

  // 1. Construct Procedural Anatomical Heart (8 parts)
  const buildHeartModel = (): { group: THREE.Group; parts: AnatomyPart[] } => {
    const group = new THREE.Group();
    const parts: AnatomyPart[] = [];
    const cardiacBump = createTissueBumpTexture('cardiac');

    // Part 1: Left Ventricle (Thick muscular apex)
    const lvGeo = new THREE.SphereGeometry(1.3, 32, 28);
    // Deform into tapered conical apex
    const posLv = lvGeo.attributes.position;
    for (let i = 0; i < posLv.count; i++) {
      const y = posLv.getY(i);
      if (y < 0) {
        const factor = 1 + y * 0.45;
        posLv.setX(i, posLv.getX(i) * Math.max(0.3, factor));
        posLv.setZ(i, posLv.getZ(i) * Math.max(0.3, factor));
      }
    }
    lvGeo.computeVertexNormals();

    const lvMat = new THREE.MeshStandardMaterial({
      color: 0x9b1b30,
      roughness: 0.35,
      metalness: 0.1,
      bumpMap: cardiacBump,
      bumpScale: 0.04
    });
    const lvMesh = new THREE.Mesh(lvGeo, lvMat);
    lvMesh.position.set(-0.55, -0.65, 0.1);
    lvMesh.scale.set(1.0, 1.35, 0.95);
    group.add(lvMesh);
    parts.push({
      name: 'Left Ventricle',
      category: 'core',
      mesh: lvMesh,
      initialPos: lvMesh.position.clone(),
      explodeDirection: new THREE.Vector3(-1.2, -0.6, 0.3).normalize(),
      color: '#9b1b30',
      description: 'Pumps oxygen-rich blood through aortic valve to systemic arterial circulation under 120 mmHg peak systolic pressure.'
    });

    // Part 2: Right Ventricle (Crescentic anterior pouch)
    const rvGeo = new THREE.SphereGeometry(1.15, 32, 28);
    const posRv = rvGeo.attributes.position;
    for (let i = 0; i < posRv.count; i++) {
      const y = posRv.getY(i);
      if (y < 0) {
        const factor = 1 + y * 0.4;
        posRv.setX(i, posRv.getX(i) * Math.max(0.35, factor));
      }
    }
    rvGeo.computeVertexNormals();
    const rvMat = new THREE.MeshStandardMaterial({
      color: 0x822433,
      roughness: 0.4,
      metalness: 0.1,
      bumpMap: cardiacBump,
      bumpScale: 0.04
    });
    const rvMesh = new THREE.Mesh(rvGeo, rvMat);
    rvMesh.position.set(0.65, -0.5, 0.25);
    rvMesh.scale.set(0.9, 1.2, 0.85);
    group.add(rvMesh);
    parts.push({
      name: 'Right Ventricle',
      category: 'core',
      mesh: rvMesh,
      initialPos: rvMesh.position.clone(),
      explodeDirection: new THREE.Vector3(1.2, -0.4, 0.4).normalize(),
      color: '#822433',
      description: 'Propels deoxygenated venous return through pulmonary trunk toward alveolar capillary beds at low resistance.'
    });

    // Part 3: Left Atrium
    const laGeo = new THREE.SphereGeometry(0.85, 24, 20);
    const laMat = new THREE.MeshStandardMaterial({
      color: 0xa83244,
      roughness: 0.4,
      metalness: 0.05,
      bumpMap: cardiacBump,
      bumpScale: 0.03
    });
    const laMesh = new THREE.Mesh(laGeo, laMat);
    laMesh.position.set(-0.6, 0.8, -0.3);
    group.add(laMesh);
    parts.push({
      name: 'Left Atrium',
      category: 'core',
      mesh: laMesh,
      initialPos: laMesh.position.clone(),
      explodeDirection: new THREE.Vector3(-0.9, 1.0, -0.6).normalize(),
      color: '#a83244',
      description: 'Receives oxygenated blood directly from four pulmonary veins, priming the left ventricle across the bicuspid valve.'
    });

    // Part 4: Right Atrium & Sinus Node Site
    const raGeo = new THREE.SphereGeometry(0.9, 24, 20);
    const raMat = new THREE.MeshStandardMaterial({
      color: 0x8f2d3d,
      roughness: 0.42,
      metalness: 0.05,
      bumpMap: cardiacBump,
      bumpScale: 0.03
    });
    const raMesh = new THREE.Mesh(raGeo, raMat);
    raMesh.position.set(0.85, 0.7, 0.1);
    group.add(raMesh);
    parts.push({
      name: 'Right Atrium (Sinoatrial Node)',
      category: 'core',
      mesh: raMesh,
      initialPos: raMesh.position.clone(),
      explodeDirection: new THREE.Vector3(1.1, 0.9, 0.2).normalize(),
      color: '#8f2d3d',
      description: 'Hosts the primary cardiac pacemaker (SA node), initiating regular 60–100 bpm autonomic action potentials.'
    });

    // Part 5: Aortic Arch
    const aortaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.2, 0.4, 0.0),
      new THREE.Vector3(-0.25, 1.4, 0.1),
      new THREE.Vector3(-0.1, 2.0, -0.1),
      new THREE.Vector3(0.5, 2.1, -0.3),
      new THREE.Vector3(0.9, 1.7, -0.5),
      new THREE.Vector3(0.95, 0.5, -0.6)
    ]);
    const aortaGeo = new THREE.TubeGeometry(aortaCurve, 40, 0.42, 18, false);
    const aortaMat = new THREE.MeshStandardMaterial({
      color: 0xd9383a,
      roughness: 0.25,
      metalness: 0.15,
      bumpMap: cardiacBump,
      bumpScale: 0.02
    });
    const aortaMesh = new THREE.Mesh(aortaGeo, aortaMat);
    group.add(aortaMesh);
    parts.push({
      name: 'Aortic Arch & Brachiocephalic Trunk',
      category: 'vascular',
      mesh: aortaMesh,
      initialPos: aortaMesh.position.clone(),
      explodeDirection: new THREE.Vector3(0.0, 1.4, -0.4).normalize(),
      color: '#d9383a',
      description: 'Highest-pressure systemic conduit distributing oxygenated blood to coronary, carotid, subclavian, and descending aorta.'
    });

    // Part 6: Pulmonary Trunk & Bifurcation
    const pulmCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.2, 0.5, 0.4),
      new THREE.Vector3(0.1, 1.3, 0.3),
      new THREE.Vector3(-0.3, 1.7, 0.0)
    ]);
    const pulmGeo = new THREE.TubeGeometry(pulmCurve, 24, 0.38, 16, false);
    const pulmMat = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      roughness: 0.3,
      metalness: 0.12
    });
    const pulmMesh = new THREE.Mesh(pulmGeo, pulmMat);
    group.add(pulmMesh);
    parts.push({
      name: 'Pulmonary Trunk',
      category: 'vascular',
      mesh: pulmMesh,
      initialPos: pulmMesh.position.clone(),
      explodeDirection: new THREE.Vector3(-0.5, 1.1, 0.8).normalize(),
      color: '#3b82f6',
      description: 'Arises from the right ventricle anterior to aorta, dividing into left and right pulmonary branches.'
    });

    // Part 7: Superior & Inferior Vena Cava
    const cavaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(1.1, 2.0, -0.1),
      new THREE.Vector3(1.0, 0.8, 0.0),
      new THREE.Vector3(0.9, -1.2, -0.2)
    ]);
    const cavaGeo = new THREE.TubeGeometry(cavaCurve, 28, 0.34, 16, false);
    const cavaMat = new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      roughness: 0.35,
      metalness: 0.1
    });
    const cavaMesh = new THREE.Mesh(cavaGeo, cavaMat);
    group.add(cavaMesh);
    parts.push({
      name: 'Superior & Inferior Vena Cava',
      category: 'vascular',
      mesh: cavaMesh,
      initialPos: cavaMesh.position.clone(),
      explodeDirection: new THREE.Vector3(1.3, 0.4, -0.3).normalize(),
      color: '#2563eb',
      description: 'Collects systemic deoxygenated venous return from head, limbs, and abdominal viscera into the right atrium.'
    });

    // Part 8: Left Anterior Descending (LAD) Coronary Artery
    const ladCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.2, 0.7, 0.6),
      new THREE.Vector3(-0.15, 0.1, 0.85),
      new THREE.Vector3(-0.35, -0.5, 0.75),
      new THREE.Vector3(-0.5, -1.2, 0.3)
    ]);
    const ladGeo = new THREE.TubeGeometry(ladCurve, 32, 0.08, 10, false);
    const ladMat = new THREE.MeshStandardMaterial({
      color: 0xff4d4f,
      roughness: 0.2,
      metalness: 0.2
    });
    const ladMesh = new THREE.Mesh(ladGeo, ladMat);
    group.add(ladMesh);
    parts.push({
      name: 'Left Anterior Descending (LAD) Artery',
      category: 'vascular',
      mesh: ladMesh,
      initialPos: ladMesh.position.clone(),
      explodeDirection: new THREE.Vector3(-0.6, -0.4, 1.2).normalize(),
      color: '#ff4d4f',
      description: 'Crucial clinical vessel ("widow-maker") supplying anterior interventricular septum and apex myocardium.'
    });

    return { group, parts };
  };

  // 2. Construct Procedural Anatomical Brain (6 parts)
  const buildBrainModel = (): { group: THREE.Group; parts: AnatomyPart[] } => {
    const group = new THREE.Group();
    const parts: AnatomyPart[] = [];
    const cortexBump = createTissueBumpTexture('cortex');

    // Part 1: Left Cerebral Hemisphere
    const leftHemiGeo = new THREE.SphereGeometry(1.6, 36, 32);
    const posLh = leftHemiGeo.attributes.position;
    for (let i = 0; i < posLh.count; i++) {
      let x = posLh.getX(i);
      let y = posLh.getY(i);
      let z = posLh.getZ(i);
      // Flatten medial sagittal fissure
      if (x > 0.05) x = 0.05 + x * 0.1;
      // Elongate front-to-back
      z = z * 1.35;
      y = y * 1.05;
      posLh.setXYZ(i, x, y, z);
    }
    leftHemiGeo.computeVertexNormals();

    const leftHemiMat = new THREE.MeshStandardMaterial({
      color: 0xd9b3a8,
      roughness: 0.45,
      metalness: 0.05,
      bumpMap: cortexBump,
      bumpScale: 0.08
    });
    const leftHemiMesh = new THREE.Mesh(leftHemiGeo, leftHemiMat);
    leftHemiMesh.position.set(-0.75, 0.4, 0);
    group.add(leftHemiMesh);
    parts.push({
      name: 'Left Cerebral Hemisphere',
      category: 'core',
      mesh: leftHemiMesh,
      initialPos: leftHemiMesh.position.clone(),
      explodeDirection: new THREE.Vector3(-1.4, 0.2, 0.0).normalize(),
      color: '#d9b3a8',
      description: 'Governs analytical processing, verbal syntax, sequential logic, and motor cortex control of the right hemibody.'
    });

    // Part 2: Right Cerebral Hemisphere
    const rightHemiGeo = new THREE.SphereGeometry(1.6, 36, 32);
    const posRh = rightHemiGeo.attributes.position;
    for (let i = 0; i < posRh.count; i++) {
      let x = posRh.getX(i);
      let y = posRh.getY(i);
      let z = posRh.getZ(i);
      if (x < -0.05) x = -0.05 + x * 0.1;
      z = z * 1.35;
      y = y * 1.05;
      posRh.setXYZ(i, x, y, z);
    }
    rightHemiGeo.computeVertexNormals();

    const rightHemiMat = new THREE.MeshStandardMaterial({
      color: 0xd4ada3,
      roughness: 0.45,
      metalness: 0.05,
      bumpMap: cortexBump,
      bumpScale: 0.08
    });
    const rightHemiMesh = new THREE.Mesh(rightHemiGeo, rightHemiMat);
    rightHemiMesh.position.set(0.75, 0.4, 0);
    group.add(rightHemiMesh);
    parts.push({
      name: 'Right Cerebral Hemisphere',
      category: 'core',
      mesh: rightHemiMesh,
      initialPos: rightHemiMesh.position.clone(),
      explodeDirection: new THREE.Vector3(1.4, 0.2, 0.0).normalize(),
      color: '#d4ada3',
      description: 'Coordinates spatial reasoning, somatic intuition, facial recognition, and prosody processing across cortical circuits.'
    });

    // Part 3: Cerebellum (Fine folia structure)
    const cereGeo = new THREE.SphereGeometry(1.05, 30, 24);
    cereGeo.scale(1.3, 0.8, 0.9);
    const cereMat = new THREE.MeshStandardMaterial({
      color: 0xc4968c,
      roughness: 0.5,
      metalness: 0.08,
      bumpMap: cortexBump,
      bumpScale: 0.06
    });
    const cereMesh = new THREE.Mesh(cereGeo, cereMat);
    cereMesh.position.set(0, -0.85, -1.25);
    group.add(cereMesh);
    parts.push({
      name: 'Cerebellum & Arbor Vitae',
      category: 'neural',
      mesh: cereMesh,
      initialPos: cereMesh.position.clone(),
      explodeDirection: new THREE.Vector3(0.0, -0.8, -1.4).normalize(),
      color: '#c4968c',
      description: 'Contains over 50% of the entire brain’s neurons, calibrating smooth motor coordination, equilibrium, and proprioception.'
    });

    // Part 4: Brainstem (Pons & Medulla Oblongata)
    const stemCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.1, -0.3),
      new THREE.Vector3(0, -0.7, -0.4),
      new THREE.Vector3(0, -1.7, -0.55),
      new THREE.Vector3(0, -2.5, -0.7)
    ]);
    const stemGeo = new THREE.TubeGeometry(stemCurve, 32, 0.48, 18, false);
    const stemMat = new THREE.MeshStandardMaterial({
      color: 0xe0c0b5,
      roughness: 0.35,
      metalness: 0.05
    });
    const stemMesh = new THREE.Mesh(stemGeo, stemMat);
    group.add(stemMesh);
    parts.push({
      name: 'Brainstem (Pons & Medulla Oblongata)',
      category: 'structural',
      mesh: stemMesh,
      initialPos: stemMesh.position.clone(),
      explodeDirection: new THREE.Vector3(0.0, -1.4, 0.1).normalize(),
      color: '#e0c0b5',
      description: 'Essential vital autonomic control hub sustaining involuntary cardiac pacing, respiratory drive, and vasomotor tone.'
    });

    // Part 5: Corpus Callosum (Central Commissural Core)
    const ccCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.1, -0.9),
      new THREE.Vector3(0, 0.65, -0.2),
      new THREE.Vector3(0, 0.6, 0.6),
      new THREE.Vector3(0, 0.1, 0.9)
    ]);
    const ccGeo = new THREE.TubeGeometry(ccCurve, 28, 0.28, 14, false);
    const ccMat = new THREE.MeshStandardMaterial({
      color: 0xf3ebe2,
      roughness: 0.25,
      metalness: 0.1
    });
    const ccMesh = new THREE.Mesh(ccGeo, ccMat);
    group.add(ccMesh);
    parts.push({
      name: 'Corpus Callosum',
      category: 'neural',
      mesh: ccMesh,
      initialPos: ccMesh.position.clone(),
      explodeDirection: new THREE.Vector3(0.0, 1.2, 0.0).normalize(),
      color: '#f3ebe2',
      description: 'Dense tract of >200 million myelinated axonal fibers enabling interhemispheric transfer and bilateral synchronization.'
    });

    // Part 6: Circle of Willis & Cerebral Vasculature
    const circleGeo = new THREE.TorusGeometry(0.55, 0.08, 12, 28);
    const circleMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      roughness: 0.2,
      metalness: 0.25
    });
    const circleMesh = new THREE.Mesh(circleGeo, circleMat);
    circleMesh.rotation.x = Math.PI / 2;
    circleMesh.position.set(0, -0.3, -0.2);
    group.add(circleMesh);
    parts.push({
      name: 'Circle of Willis (Arterial Anastomosis)',
      category: 'vascular',
      mesh: circleMesh,
      initialPos: circleMesh.position.clone(),
      explodeDirection: new THREE.Vector3(0.0, -0.6, 0.8).normalize(),
      color: '#ef4444',
      description: 'Heptagonal arterial ring equalizing intracranial perfusion between anterior internal carotids and posterior basilar systems.'
    });

    return { group, parts };
  };

  // 3. Construct Procedural Anatomical Spine & Vertebrae (7 parts)
  const buildSpineModel = (): { group: THREE.Group; parts: AnatomyPart[] } => {
    const group = new THREE.Group();
    const parts: AnatomyPart[] = [];
    const boneBump = createTissueBumpTexture('bone');

    const boneMat = new THREE.MeshStandardMaterial({
      color: 0xe6dec8,
      roughness: 0.45,
      metalness: 0.05,
      bumpMap: boneBump,
      bumpScale: 0.04
    });

    const discMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.3,
      metalness: 0.1
    });

    // Part 1: Cervical Vertebrae (C1-C7)
    const cervGroup = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const v = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.58, 0.32, 18), boneMat);
      v.position.y = 1.9 - i * 0.45;
      v.position.z = Math.sin(i * 0.4) * 0.1;
      cervGroup.add(v);

      const d = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.1, 18), discMat);
      d.position.y = 1.7 - i * 0.45;
      cervGroup.add(d);
    }
    group.add(cervGroup);
    parts.push({
      name: 'Cervical Spine (Lordotic Curve)',
      category: 'structural',
      mesh: cervGroup,
      initialPos: cervGroup.position.clone(),
      explodeDirection: new THREE.Vector3(0.0, 1.2, 0.2).normalize(),
      color: '#e6dec8',
      description: 'High-mobility cervical segment supporting skull articulation and protecting vertebral arteries and upper spinal cord.'
    });

    // Part 2: Thoracic Vertebrae (T1-T12) & Rib Articulation
    const thorGroup = new THREE.Group();
    for (let i = 0; i < 5; i++) {
      const v = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.75, 0.38, 20), boneMat);
      v.position.y = 0.0 - i * 0.48;
      v.position.z = -Math.sin(i * 0.3) * 0.2;
      thorGroup.add(v);

      const d = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.68, 0.11, 20), discMat);
      d.position.y = -0.2 - i * 0.48;
      thorGroup.add(d);
    }
    group.add(thorGroup);
    parts.push({
      name: 'Thoracic Vertebrae & Kyphosis',
      category: 'structural',
      mesh: thorGroup,
      initialPos: thorGroup.position.clone(),
      explodeDirection: new THREE.Vector3(0.0, 0.3, -0.9).normalize(),
      color: '#ded4bc',
      description: 'Anchors rib cage protecting mediastinum, with limited rotational and flexion degrees of freedom.'
    });

    // Part 3: Lumbar Vertebrae (L1-L5)
    const lumbGroup = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const v = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.95, 0.45, 20), boneMat);
      v.position.y = -2.3 - i * 0.55;
      v.position.z = Math.sin(i * 0.3) * 0.15;
      lumbGroup.add(v);

      const d = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.14, 20), discMat);
      d.position.y = -2.55 - i * 0.55;
      lumbGroup.add(d);
    }
    group.add(lumbGroup);
    parts.push({
      name: 'Lumbar Spine (L1–L5 Weight Bearing)',
      category: 'structural',
      mesh: lumbGroup,
      initialPos: lumbGroup.position.clone(),
      explodeDirection: new THREE.Vector3(0.0, -1.0, 0.5).normalize(),
      color: '#d4c9af',
      description: 'Massive vertebral bodies designed to absorb compressive axial load and shock during bipedal ambulation.'
    });

    // Part 4: Spinal Cord & Cauda Equina
    const cordGeo = new THREE.CylinderGeometry(0.18, 0.14, 6.2, 16);
    const cordMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      roughness: 0.25,
      metalness: 0.1,
      emissive: 0xca8a04,
      emissiveIntensity: 0.2
    });
    const cordMesh = new THREE.Mesh(cordGeo, cordMat);
    cordMesh.position.set(0, -0.9, -0.15);
    group.add(cordMesh);
    parts.push({
      name: 'Spinal Cord & Cauda Equina',
      category: 'neural',
      mesh: cordMesh,
      initialPos: cordMesh.position.clone(),
      explodeDirection: new THREE.Vector3(0.0, 0.0, -1.2).normalize(),
      color: '#fef08a',
      description: 'Conveys afferent sensory impulses to brain and efferent somatic signals to peripheral spinal nerves.'
    });

    // Part 5: Ribcage Lateral Arches (Left)
    const ribsLeft = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const ribCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.4, 0.2 - i * 0.45, -0.2),
        new THREE.Vector3(-1.6, 0.1 - i * 0.45, 0.4),
        new THREE.Vector3(-1.3, -0.1 - i * 0.45, 1.2),
        new THREE.Vector3(-0.3, -0.2 - i * 0.45, 1.4)
      ]);
      const r = new THREE.Mesh(new THREE.TubeGeometry(ribCurve, 20, 0.09, 10, false), boneMat);
      ribsLeft.add(r);
    }
    group.add(ribsLeft);
    parts.push({
      name: 'Left Costal Rib Arches',
      category: 'structural',
      mesh: ribsLeft,
      initialPos: ribsLeft.position.clone(),
      explodeDirection: new THREE.Vector3(-1.3, 0.0, 0.6).normalize(),
      color: '#e2d7be',
      description: 'True ribs articulating with thoracic spine and sternal cartilage to expand intrapleural negative pressure.'
    });

    // Part 6: Ribcage Lateral Arches (Right)
    const ribsRight = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const ribCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.4, 0.2 - i * 0.45, -0.2),
        new THREE.Vector3(1.6, 0.1 - i * 0.45, 0.4),
        new THREE.Vector3(1.3, -0.1 - i * 0.45, 1.2),
        new THREE.Vector3(0.3, -0.2 - i * 0.45, 1.4)
      ]);
      const r = new THREE.Mesh(new THREE.TubeGeometry(ribCurve, 20, 0.09, 10, false), boneMat);
      ribsRight.add(r);
    }
    group.add(ribsRight);
    parts.push({
      name: 'Right Costal Rib Arches',
      category: 'structural',
      mesh: ribsRight,
      initialPos: ribsRight.position.clone(),
      explodeDirection: new THREE.Vector3(1.3, 0.0, 0.6).normalize(),
      color: '#e2d7be',
      description: 'Right lateral thoracic wall providing rigid protective shielding for hepatic and pulmonary lobes.'
    });

    // Part 7: Anterior Sternal Plate
    const sternumGeo = new THREE.BoxGeometry(0.38, 1.8, 0.14);
    const sternumMesh = new THREE.Mesh(sternumGeo, boneMat);
    sternumMesh.position.set(0, -0.35, 1.4);
    group.add(sternumMesh);
    parts.push({
      name: 'Sternum (Manubrium & Body)',
      category: 'structural',
      mesh: sternumMesh,
      initialPos: sternumMesh.position.clone(),
      explodeDirection: new THREE.Vector3(0.0, 0.1, 1.3).normalize(),
      color: '#e5dcbf',
      description: 'Anterior landmark for cardiac chest compressions (CPR) and primary anterior chest plate closure.'
    });

    return { group, parts };
  };

  // Main Scene Lifecycle
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 560;

    // 1. Detect software renderer
    try {
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          const rendererStr = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL).toLowerCase();
          if (rendererStr.includes('swiftshader') || rendererStr.includes('llvmpipe') || rendererStr.includes('software')) {
            setIsSoftwareRenderer(true);
          }
        }
      }
    } catch (e) {
      // safe fallback
    }

    // 2. Renderer setup with ACESFilmicToneMapping
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;

    // 3. Scene and synthetic PBR environment
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1d);
    scene.fog = new THREE.FogExp2(0x0a0f1d, 0.05);
    sceneRef.current = scene;

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const roomEnv = new RoomEnvironment();
    const envTexture = pmremGenerator.fromScene(roomEnv, 0.04).texture;
    scene.environment = envTexture;
    roomEnv.dispose();
    pmremGenerator.dispose();

    // 4. Studio lights: warm directional key + cool hemisphere fill + sharp rim
    const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.4);
    keyLight.position.set(5, 8, 6);
    scene.add(keyLight);

    const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x0f172a, 1.2);
    scene.add(hemiLight);

    const rimLight = new THREE.DirectionalLight(0x60a5fa, 1.8);
    rimLight.position.set(-6, -2, -6);
    scene.add(rimLight);

    // 5. Contact shadow plane
    const shadow = createContactShadowMesh();
    scene.add(shadow);

    // 6. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    cameraRef.current = camera;

    // 7. Assemble active organ
    let built: { group: THREE.Group; parts: AnatomyPart[] };
    if (activeOrgan === 'heart') {
      built = buildHeartModel();
    } else if (activeOrgan === 'brain') {
      built = buildBrainModel();
    } else {
      built = buildSpineModel();
    }

    modelGroupRef.current = built.group;
    partsRef.current = built.parts;
    scene.add(built.group);
    setSelectedPart(built.parts[0] || null);

    // 8. Damped Render Loop
    let clock = new THREE.Clock();
    const renderLoop = () => {
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Camera Damping (Spherical interpolation)
      if (isAutoRotating && !isDraggingRef.current) {
        targetAngleRef.current.theta += delta * 0.35;
      }

      // Smooth damp
      const lerpFactor = 0.08;
      cameraAngleRef.current.theta += (targetAngleRef.current.theta - cameraAngleRef.current.theta) * lerpFactor;
      cameraAngleRef.current.phi += (targetAngleRef.current.phi - cameraAngleRef.current.phi) * lerpFactor;
      cameraAngleRef.current.radius += (targetAngleRef.current.radius - cameraAngleRef.current.radius) * lerpFactor;

      // Restrict phi to avoid gimbal lock
      cameraAngleRef.current.phi = Math.max(0.15, Math.min(Math.PI - 0.15, cameraAngleRef.current.phi));

      const { theta, phi, radius } = cameraAngleRef.current;
      camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
      camera.position.y = radius * Math.cos(phi);
      camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
      camera.lookAt(0, 0, 0);

      // Physiological Heartbeat / Respiratory Pulse
      if (isBeating && modelGroupRef.current) {
        const beatFrequency = (bpm / 60) * Math.PI * 2;
        // Dual-phase cardiac contraction (systole spike + recoil)
        const t = elapsed * beatFrequency;
        const pulse = Math.pow(Math.sin(t), 8) * 0.08 + Math.sin(t * 2) * 0.02;

        if (activeOrgan === 'heart') {
          modelGroupRef.current.scale.set(1 + pulse * 1.2, 1 - pulse * 0.8, 1 + pulse * 1.2);
        } else if (activeOrgan === 'brain') {
          // Slow intracranial pulse
          const brainPulse = Math.sin(elapsed * 1.8) * 0.015;
          modelGroupRef.current.scale.set(1 + brainPulse, 1 + brainPulse, 1 + brainPulse);
        } else {
          // Gentle respiratory spinal motion
          const spineFlex = Math.sin(elapsed * 1.2) * 0.01;
          modelGroupRef.current.scale.set(1, 1 + spineFlex, 1);
        }
      }

      renderer.render(scene, camera);
      animFrameId.current = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    // 9. Resize Observer
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const nw = containerRef.current.clientWidth;
      const nh = containerRef.current.clientHeight || 560;
      cameraRef.current.aspect = nw / nh;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(nw, nh);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      renderer.dispose();
      envTexture.dispose();
    };
  }, [activeOrgan]);

  // Update exploded distance
  useEffect(() => {
    partsRef.current.forEach((part) => {
      const targetPos = part.initialPos.clone().add(part.explodeDirection.clone().multiplyScalar(explodedAmount * 2.2));
      part.mesh.position.copy(targetPos);
    });
  }, [explodedAmount]);

  // Wireframe toggle
  useEffect(() => {
    partsRef.current.forEach((part) => {
      part.mesh.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
          if (mat) mat.wireframe = wireframe;
        }
      });
    });
  }, [wireframe]);

  // Layer filtering
  useEffect(() => {
    partsRef.current.forEach((part) => {
      const visible = layerFilter === 'all' || part.category === layerFilter;
      part.mesh.visible = visible;
    });
  }, [layerFilter]);

  // Pointer Interaction Handlers for smooth Orbit Damping
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    prevPointerRef.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - prevPointerRef.current.x;
    const dy = e.clientY - prevPointerRef.current.y;
    prevPointerRef.current = { x: e.clientX, y: e.clientY };

    targetAngleRef.current.theta -= dx * 0.008;
    targetAngleRef.current.phi -= dy * 0.008;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    targetAngleRef.current.radius = Math.max(3.5, Math.min(14.0, targetAngleRef.current.radius + e.deltaY * 0.008));
  };

  // Raycasting for clicking anatomical parts
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !cameraRef.current || !sceneRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);

    const meshes: THREE.Mesh[] = [];
    partsRef.current.forEach((p) => {
      p.mesh.traverse((child) => {
        if ((child as THREE.Mesh).isMesh && p.mesh.visible) {
          (child as any).__anatomyPart = p;
          meshes.push(child as THREE.Mesh);
        }
      });
    });

    const intersects = raycaster.intersectObjects(meshes, false);
    if (intersects.length > 0) {
      const part = (intersects[0].object as any).__anatomyPart;
      if (part) {
        setSelectedPart(part);
      }
    }
  };

  const resetView = () => {
    targetAngleRef.current = {
      theta: Math.PI / 4,
      phi: Math.PI / 3,
      radius: 7.5
    };
    setExplodedAmount(0);
    setIsAutoRotating(true);
  };

  const takeSnapshot = () => {
    if (!rendererRef.current) return;
    const dataUrl = rendererRef.current.domElement.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `doctorian-3d-${activeOrgan}-${Date.now()}.png`;
    a.click();
  };

  return (
    <div className={`relative w-full h-[640px] sm:h-[720px] bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col select-none ${className}`}>
      
      {/* Top Header Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        
        {/* Model Presets Selector */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-900/90 border border-slate-700/80 rounded-2xl shadow-xl pointer-events-auto">
          <button
            onClick={() => setActiveOrgan('heart')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeOrgan === 'heart'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Heart size={14} className={activeOrgan === 'heart' ? 'fill-white' : ''} />
            <span>3D Heart</span>
          </button>

          <button
            onClick={() => setActiveOrgan('brain')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeOrgan === 'brain'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Brain size={14} />
            <span>3D Brain</span>
          </button>

          <button
            onClick={() => setActiveOrgan('spine')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeOrgan === 'spine'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers size={14} />
            <span>3D Spine & Ribs</span>
          </button>
        </div>

        {/* Quick View Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Heartbeat toggle */}
          <button
            onClick={() => setIsBeating(!isBeating)}
            className={`p-2 rounded-xl border transition-all ${
              isBeating
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                : 'bg-slate-900/80 border-slate-700 text-slate-400'
            }`}
            title="Toggle Physiological Pulse"
          >
            <Activity size={16} className={isBeating ? 'animate-pulse' : ''} />
          </button>

          {/* Wireframe toggle */}
          <button
            onClick={() => setWireframe(!wireframe)}
            className={`p-2 rounded-xl border transition-all ${
              wireframe
                ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                : 'bg-slate-900/80 border-slate-700 text-slate-400'
            }`}
            title="Toggle Wireframe CAD Mode"
          >
            <Zap size={16} />
          </button>

          {/* Reset Camera */}
          <button
            onClick={resetView}
            className="p-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
            title="Reset View Orientation"
          >
            <RotateCcw size={16} />
          </button>

          {/* Snapshot Export */}
          <button
            onClick={takeSnapshot}
            className="p-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
            title="Export 4K Clinical Screenshot"
          >
            <Download size={16} />
          </button>
        </div>
      </div>

      {/* Selected Part Clinical Detail Badge */}
      {selectedPart && (
        <div className="absolute top-20 left-4 max-w-xs sm:max-w-sm z-20 p-4 bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl pointer-events-auto">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
              {selectedPart.category}
            </span>
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selectedPart.color }} />
          </div>
          <h4 className="text-sm font-black text-white">{selectedPart.name}</h4>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">{selectedPart.description}</p>
        </div>
      )}

      {/* Main WebGL Canvas */}
      <div ref={containerRef} className="w-full flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onWheel={handleWheel}
          onClick={handleCanvasClick}
          className="w-full h-full block"
        />

        {/* Floating Rotation Indicator */}
        <div className="absolute bottom-20 right-4 z-10 pointer-events-none text-[11px] text-slate-400 font-mono bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
          Drag to rotate • Scroll to zoom
        </div>
      </div>

      {/* Collapsible Bottom Dock (< 15% viewport footprint, solid background, NO backdrop-filter) */}
      <div className="relative z-20 w-full bg-slate-900 border-t border-slate-800 px-4 py-2.5 transition-all">
        <div className="flex items-center justify-between gap-4">
          
          {/* Dock Collapse Toggle */}
          <button
            onClick={() => setIsDockCollapsed(!isDockCollapsed)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            <Sliders size={14} className="text-blue-400" />
            <span>Dissection Controls</span>
            {isDockCollapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {/* Quick Layer Filter Badges */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {(['all', 'core', 'vascular', 'structural'] as const).map((layer) => (
              <button
                key={layer}
                onClick={() => setLayerFilter(layer)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase transition-all ${
                  layerFilter === layer
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {layer}
              </button>
            ))}
          </div>

          {/* Auto rotate toggle */}
          <button
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
              isAutoRotating ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
            }`}
          >
            Auto Orbit: {isAutoRotating ? 'ON' : 'PAUSED'}
          </button>
        </div>

        {/* Expanded Controls Drawer */}
        {!isDockCollapsed && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2.5 mt-2 border-t border-slate-800/80">
            {/* Exploded View Slider */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[11px] font-bold text-slate-300">
                <span>Exploded View Slicing</span>
                <span className="font-mono text-blue-400">{Math.round(explodedAmount * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={explodedAmount}
                onChange={(e) => setExplodedAmount(parseFloat(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Physiological Pulse Rate */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[11px] font-bold text-slate-300">
                <span>Dynamic Frequency (BPM)</span>
                <span className="font-mono text-rose-400">{bpm} bpm</span>
              </div>
              <input
                type="range"
                min="40"
                max="160"
                step="1"
                value={bpm}
                onChange={(e) => setBpm(parseInt(e.target.value, 10))}
                className="w-full accent-rose-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Anatomical Parts Quick Select */}
            <div className="flex items-center gap-1.5 overflow-x-auto sm:col-span-2 lg:col-span-1">
              {partsRef.current.map((part) => (
                <button
                  key={part.name}
                  onClick={() => setSelectedPart(part)}
                  className={`px-2 py-1 rounded text-[10px] font-medium whitespace-nowrap transition-colors ${
                    selectedPart?.name === part.name
                      ? 'bg-slate-700 text-white ring-1 ring-blue-400'
                      : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {part.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

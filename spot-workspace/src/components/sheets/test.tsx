import { h, type FunctionComponent } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';

declare global {
  interface Window {
    THREE: any;
  }
}

export const Test: FunctionComponent = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedBoxName, setSelectedBoxName] = useState<string>('');
  const [boxDimensions, setBoxDimensions] = useState<{ w: number; h: number; d: number } | null>(null);
  const [rebarCount, setRebarCount] = useState<number>(0);
  const [stirrupPitch, setStirrupPitch] = useState<number>(250); // 띠철근 간격 (mm)

  const sceneRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const currentModelRef = useRef<any>(null);
  const activeRebarGroupRef = useRef<any>(null);
  const lastTargetMeshRef = useRef<any>(null);
  const originalMatRef = useRef<any>(null);

  useEffect(() => {
    const THREE = window.THREE;
    if (!THREE || !THREE.GLTFLoader) return;

    const container = mountRef.current;
    if (!container) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0xf1f5f9);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    cameraRef.current = camera;
    camera.position.set(10, 8, 12);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    const ambLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambLight);

    const dirLight = new THREE.DirectionalLight(0xfffaed, 1.8);
    dirLight.position.set(15, 25, 15);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const grid = new THREE.GridHelper(30, 30, 0x94a3b8, 0xcbd5e1);
    scene.add(grid);

    // 카메라 회전 조작
    let isMouseDown = false;
    let startX = 0, startY = 0;
    let lastX = 0, lastY = 0;
    const lookTarget = new THREE.Vector3(0, 1.5, 0);
    camera.lookAt(lookTarget);

    const onMouseDown = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('.hud-panel')) return;
      isMouseDown = true;
      startX = e.clientX;
      startY = e.clientY;
      lastX = e.clientX;
      lastY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isMouseDown) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;

      const offset = camera.position.clone().sub(lookTarget);
      const radius = offset.length();
      let theta = Math.atan2(offset.x, offset.z) - dx * 0.005;
      let phi = Math.acos(Math.min(Math.max(offset.y / radius, -1), 1)) - dy * 0.005;
      phi = Math.min(Math.max(phi, 0.05), Math.PI / 2 - 0.02);

      camera.position.x = lookTarget.x + radius * Math.sin(phi) * Math.sin(theta);
      camera.position.y = lookTarget.y + radius * Math.cos(phi);
      camera.position.z = lookTarget.z + radius * Math.sin(phi) * Math.cos(theta);
      camera.lookAt(lookTarget);
    };

    // 박스 클릭 이벤트 핸들러
    const onMouseUp = (e: MouseEvent) => {
      isMouseDown = false;
      if ((e.target as HTMLElement).closest('.hud-panel')) return;

      const moveDist = Math.hypot(e.clientX - startX, e.clientY - startY);
      if (moveDist > 5 || !currentModelRef.current) return;

      const rect = container.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / width) * 2 - 1,
        -((e.clientY - rect.top) / height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(currentModelRef.current.children, true);

      if (intersects.length > 0) {
        const hitMesh = intersects[0].object as any;
        generateRebarInsideBox(hitMesh);
      }
    };

    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('wheel', (e) => {
      e.preventDefault();
      const dir = camera.position.clone().sub(lookTarget).normalize();
      camera.position.addScaledVector(dir, e.deltaY * 0.015);
    }, { passive: false });

    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  // 선택된 박스를 읽어와 내부 철근 자동 모델링
  const generateRebarInsideBox = (mesh: any) => {
    const THREE = window.THREE;
    const scene = sceneRef.current;
    if (!THREE || !scene) return;

    // 이전 철근 모델 제거 및 기존 메시 복구
    if (activeRebarGroupRef.current) {
      scene.remove(activeRebarGroupRef.current);
      activeRebarGroupRef.current = null;
    }
    if (lastTargetMeshRef.current && originalMatRef.current) {
      lastTargetMeshRef.current.material = originalMatRef.current;
    }

    // 1. 박스 정보 읽기
    const box = new THREE.Box3().setFromObject(mesh);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    const w = size.x;
    const h = size.y;
    const d = size.z;

    setBoxDimensions({ w: Number(w.toFixed(2)), h: Number(h.toFixed(2)), d: Number(d.toFixed(2)) });
    setSelectedBoxName(mesh.name || mesh.parent?.name || 'Selected_Box');

    // 2. 스케치업 박스를 반투명 X-Ray 콘크리트로 전환
    originalMatRef.current = mesh.material;
    mesh.material = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.28,
      roughness: 0.3,
      depthWrite: false
    });
    lastTargetMeshRef.current = mesh;

    // 3. 내부 배근 파라메트릭 생성
    const rebarGroup = new THREE.Group();
    const cover = 0.05; // 50mm 피복두께
    const mainRebarRadius = 0.012; // D25 철근 (반경 12mm)
    const stirrupRadius = 0.005;   // D10 띠철근 (반경 5mm)

    const effW = Math.max(0.05, w - cover * 2);
    const effD = Math.max(0.05, d - cover * 2);
    const effH = Math.max(0.05, h - cover * 2);

    const rebarMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, metalness: 0.8 }); // 주철근 (어두운 메탈)
    const tieMat = new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.4, metalness: 0.6 });   // 늑근 (빨간색)

    let totalBarCount = 0;

    // 3-1. 수직 주철근 (4개 모서리 배치)
    const cornerOffsets = [
      [-effW / 2, -effD / 2],
      [effW / 2, -effD / 2],
      [effW / 2, effD / 2],
      [-effW / 2, effD / 2]
    ];

    const mainBarGeo = new THREE.CylinderGeometry(mainRebarRadius, mainRebarRadius, effH, 12);
    cornerOffsets.forEach(([ox, oz]) => {
      const bar = new THREE.Mesh(mainBarGeo, rebarMat);
      bar.position.set(center.x + ox, center.y, center.z + oz);
      bar.castShadow = true;
      rebarGroup.add(bar);
      totalBarCount++;
    });

    // 3-2. 사각 둘레를 감싸는 띠철근 (Stirrups) 일정한 피치 간격으로 적층
    const pitchM = stirrupPitch / 1000;
    const stirrupLayers = Math.floor(effH / pitchM);

    for (let i = 0; i <= stirrupLayers; i++) {
      const currentY = center.y - effH / 2 + i * pitchM;

      // 사각형 루프 경로
      const halfW = effW / 2;
      const halfD = effD / 2;
      const curvePath = new THREE.CurvePath();

      const p1 = new THREE.Vector3(-halfW, 0, -halfD);
      const p2 = new THREE.Vector3(halfW, 0, -halfD);
      const p3 = new THREE.Vector3(halfW, 0, halfD);
      const p4 = new THREE.Vector3(-halfW, 0, halfD);

      curvePath.add(new THREE.LineCurve3(p1, p2));
      curvePath.add(new THREE.LineCurve3(p2, p3));
      curvePath.add(new THREE.LineCurve3(p3, p4));
      curvePath.add(new THREE.LineCurve3(p4, p1));

      const tieGeo = new THREE.TubeGeometry(curvePath, 32, stirrupRadius, 8, true);
      const tieMesh = new THREE.Mesh(tieGeo, tieMat);
      tieMesh.position.set(center.x, currentY, center.z);
      rebarGroup.add(tieMesh);
      totalBarCount++;
    }

    scene.add(rebarGroup);
    activeRebarGroupRef.current = rebarGroup;
    setRebarCount(totalBarCount);
  };

  // 로컬 GLB 로더
  const loadGlb = (file: File) => {
    const THREE = window.THREE;
    const scene = sceneRef.current;
    if (!THREE || !scene) return;

    if (currentModelRef.current) scene.remove(currentModelRef.current);
    if (activeRebarGroupRef.current) scene.remove(activeRebarGroupRef.current);

    const localUrl = URL.createObjectURL(file);
    const loader = new THREE.GLTFLoader();

    loader.load(localUrl, (gltf: any) => {
      const model = gltf.scene;

      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      model.position.x -= center.x;
      model.position.z -= center.z;
      model.position.y -= box.min.y;

      model.traverse((child: any) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      scene.add(model);
      currentModelRef.current = model;
      URL.revokeObjectURL(localUrl);
    });
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', overflow: 'hidden', userSelect: 'none' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

      <input
        ref={fileInputRef}
        type="file"
        accept=".glb"
        style={{ display: 'none' }}
        onChange={(e: any) => e.target.files?.[0] && loadGlb(e.target.files[0])}
      />

      {/* 좌상단 제어 패널 */}
      <div
        className="hud-panel"
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: 'rgba(255, 255, 255, 0.9)',
          border: '1px solid #cbd5e1',
          borderRadius: '12px',
          padding: '16px 20px',
          color: '#0f172a',
          width: '280px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(8px)',
          fontFamily: 'sans-serif'
        }}
      >
        <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#0284c7', marginBottom: '8px' }}>
          📐 형상 인식 자동 배근 시스템
        </div>
        <div style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.5', marginBottom: '12px' }}>
          스케치업에서 만든 기둥/보 박스(.glb)를 불러온 뒤 마우스로 클릭해봐.
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            background: '#0284c7',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 12px',
            fontSize: '12px',
            fontWeight: 'bold',
            width: '100%',
            cursor: 'pointer',
            marginBottom: '10px'
          }}
        >
          스케치업 박스(.glb) 선택
        </button>

        {boxDimensions && (
          <div style={{ marginTop: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '8px', fontSize: '12px' }}>
            <div style={{ color: '#0284c7', fontWeight: 'bold', marginBottom: '4px' }}>✓ 감지된 부재: {selectedBoxName}</div>
            <div>규격: {boxDimensions.w}m × {boxDimensions.h}m × {boxDimensions.d}m</div>
            <div style={{ color: '#e11d48', fontWeight: 'bold', marginTop: '4px' }}>배근 부재 수: {rebarCount}개</div>
          </div>
        )}
      </div>
    </div>
  );
};
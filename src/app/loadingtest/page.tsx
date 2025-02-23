"use client";

import React, { useEffect, useState } from 'react';
import * as THREE from 'three';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const LoadingPage = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const socket = new WebSocket('ws://your-backend-url');

        socket.onmessage = (event) => {
            setData(event.data);
            // 데이터 수신 후 로딩 종료
            setLoading(false);
        };

        return () => {
            socket.close();
        };
    }, []);

    return (
        <div>
            {loading ? (
                <div>
                    {/* 3D 강아지 컴포넌트 */}
                    <DogAnimation />
                    <p>로딩 중...</p>
                </div>
            ) : (
                <div>
                    <p>데이터: {data}</p>
                </div>
            )}
        </div>
    );
};

const DogAnimation = () => {
    useEffect(() => {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const canvas = document.getElementById('dogCanvas') as HTMLCanvasElement;
        const renderer = new THREE.WebGLRenderer({ canvas });

        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.position.z = 5;

        // GLTFLoader 인스턴스 생성
        const loader = new GLTFLoader();
        loader.load('path/to/dog/model.glb', (gltf) => {
            scene.add(gltf.scene);
            animate();
        });

        const animate = () => {
            requestAnimationFrame(animate);
            // 강아지 애니메이션 로직
            renderer.render(scene, camera);
        };

        return () => {
            // 정리 작업
        };
    }, []);

    return <canvas id="dogCanvas" />;
};

export default LoadingPage;

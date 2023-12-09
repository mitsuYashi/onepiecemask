"use client";

import { Camera } from "@mediapipe/camera_utils";
import {
  NormalizedLandmark,
  NormalizedLandmarkListList,
  drawConnectors,
} from "@mediapipe/drawing_utils";
import {
  FACEMESH_FACE_OVAL,
  FACEMESH_LEFT_EYE,
  FACEMESH_LEFT_EYEBROW,
  FACEMESH_LEFT_IRIS,
  FACEMESH_LIPS,
  FACEMESH_RIGHT_EYE,
  FACEMESH_RIGHT_EYEBROW,
  FACEMESH_RIGHT_IRIS,
  FACEMESH_TESSELATION,
  FaceMesh,
  Results,
} from "@mediapipe/face_mesh";
// import dynamic from "next/dynamic";
// const FaceMesh, Results = dynamic(() => import("@mediapipe/face_mesh"), {ssr: false});
import { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import P5Canvas from "./P5canvas";
import { SelectChangeEvent } from "@mui/material";
import { CharacterSelect } from "./CharacterSelect";

const draw = (ctx: CanvasRenderingContext2D, results: Results) => {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  const topCollection = 0.05;

  ctx.save();
  ctx.clearRect(0, 0, width, height);

  const lineWidth = 1;
  const tesselation = { color: "#C0C0C070", lineWidth };
  const right_eye = { color: "#FF3030", lineWidth };
  const left_eye = { color: "#30FF30", lineWidth };
  const face_oval = { color: "#E0E0E0", lineWidth };
  for (const landmarks of results.multiFaceLandmarks) {
    // // 顔の表面（埋め尽くし）
    // drawConnectors(ctx, landmarks, FACEMESH_TESSELATION, tesselation)
    // // 右の目・眉・瞳
    // drawConnectors(ctx, landmarks, FACEMESH_RIGHT_EYE, right_eye)
    // drawConnectors(ctx, landmarks, FACEMESH_RIGHT_EYEBROW, right_eye)
    // drawConnectors(ctx, landmarks, FACEMESH_RIGHT_IRIS, right_eye)
    // // 左の目・眉・瞳
    // drawConnectors(ctx, landmarks, FACEMESH_LEFT_EYE, left_eye)
    // drawConnectors(ctx, landmarks, FACEMESH_LEFT_EYEBROW, left_eye)
    // drawConnectors(ctx, landmarks, FACEMESH_LEFT_IRIS, left_eye)
    // // 顔の輪郭
    // drawConnectors(ctx, landmarks, FACEMESH_FACE_OVAL, face_oval)
    // // 唇
    // drawConnectors(ctx, landmarks, FACEMESH_LIPS, face_oval)
  }

  ctx.restore();
};

const drawPoint = (
  ctx: CanvasRenderingContext2D,
  point: NormalizedLandmark
) => {
  const x = ctx.canvas.width * point.x;
  const y = ctx.canvas.height * point.y;
  const r = 5;

  ctx.fillStyle = "#22a7f2";
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2, true);
  ctx.fill();
};

export const Webcamera = () => {
  const [character, setCharacter] = useState("");

  const handleChange = (event: SelectChangeEvent) => {
    setCharacter(event.target.value as string);
  };
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const resultsRef = useRef<Results>();
  const [list, setList] = useState<NormalizedLandmarkListList>([]);
  const videoRef = useRef<HTMLVideoElement>(null);

  const onResults = useCallback((results: Results) => {
    // 検出結果の格納
    resultsRef.current = results;
    const ctx = canvasRef.current!.getContext("2d")!;
    draw(ctx, results);
    setList(results.multiFaceLandmarks);
  }, []);

  useEffect(() => {
    const faceMesh = new FaceMesh({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
      },
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    faceMesh.onResults(onResults);

    if (webcamRef.current) {
      const camera = new Camera(webcamRef.current.video!, {
        onFrame: async () => {
          await faceMesh.send({ image: webcamRef.current!.video! });
        },
        width: 1280,
        height: 720,
      });
      camera.start();
    }

    return () => {
      faceMesh.close();
    };
  }, [onResults]);

  return (
    <>
      <div
        style={{
          position: "relative",
          width: "100vw",
          height: "100vh",
          overflow: "hidden",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Webcam
          ref={webcamRef}
          audio={false}
          width={1280}
          height={720}
          // 反転
          mirrored={true}
          screenshotFormat="image/jpeg"
          videoConstraints={{ width: 1280, height: 720, facingMode: "user" }}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />

        {/* draw */}
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            border: "1px solid #fff",
          }}
          width={1280}
          height={720}
        />
        {canvasRef.current != null && (
          <P5Canvas
            keyPoints={list}
            videoElement={canvasRef.current}
            character={character}
          />
        )}
      </div>
      <CharacterSelect character={character} handleChange={handleChange} />
    </>
  );
};

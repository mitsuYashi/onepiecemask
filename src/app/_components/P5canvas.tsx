import React, { useEffect, useRef, useState } from "react";
import p5Types from "p5";
const Sketch = dynamic(() => import("react-p5").then((mod) => mod.default), {
  ssr: false,
});
import { NormalizedLandmarkListList } from "@mediapipe/drawing_utils";
import { images } from "../const/images";
import dynamic from "next/dynamic";

type ComponentProps = {
  keyPoints: NormalizedLandmarkListList;
  videoElement: HTMLCanvasElement;
  character: string;
};

const WIDTH = 1280;
const HEIGHT = 720;

const P5Canvas: React.FC<ComponentProps> = (props: ComponentProps) => {
  const character = props.character || images.linlin_kaido.path;
  const videoImage = useRef<any>(null);
  const [image, setImage] = useState<any>(null);

  const p5ref = useRef<p5Types>();

  useEffect(() => {
    if (p5ref.current) {
      imagePreload(p5ref.current);
    }
  }, [p5ref, character]);

  const imagePreload = (p5: p5Types) => {
    setImage(p5.loadImage(character));
  };

  const setup = (p5: p5Types, canvasParentRef: Element) => {
    p5ref.current = p5;
    imagePreload(p5);
    p5.createCanvas(WIDTH, HEIGHT).parent(canvasParentRef);
    videoImage.current = p5.createGraphics(640, 360);
  };

  const draw = (p5: p5Types) => {
    if (!videoImage.current) return;
    p5.clear(0, 0, 0, 1);

    videoImage.current.drawingContext.drawImage(
      props.videoElement,
      0,
      0,
      videoImage.current.width,
      videoImage.current.height
    );
    p5.push();
    p5.translate(p5.width, 0);
    p5.scale(-1, 1);

    const displayWidth = p5.width;
    const displayHeight =
      (p5.width * videoImage.current.height) / videoImage.current.width;

    p5.image(videoImage.current, 0, 0, displayWidth, displayHeight);
    p5.pop();

    if (props.keyPoints?.length > 0) {
      const facePoints = {
        up: props.keyPoints[0][10],
        right: props.keyPoints[0][323],
        down: props.keyPoints[0][152],
        left: props.keyPoints[0][93],
        center: props.keyPoints[0][1],
      };
      drawFace(p5, facePoints, displayWidth, displayHeight);
    }
  };

  const drawFace = (
    p5: p5Types,
    position: any,
    displayWidth: number,
    displayHeight: number
  ) => {
    p5.push();
    p5.imageMode(p5.CENTER);
    p5.tint(255, 255); // 透明度

    const x_width =
      Math.sqrt(
        Math.pow(position.right.x - position.left.x, 2) +
          Math.pow(position.right.y - position.left.y, 2)
      ) * 1.5;
    const y_width =
      Math.sqrt(
        Math.pow(position.up.x - position.down.x, 2) +
          Math.pow(position.up.y - position.down.y, 2)
      ) * 1.5;

    if (image != null) {
      // console.log("image", image, position.center.x);
      p5.image(
        image,
        (1 - position.center.x) * displayWidth,
        position.center.y * displayHeight,
        image.width * x_width * 5,
        image.height * y_width * 3
      );
      p5.pop();
    }
  };

  return <Sketch setup={setup} draw={draw} style={{ position: "relative" }} />;
};

export default P5Canvas;

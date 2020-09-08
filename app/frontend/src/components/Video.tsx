import * as React from "react";
import { useEffect, useRef } from "react";
import { useObserver } from "mobx-react-lite";

import { Vec2 } from "../../genproto/farm_ng_proto/tractor/v1/geometry";
import { ApriltagDetections } from "../../genproto/farm_ng_proto/tractor/v1/apriltag";
import Button from "react-bootstrap/Button";
import { useRootStore } from "../models/RootStore";
import { autorun } from "mobx";

const t265Resolution = {
  width: 848,
  height: 800
};

const drawAprilTagDetections = (
  detections: ApriltagDetections | null,
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement
): void => {
  ctx.fillStyle = "#ff0000";
  ctx.strokeStyle = "#ff0000";
  ctx.lineWidth = 4;
  ctx.font = "16px Arial";
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const toCanvasCoords = (v: Vec2): Vec2 => ({
    x: v.x * (canvas.width / t265Resolution.width),
    y: v.y * (canvas.height / t265Resolution.height)
  });
  if (detections) {
    detections.detections.forEach((d) => {
      const pCoords = d.p.map(toCanvasCoords);
      ctx.beginPath();
      ctx.moveTo(pCoords[0].x, pCoords[0].y);
      ctx.lineTo(pCoords[1].x, pCoords[1].y);
      ctx.lineTo(pCoords[2].x, pCoords[2].y);
      ctx.lineTo(pCoords[3].x, pCoords[3].y);
      ctx.closePath();
      ctx.stroke();
      if (d.c) {
        const cCoords = toCanvasCoords(d.c);
        ctx.fillText(d.id.toString(), cCoords.x, cCoords.y);
      }
    });
  }
};

export const Video: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const busEventStore = useRootStore().busEventStore;
  const mediaStreamStore = useRootStore().mediaStreamStore;

  const resize = (): void => {
    const videoElement = videoRef?.current;
    const canvasElement = canvasRef?.current;
    if (videoElement && canvasElement) {
      canvasElement.width = videoElement.clientWidth;
      canvasElement.height = videoElement.clientHeight;
    }
  };

  const startVideo = (): void => {
    const videoElement = videoRef?.current;
    if (videoElement) {
      videoElement.play();
    }
  };

  useEffect(
    () =>
      autorun(() => {
        const videoElement = videoRef?.current;
        if (!videoElement) {
          return;
        }
        videoElement.srcObject = mediaStreamStore.videoStream;
      }),
    [videoRef]
  );

  useEffect(
    () =>
      autorun(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
          return;
        }

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return;
        }

        resize();
        drawAprilTagDetections(
          busEventStore.lastSnapshot.get("tracking_camera/front/apriltags")
            ?.latestEvent as ApriltagDetections,
          ctx,
          canvas
        );
      }),
    [canvasRef]
  );

  return useObserver(() => (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", flexDirection: "row" }}>
        <Button variant={"primary"} onClick={startVideo}>
          Start Video
        </Button>
        <button disabled>Send Test Event</button>
      </div>
      <div id="annotatedVideo" style={{ position: "relative", width: "100%" }}>
        <div id="videos">
          <video ref={videoRef} autoPlay style={{ width: "100%" }}></video>
        </div>
        <canvas
          ref={canvasRef}
          style={{ position: "absolute", top: 0, left: 0, bottom: 0, right: 0 }}
        ></canvas>
      </div>
    </div>
  ));
};

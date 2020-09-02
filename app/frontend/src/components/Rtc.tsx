/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import * as React from "react";
import { useEffect, useState, useRef } from "react";
import { Event as BusEvent } from "../../genproto/farm_ng_proto/tractor/v1/io";
import { SteeringCommand } from "../../genproto/farm_ng_proto/tractor/v1/steering";
import {
  TrackingCameraPoseFrame,
  TrackingCameraMotionFrame
} from "../../genproto/farm_ng_proto/tractor/v1/tracking_camera";
import { NamedSE3Pose } from "../../genproto/farm_ng_proto/tractor/v1/geometry";
import { MotorControllerState } from "../../genproto/farm_ng_proto/tractor/v1/motor";
import {
  ApriltagDetections,
  ApriltagDetection
} from "../../genproto/farm_ng_proto/tractor/v1/apriltag";

type TractorState = {
  [key: string]:
    | SteeringCommand
    | TrackingCameraPoseFrame
    | TrackingCameraMotionFrame
    | NamedSE3Pose
    | MotorControllerState
    | ApriltagDetections;
};

const t265Resolution = {
  width: 848,
  height: 800
};

export const Rtc: React.FC = () => {
  const [tractorState, setTractorState] = useState<TractorState>({});
  const [apriltagDetections, setApriltagDetections] = useState<
    ApriltagDetections
  >();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const resize = (): void => {
    const videoDiv = document.getElementById("video") as HTMLVideoElement;
    const canvasDiv = document.getElementById(
      "annotations"
    ) as HTMLCanvasElement;
    if (videoDiv && canvasDiv) {
      canvasDiv.width = videoDiv.clientWidth;
      canvasDiv.height = videoDiv.clientHeight;
    }
  };

  const startVideo = (): void => {
    const videoEl = document.getElementById("video") as HTMLVideoElement;
    if (videoEl) {
      videoEl.play();
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    resize();
    context.fillStyle = "#ff0000";
    context.strokeStyle = "#ff0000";
    context.lineWidth = 4;
    context.font = "16px Arial";
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (apriltagDetections) {
      apriltagDetections.detections.forEach((d: ApriltagDetection) => {
        const coords = d.p.map((point) => ({
          x: point.x * (canvas.width / t265Resolution.width),
          y: point.y * (canvas.height / t265Resolution.height)
        }));
        context.beginPath();
        context.moveTo(coords[0].x, coords[0].y);
        context.lineTo(coords[1].x, coords[1].y);
        context.lineTo(coords[2].x, coords[2].y);
        context.lineTo(coords[3].x, coords[3].y);
        context.closePath();
        context.stroke();
        if (d.c) {
          context.fillText(d.id.toString(), d.c.x, d.c.y);
        }
      });
    }
  }, [canvasRef, apriltagDetections]);

  useEffect(() => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });

    pc.ontrack = (event) => {
      if (event.track.kind != "video") {
        console.log(
          `${event.track.kind} track added, but only video tracks are supported.`
        );
        return;
      }
      const el = document.createElement<"video">("video");
      el.srcObject = event.streams[0];
      el.autoplay = true;
      el.id = "video";
      el.style.width = "100%";
      document.getElementById("videos")?.appendChild(el);
    };

    pc.oniceconnectionstatechange = (_: Event) =>
      console.log(pc.iceConnectionState);

    pc.onicecandidate = async (event: RTCPeerConnectionIceEvent) => {
      if (event.candidate === null) {
        const response = await fetch(
          "http://localhost:9900/twirp/farm_ng_proto.tractor.v1.WebRTCProxyService/InitiatePeerConnection",
          {
            method: "POST",
            mode: "cors",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              sdp: btoa(JSON.stringify(pc.localDescription))
            })
          }
        );
        const responseJson = await response.json();
        try {
          pc.setRemoteDescription(
            new RTCSessionDescription(JSON.parse(atob(responseJson.sdp)))
          );
        } catch (e) {
          console.error(e);
        }
      }
    };

    // Offer to receive 1 audio, 2 video tracks, and a data channel
    pc.addTransceiver("audio", { direction: "recvonly" });
    pc.addTransceiver("video", { direction: "recvonly" });
    pc.addTransceiver("video", { direction: "recvonly" });
    const dataChannel = pc.createDataChannel("foo");
    dataChannel.onclose = () => console.log("data channel closed");
    dataChannel.onopen = () => console.log("data channel opened");
    dataChannel.onmessage = (msg) => {
      const event = BusEvent.decode(new Uint8Array(msg.data));
      const decoder = ((typeUrl: string) => {
        switch (typeUrl) {
          case "type.googleapis.com/farm_ng_proto.tractor.v1.SteeringCommand":
            return SteeringCommand.decode;
          case "type.googleapis.com/farm_ng_proto.tractor.v1.TrackingCameraPoseFrame":
            return TrackingCameraPoseFrame.decode;
          case "type.googleapis.com/farm_ng_proto.tractor.v1.TrackingCameraMotionFrame":
            return TrackingCameraMotionFrame.decode;
          case "type.googleapis.com/farm_ng_proto.tractor.v1.NamedSE3Pose":
            return NamedSE3Pose.decode;
          case "type.googleapis.com/farm_ng_proto.tractor.v1.MotorControllerState":
            return MotorControllerState.decode;
          case "type.googleapis.com/farm_ng_proto.tractor.v1.ApriltagDetections":
            return ApriltagDetections.decode;
          default:
            console.log("Unknown message type: ", typeUrl);
            return undefined;
        }
      })(event.data?.typeUrl || "");
      // console.log("Message received: ", event.data?.typeUrl);

      if (event.data && decoder) {
        const value = decoder(event.data?.value || new Uint8Array());
        setTractorState((state) => ({
          ...state,
          [event.name]: value
        }));
        if (decoder === ApriltagDetections.decode) {
          setApriltagDetections(value as ApriltagDetections);
        }
      }
    };

    pc.createOffer()
      .then((d) => pc.setLocalDescription(d))
      .catch((e) => console.error(e));
  }, []);

  const sendEvent = (): void => {
    console.log("foo");
    // dataChannel.send("foo");
  };

  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      <div id="annotatedVideo" style={{ position: "relative", width: "50%" }}>
        <div id="videos" style={{}}></div>
        <canvas
          id="annotations"
          ref={canvasRef}
          style={{ position: "absolute", top: 0, left: 0, bottom: 0, right: 0 }}
        ></canvas>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <button onClick={startVideo}>Start Video</button>
        <button onClick={sendEvent}>Send Test Event</button>
      </div>
      <div style={{ color: "white", width: "50%" }}>
        {Object.keys(tractorState).map((key, i) => (
          <React.Fragment key={i}>
            <span>Key Name: {key} </span>
            <p>
              {Object.keys(tractorState[key]).map((keyJ, _j) => (
                <React.Fragment key={keyJ}>
                  <span> {keyJ} </span>
                  <span>
                    {JSON.stringify((tractorState[key] as any)[keyJ])}{" "}
                  </span>
                </React.Fragment>
              ))}
            </p>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

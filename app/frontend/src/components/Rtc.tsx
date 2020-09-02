/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import * as React from "react";
import { useEffect, useState } from "react";
import { Event as BusEvent } from "../../genproto/farm_ng_proto/tractor/v1/io";
import { SteeringCommand } from "../../genproto/farm_ng_proto/tractor/v1/steering";
import {
  TrackingCameraPoseFrame,
  TrackingCameraMotionFrame
} from "../../genproto/farm_ng_proto/tractor/v1/tracking_camera";
import { NamedSE3Pose } from "../../genproto/farm_ng_proto/tractor/v1/geometry";
import { MotorControllerState } from "../../genproto/farm_ng_proto/tractor/v1/motor";

type TractorState = {
  [key: string]:
    | SteeringCommand
    | TrackingCameraPoseFrame
    | TrackingCameraMotionFrame
    | NamedSE3Pose
    | MotorControllerState;
};

export const Rtc: React.FC = () => {
  const [tractorState, setTractorState] = useState<TractorState>({});

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
      el.controls = true;
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
          default:
            return undefined;
        }
      })(event.data?.typeUrl || "");

      if (event.data && decoder) {
        setTractorState((state) => ({
          ...state,
          [event.name]: decoder(event.data?.value || new Uint8Array())
        }));
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
    <div style={{ display: "flex", flexBasis: "horizontal" }}>
      <div id="videos">
        <button onClick={sendEvent}>Send Test Event</button>
      </div>

      <div style={{ color: "white" }}>
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

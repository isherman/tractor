import { Buffer } from "../types/common";
// import { Image } from "../../genproto/farm_ng_proto/tractor/v1/image";
import { CalibrateApriltagRigStatus } from "../../genproto/farm_ng_proto/tractor/v1/calibrate_apriltag_rig";
import { CalibrateBaseToCameraStatus } from "../../genproto/farm_ng_proto/tractor/v1/calibrate_base_to_camera";
import {
  Color,
  Marker,
  MarkerList,
  PointMarker,
  PoseMarker,
  PoseMarker_Arrow as PoseMarkerArrow,
  PoseMarker_Axes as PoseMarkerAxes
} from "../../genproto/farm_ng_proto/tractor/v1/markers";
import {
  Quaternion,
  SE3Pose,
  Vec3
} from "../../genproto/farm_ng_proto/tractor/v1/geometry";

export const testBuffer: Buffer = {
  // "type.googleapis.com/farm_ng_proto.tractor.v1.Image": {
  //   test: [
  //     ...Array(100)
  //       .fill(0)
  //       .map<TimestampedEvent<Image>>((_, i) => [
  //         i,
  //         Image.fromPartial({
  //           resource: {
  //             path: "logs/default2/tracking_camera/front/prospectpark.mp4",
  //             contentType: "video/mp4"
  //           },
  //           fps: 30,
  //           frameNumber: i
  //         })
  //       ])
  //   ]
  // },
  "type.googleapis.com/farm_ng_proto.tractor.v1.MarkerList": {
    test: [
      [
        0,
        MarkerList.fromPartial({
          markers: [
            Marker.fromPartial({
              name: "z1",
              worldPoseSelf: SE3Pose.fromPartial({
                position: Vec3.fromPartial({ x: 0, y: 0, z: 1 })
              }),
              data: {
                typeUrl:
                  "type.googleapis.com/farm_ng_proto.tractor.v1.PointMarker",
                value: PointMarker.encode(
                  PointMarker.fromPartial({
                    color: Color.fromPartial({ rgba: { b: 1 } }),
                    radius: 0.1
                  })
                ).finish()
              }
            }),
            Marker.fromPartial({
              name: "x2",
              worldPoseSelf: SE3Pose.fromPartial({
                position: Vec3.fromPartial({ x: 2, y: 0, z: 0 })
              }),
              data: {
                typeUrl:
                  "type.googleapis.com/farm_ng_proto.tractor.v1.PointMarker",
                value: PointMarker.encode(
                  PointMarker.fromPartial({
                    color: Color.fromPartial({ rgba: { r: 1 } }),
                    radius: 0.5
                  })
                ).finish()
              }
            }),
            Marker.fromPartial({
              name: "yArrow",
              worldPoseSelf: SE3Pose.fromPartial({
                position: Vec3.fromPartial({ x: 1, y: 1, z: 0 })
              }),
              data: {
                typeUrl:
                  "type.googleapis.com/farm_ng_proto.tractor.v1.PoseMarker",
                value: PoseMarker.encode(
                  PoseMarker.fromPartial({
                    arrow: PoseMarkerArrow.fromPartial({
                      color: Color.fromPartial({ rgba: { r: 1, g: 1 } }),
                      headLength: 0.2,
                      headRadius: 0.1,
                      shaftLength: 1,
                      shaftRadius: 0.05
                    }),
                    pose: SE3Pose.fromPartial({
                      position: Vec3.fromPartial({ x: 0, y: 2, z: 1 })
                    })
                  })
                ).finish()
              }
            }),
            Marker.fromPartial({
              name: "yAxes",
              worldPoseSelf: SE3Pose.fromPartial({
                position: Vec3.fromPartial({ x: 0, y: 3, z: 0 }),
                rotation: Quaternion.fromPartial({ x: 0, y: 0, z: 1, w: 0 })
              }),
              data: {
                typeUrl:
                  "type.googleapis.com/farm_ng_proto.tractor.v1.PoseMarker",
                value: PoseMarker.encode(
                  PoseMarker.fromPartial({
                    axes: PoseMarkerAxes.fromPartial({
                      length: 2,
                      radius: 0.1
                    })
                  })
                ).finish()
              }
            })
          ]
        })
      ]
    ]
  },
  "type.googleapis.com/farm_ng_proto.tractor.v1.CalibrateApriltagRigStatus": {
    test: [
      [
        99,
        CalibrateApriltagRigStatus.fromJSON({
          result: {
            path: "apriltag_rig_models/rig.json",
            contentType:
              "application/json; type=type.googleapis.com/farm_ng_proto.tractor.v1.CalibrateApriltagRigResult"
          }
        })
      ]
    ]
  },
  "type.googleapis.com/farm_ng_proto.tractor.v1.CalibrateBaseToCameraStatus": {
    test: [
      [
        199,
        CalibrateBaseToCameraStatus.fromJSON({
          result: {
            path: "base_to_camera_models/base_to_camera.json",
            contentType:
              "application/json; type=type.googleapis.com/farm_ng_proto.tractor.v1.CalibrateBaseToCameraResult"
          }
        })
      ]
    ]
  }
};

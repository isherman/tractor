import { NamedSE3Pose } from "../../genproto/farm_ng_proto/tractor/v1/geometry";
import { duration } from "../utils/duration";
import { getInverse, interpolateSE3Pose } from "../utils/geometry";

type Time = Date | "latest";
const defaultMaxAge = 60 * duration.minute;

class PoseVector {
  private poses: NamedSE3Pose[] = [];

  constructor(private maxAge: number = defaultMaxAge) {}

  public insert(pose: NamedSE3Pose): void {
    if (!pose.aPoseB?.stamp) {
      throw Error(`Cannot insert pose without stamp: ${pose}`);
    }
    const nearestIndex = this.nearestIndex(pose.aPoseB.stamp);
    this.poses = this.poses.splice(nearestIndex + 1, 0, pose);
    this.expire();
  }

  public get(time: Time): NamedSE3Pose | undefined {
    if (time === "latest") {
      return this.poses[this.poses.length - 1];
    }
    const prevIndex = this.nearestIndex(time);

    // The requested timestamp is earler than all known poses; return the earliest known pose
    if (prevIndex < 0) {
      return this.poses[0];
    }

    // The requested timestamp is later than all known poses; refuse to extrapolate
    if (prevIndex === this.poses.length - 1) {
      return undefined;
    }

    const [prevPose, nextPose] = this.poses.slice(prevIndex, prevIndex + 2);
    if (!prevPose.aPoseB || !nextPose.aPoseB) {
      throw Error(`Invalid nearest poses: ${[prevPose, nextPose]}`);
    }

    const interpolatedPose = interpolateSE3Pose(
      prevPose.aPoseB,
      nextPose.aPoseB,
      time
    );

    if (!interpolatedPose) {
      throw Error(
        `Unable to interpolate nearest poses: ${[prevPose, nextPose]}`
      );
    }

    return {
      ...prevPose,
      aPoseB: interpolatedPose
    };
  }

  private nearestIndex(time: Date): number {
    const index = this.poses.findIndex(
      (pose) => pose.aPoseB?.stamp && pose.aPoseB.stamp > time
    );
    if (index === -1) {
      return this.poses.length - 1;
    }
    if (index === 0) {
      return -1;
    }
    return index - 1;
  }

  private expire(): void {
    const expirationTime = new Date(Date.now() - this.maxAge);
    while (
      this.poses[0]?.aPoseB?.stamp !== undefined &&
      this.poses[0].aPoseB.stamp < expirationTime
    ) {
      this.poses.shift();
    }
  }
}

function canonicalize(pose: NamedSE3Pose): NamedSE3Pose {
  if (!pose.aPoseB) {
    throw Error(`Cannot canonicalize NamedSE3Pose without pose: ${pose}`);
  }

  return pose.frameB > pose.frameA
    ? pose
    : {
        frameA: pose.frameB,
        frameB: pose.frameA,
        aPoseB: getInverse(pose.aPoseB)
      };
}

export class PoseTree {
  private poseVectors = new Map<string, PoseVector>();

  public addPose(pose_: NamedSE3Pose): void {
    const pose = canonicalize(pose_);
    const key = [pose.frameA, pose.frameB].join(":");
    if (!this.poseVectors.has(key)) {
      this.poseVectors.set(key, new PoseVector());
    }
    const poseVector = this.poseVectors.get(key);
    if (!poseVector) {
      throw Error(`PoseTree poseVectors missing key ${key}`);
    }
    poseVector.insert(pose);
  }
  // public getTransform(
  //   source: string,
  //   target: string,
  //   time: Time
  // ): SE3Pose | undefined {}
}

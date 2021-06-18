/* eslint-disable */
import * as Long from "long";
import * as _m0 from "protobufjs/minimal";

export const protobufPackage = "manis_protos";

export enum EntityMode {
  POINTS = 0,
  LINE_SEGMENTS = 1,
  UNRECOGNIZED = -1,
}

export function entityModeFromJSON(object: any): EntityMode {
  switch (object) {
    case 0:
    case "POINTS":
      return EntityMode.POINTS;
    case 1:
    case "LINE_SEGMENTS":
      return EntityMode.LINE_SEGMENTS;
    case -1:
    case "UNRECOGNIZED":
    default:
      return EntityMode.UNRECOGNIZED;
  }
}

export function entityModeToJSON(object: EntityMode): string {
  switch (object) {
    case EntityMode.POINTS:
      return "POINTS";
    case EntityMode.LINE_SEGMENTS:
      return "LINE_SEGMENTS";
    default:
      return "UNKNOWN";
  }
}

export interface Vec3F32 {
  x: number;
  y: number;
  z: number;
}

export interface QuaternionF32 {
  w: number;
  i: number;
  j: number;
  k: number;
}

export interface Isometry3F32 {
  rotation: QuaternionF32 | undefined;
  translation: Vec3F32 | undefined;
}

export interface Entity {
  label: string;
  mode: EntityMode;
  vertices: number[];
  colors: number[];
  worldPoseEntity: Isometry3F32 | undefined;
}

export interface ClearWidget {}

export interface SetEntityPose {
  label: string;
  worldPoseEntity: Isometry3F32 | undefined;
}

export interface RemoveEntity {
  label: string;
}

export interface WidgetUpdate {
  entity: Entity | undefined;
  clearWidget: ClearWidget | undefined;
  setEntityPose: SetEntityPose | undefined;
  removeEntity: RemoveEntity | undefined;
}

export interface WidgetUpdates {
  label: string;
  updates: WidgetUpdate[];
}

export interface NewWidget {
  label: string;
}

export interface WidgetData {
  newWidget: NewWidget | undefined;
  widgetUpdates: WidgetUpdates | undefined;
}

export interface Checkbox {
  label: string;
  checked: boolean;
}

export interface F64Slider {
  label: string;
  default: number;
  min: number;
  max: number;
}

export interface Component {
  checkbox: Checkbox | undefined;
  f64Slider: F64Slider | undefined;
}

export interface UpdateBuffer {
  widgetDataVec: WidgetData[];
  componentVec: Component[];
}

export interface CheckboxEvent {
  label: string;
  checked: boolean;
}

export interface F64SliderEvent {
  label: string;
  value: number;
}

export interface Event {
  checkboxEvent: CheckboxEvent | undefined;
  f64SliderEvent: F64SliderEvent | undefined;
}

const baseVec3F32: object = { x: 0, y: 0, z: 0 };

export const Vec3F32 = {
  encode(
    message: Vec3F32,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.x !== 0) {
      writer.uint32(13).float(message.x);
    }
    if (message.y !== 0) {
      writer.uint32(21).float(message.y);
    }
    if (message.z !== 0) {
      writer.uint32(29).float(message.z);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Vec3F32 {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseVec3F32 } as Vec3F32;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.x = reader.float();
          break;
        case 2:
          message.y = reader.float();
          break;
        case 3:
          message.z = reader.float();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Vec3F32 {
    const message = { ...baseVec3F32 } as Vec3F32;
    if (object.x !== undefined && object.x !== null) {
      message.x = Number(object.x);
    } else {
      message.x = 0;
    }
    if (object.y !== undefined && object.y !== null) {
      message.y = Number(object.y);
    } else {
      message.y = 0;
    }
    if (object.z !== undefined && object.z !== null) {
      message.z = Number(object.z);
    } else {
      message.z = 0;
    }
    return message;
  },

  toJSON(message: Vec3F32): unknown {
    const obj: any = {};
    message.x !== undefined && (obj.x = message.x);
    message.y !== undefined && (obj.y = message.y);
    message.z !== undefined && (obj.z = message.z);
    return obj;
  },

  fromPartial(object: DeepPartial<Vec3F32>): Vec3F32 {
    const message = { ...baseVec3F32 } as Vec3F32;
    if (object.x !== undefined && object.x !== null) {
      message.x = object.x;
    } else {
      message.x = 0;
    }
    if (object.y !== undefined && object.y !== null) {
      message.y = object.y;
    } else {
      message.y = 0;
    }
    if (object.z !== undefined && object.z !== null) {
      message.z = object.z;
    } else {
      message.z = 0;
    }
    return message;
  },
};

const baseQuaternionF32: object = { w: 0, i: 0, j: 0, k: 0 };

export const QuaternionF32 = {
  encode(
    message: QuaternionF32,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.w !== 0) {
      writer.uint32(13).float(message.w);
    }
    if (message.i !== 0) {
      writer.uint32(21).float(message.i);
    }
    if (message.j !== 0) {
      writer.uint32(29).float(message.j);
    }
    if (message.k !== 0) {
      writer.uint32(37).float(message.k);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): QuaternionF32 {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseQuaternionF32 } as QuaternionF32;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.w = reader.float();
          break;
        case 2:
          message.i = reader.float();
          break;
        case 3:
          message.j = reader.float();
          break;
        case 4:
          message.k = reader.float();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): QuaternionF32 {
    const message = { ...baseQuaternionF32 } as QuaternionF32;
    if (object.w !== undefined && object.w !== null) {
      message.w = Number(object.w);
    } else {
      message.w = 0;
    }
    if (object.i !== undefined && object.i !== null) {
      message.i = Number(object.i);
    } else {
      message.i = 0;
    }
    if (object.j !== undefined && object.j !== null) {
      message.j = Number(object.j);
    } else {
      message.j = 0;
    }
    if (object.k !== undefined && object.k !== null) {
      message.k = Number(object.k);
    } else {
      message.k = 0;
    }
    return message;
  },

  toJSON(message: QuaternionF32): unknown {
    const obj: any = {};
    message.w !== undefined && (obj.w = message.w);
    message.i !== undefined && (obj.i = message.i);
    message.j !== undefined && (obj.j = message.j);
    message.k !== undefined && (obj.k = message.k);
    return obj;
  },

  fromPartial(object: DeepPartial<QuaternionF32>): QuaternionF32 {
    const message = { ...baseQuaternionF32 } as QuaternionF32;
    if (object.w !== undefined && object.w !== null) {
      message.w = object.w;
    } else {
      message.w = 0;
    }
    if (object.i !== undefined && object.i !== null) {
      message.i = object.i;
    } else {
      message.i = 0;
    }
    if (object.j !== undefined && object.j !== null) {
      message.j = object.j;
    } else {
      message.j = 0;
    }
    if (object.k !== undefined && object.k !== null) {
      message.k = object.k;
    } else {
      message.k = 0;
    }
    return message;
  },
};

const baseIsometry3F32: object = {};

export const Isometry3F32 = {
  encode(
    message: Isometry3F32,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.rotation !== undefined) {
      QuaternionF32.encode(message.rotation, writer.uint32(10).fork()).ldelim();
    }
    if (message.translation !== undefined) {
      Vec3F32.encode(message.translation, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Isometry3F32 {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseIsometry3F32 } as Isometry3F32;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.rotation = QuaternionF32.decode(reader, reader.uint32());
          break;
        case 2:
          message.translation = Vec3F32.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Isometry3F32 {
    const message = { ...baseIsometry3F32 } as Isometry3F32;
    if (object.rotation !== undefined && object.rotation !== null) {
      message.rotation = QuaternionF32.fromJSON(object.rotation);
    } else {
      message.rotation = undefined;
    }
    if (object.translation !== undefined && object.translation !== null) {
      message.translation = Vec3F32.fromJSON(object.translation);
    } else {
      message.translation = undefined;
    }
    return message;
  },

  toJSON(message: Isometry3F32): unknown {
    const obj: any = {};
    message.rotation !== undefined &&
      (obj.rotation = message.rotation
        ? QuaternionF32.toJSON(message.rotation)
        : undefined);
    message.translation !== undefined &&
      (obj.translation = message.translation
        ? Vec3F32.toJSON(message.translation)
        : undefined);
    return obj;
  },

  fromPartial(object: DeepPartial<Isometry3F32>): Isometry3F32 {
    const message = { ...baseIsometry3F32 } as Isometry3F32;
    if (object.rotation !== undefined && object.rotation !== null) {
      message.rotation = QuaternionF32.fromPartial(object.rotation);
    } else {
      message.rotation = undefined;
    }
    if (object.translation !== undefined && object.translation !== null) {
      message.translation = Vec3F32.fromPartial(object.translation);
    } else {
      message.translation = undefined;
    }
    return message;
  },
};

const baseEntity: object = { label: "", mode: 0, vertices: 0, colors: 0 };

export const Entity = {
  encode(
    message: Entity,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.label !== "") {
      writer.uint32(10).string(message.label);
    }
    if (message.mode !== 0) {
      writer.uint32(16).int32(message.mode);
    }
    writer.uint32(26).fork();
    for (const v of message.vertices) {
      writer.float(v);
    }
    writer.ldelim();
    writer.uint32(34).fork();
    for (const v of message.colors) {
      writer.float(v);
    }
    writer.ldelim();
    if (message.worldPoseEntity !== undefined) {
      Isometry3F32.encode(
        message.worldPoseEntity,
        writer.uint32(42).fork()
      ).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Entity {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseEntity } as Entity;
    message.vertices = [];
    message.colors = [];
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.label = reader.string();
          break;
        case 2:
          message.mode = reader.int32() as any;
          break;
        case 3:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.vertices.push(reader.float());
            }
          } else {
            message.vertices.push(reader.float());
          }
          break;
        case 4:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.colors.push(reader.float());
            }
          } else {
            message.colors.push(reader.float());
          }
          break;
        case 5:
          message.worldPoseEntity = Isometry3F32.decode(
            reader,
            reader.uint32()
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Entity {
    const message = { ...baseEntity } as Entity;
    message.vertices = [];
    message.colors = [];
    if (object.label !== undefined && object.label !== null) {
      message.label = String(object.label);
    } else {
      message.label = "";
    }
    if (object.mode !== undefined && object.mode !== null) {
      message.mode = entityModeFromJSON(object.mode);
    } else {
      message.mode = 0;
    }
    if (object.vertices !== undefined && object.vertices !== null) {
      for (const e of object.vertices) {
        message.vertices.push(Number(e));
      }
    }
    if (object.colors !== undefined && object.colors !== null) {
      for (const e of object.colors) {
        message.colors.push(Number(e));
      }
    }
    if (
      object.worldPoseEntity !== undefined &&
      object.worldPoseEntity !== null
    ) {
      message.worldPoseEntity = Isometry3F32.fromJSON(object.worldPoseEntity);
    } else {
      message.worldPoseEntity = undefined;
    }
    return message;
  },

  toJSON(message: Entity): unknown {
    const obj: any = {};
    message.label !== undefined && (obj.label = message.label);
    message.mode !== undefined && (obj.mode = entityModeToJSON(message.mode));
    if (message.vertices) {
      obj.vertices = message.vertices.map((e) => e);
    } else {
      obj.vertices = [];
    }
    if (message.colors) {
      obj.colors = message.colors.map((e) => e);
    } else {
      obj.colors = [];
    }
    message.worldPoseEntity !== undefined &&
      (obj.worldPoseEntity = message.worldPoseEntity
        ? Isometry3F32.toJSON(message.worldPoseEntity)
        : undefined);
    return obj;
  },

  fromPartial(object: DeepPartial<Entity>): Entity {
    const message = { ...baseEntity } as Entity;
    message.vertices = [];
    message.colors = [];
    if (object.label !== undefined && object.label !== null) {
      message.label = object.label;
    } else {
      message.label = "";
    }
    if (object.mode !== undefined && object.mode !== null) {
      message.mode = object.mode;
    } else {
      message.mode = 0;
    }
    if (object.vertices !== undefined && object.vertices !== null) {
      for (const e of object.vertices) {
        message.vertices.push(e);
      }
    }
    if (object.colors !== undefined && object.colors !== null) {
      for (const e of object.colors) {
        message.colors.push(e);
      }
    }
    if (
      object.worldPoseEntity !== undefined &&
      object.worldPoseEntity !== null
    ) {
      message.worldPoseEntity = Isometry3F32.fromPartial(
        object.worldPoseEntity
      );
    } else {
      message.worldPoseEntity = undefined;
    }
    return message;
  },
};

const baseClearWidget: object = {};

export const ClearWidget = {
  encode(_: ClearWidget, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ClearWidget {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseClearWidget } as ClearWidget;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(_: any): ClearWidget {
    const message = { ...baseClearWidget } as ClearWidget;
    return message;
  },

  toJSON(_: ClearWidget): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial(_: DeepPartial<ClearWidget>): ClearWidget {
    const message = { ...baseClearWidget } as ClearWidget;
    return message;
  },
};

const baseSetEntityPose: object = { label: "" };

export const SetEntityPose = {
  encode(
    message: SetEntityPose,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.label !== "") {
      writer.uint32(10).string(message.label);
    }
    if (message.worldPoseEntity !== undefined) {
      Isometry3F32.encode(
        message.worldPoseEntity,
        writer.uint32(18).fork()
      ).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SetEntityPose {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseSetEntityPose } as SetEntityPose;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.label = reader.string();
          break;
        case 2:
          message.worldPoseEntity = Isometry3F32.decode(
            reader,
            reader.uint32()
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): SetEntityPose {
    const message = { ...baseSetEntityPose } as SetEntityPose;
    if (object.label !== undefined && object.label !== null) {
      message.label = String(object.label);
    } else {
      message.label = "";
    }
    if (
      object.worldPoseEntity !== undefined &&
      object.worldPoseEntity !== null
    ) {
      message.worldPoseEntity = Isometry3F32.fromJSON(object.worldPoseEntity);
    } else {
      message.worldPoseEntity = undefined;
    }
    return message;
  },

  toJSON(message: SetEntityPose): unknown {
    const obj: any = {};
    message.label !== undefined && (obj.label = message.label);
    message.worldPoseEntity !== undefined &&
      (obj.worldPoseEntity = message.worldPoseEntity
        ? Isometry3F32.toJSON(message.worldPoseEntity)
        : undefined);
    return obj;
  },

  fromPartial(object: DeepPartial<SetEntityPose>): SetEntityPose {
    const message = { ...baseSetEntityPose } as SetEntityPose;
    if (object.label !== undefined && object.label !== null) {
      message.label = object.label;
    } else {
      message.label = "";
    }
    if (
      object.worldPoseEntity !== undefined &&
      object.worldPoseEntity !== null
    ) {
      message.worldPoseEntity = Isometry3F32.fromPartial(
        object.worldPoseEntity
      );
    } else {
      message.worldPoseEntity = undefined;
    }
    return message;
  },
};

const baseRemoveEntity: object = { label: "" };

export const RemoveEntity = {
  encode(
    message: RemoveEntity,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.label !== "") {
      writer.uint32(10).string(message.label);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RemoveEntity {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseRemoveEntity } as RemoveEntity;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.label = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): RemoveEntity {
    const message = { ...baseRemoveEntity } as RemoveEntity;
    if (object.label !== undefined && object.label !== null) {
      message.label = String(object.label);
    } else {
      message.label = "";
    }
    return message;
  },

  toJSON(message: RemoveEntity): unknown {
    const obj: any = {};
    message.label !== undefined && (obj.label = message.label);
    return obj;
  },

  fromPartial(object: DeepPartial<RemoveEntity>): RemoveEntity {
    const message = { ...baseRemoveEntity } as RemoveEntity;
    if (object.label !== undefined && object.label !== null) {
      message.label = object.label;
    } else {
      message.label = "";
    }
    return message;
  },
};

const baseWidgetUpdate: object = {};

export const WidgetUpdate = {
  encode(
    message: WidgetUpdate,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.entity !== undefined) {
      Entity.encode(message.entity, writer.uint32(10).fork()).ldelim();
    }
    if (message.clearWidget !== undefined) {
      ClearWidget.encode(
        message.clearWidget,
        writer.uint32(18).fork()
      ).ldelim();
    }
    if (message.setEntityPose !== undefined) {
      SetEntityPose.encode(
        message.setEntityPose,
        writer.uint32(26).fork()
      ).ldelim();
    }
    if (message.removeEntity !== undefined) {
      RemoveEntity.encode(
        message.removeEntity,
        writer.uint32(34).fork()
      ).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): WidgetUpdate {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseWidgetUpdate } as WidgetUpdate;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.entity = Entity.decode(reader, reader.uint32());
          break;
        case 2:
          message.clearWidget = ClearWidget.decode(reader, reader.uint32());
          break;
        case 3:
          message.setEntityPose = SetEntityPose.decode(reader, reader.uint32());
          break;
        case 4:
          message.removeEntity = RemoveEntity.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): WidgetUpdate {
    const message = { ...baseWidgetUpdate } as WidgetUpdate;
    if (object.entity !== undefined && object.entity !== null) {
      message.entity = Entity.fromJSON(object.entity);
    } else {
      message.entity = undefined;
    }
    if (object.clearWidget !== undefined && object.clearWidget !== null) {
      message.clearWidget = ClearWidget.fromJSON(object.clearWidget);
    } else {
      message.clearWidget = undefined;
    }
    if (object.setEntityPose !== undefined && object.setEntityPose !== null) {
      message.setEntityPose = SetEntityPose.fromJSON(object.setEntityPose);
    } else {
      message.setEntityPose = undefined;
    }
    if (object.removeEntity !== undefined && object.removeEntity !== null) {
      message.removeEntity = RemoveEntity.fromJSON(object.removeEntity);
    } else {
      message.removeEntity = undefined;
    }
    return message;
  },

  toJSON(message: WidgetUpdate): unknown {
    const obj: any = {};
    message.entity !== undefined &&
      (obj.entity = message.entity ? Entity.toJSON(message.entity) : undefined);
    message.clearWidget !== undefined &&
      (obj.clearWidget = message.clearWidget
        ? ClearWidget.toJSON(message.clearWidget)
        : undefined);
    message.setEntityPose !== undefined &&
      (obj.setEntityPose = message.setEntityPose
        ? SetEntityPose.toJSON(message.setEntityPose)
        : undefined);
    message.removeEntity !== undefined &&
      (obj.removeEntity = message.removeEntity
        ? RemoveEntity.toJSON(message.removeEntity)
        : undefined);
    return obj;
  },

  fromPartial(object: DeepPartial<WidgetUpdate>): WidgetUpdate {
    const message = { ...baseWidgetUpdate } as WidgetUpdate;
    if (object.entity !== undefined && object.entity !== null) {
      message.entity = Entity.fromPartial(object.entity);
    } else {
      message.entity = undefined;
    }
    if (object.clearWidget !== undefined && object.clearWidget !== null) {
      message.clearWidget = ClearWidget.fromPartial(object.clearWidget);
    } else {
      message.clearWidget = undefined;
    }
    if (object.setEntityPose !== undefined && object.setEntityPose !== null) {
      message.setEntityPose = SetEntityPose.fromPartial(object.setEntityPose);
    } else {
      message.setEntityPose = undefined;
    }
    if (object.removeEntity !== undefined && object.removeEntity !== null) {
      message.removeEntity = RemoveEntity.fromPartial(object.removeEntity);
    } else {
      message.removeEntity = undefined;
    }
    return message;
  },
};

const baseWidgetUpdates: object = { label: "" };

export const WidgetUpdates = {
  encode(
    message: WidgetUpdates,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.label !== "") {
      writer.uint32(10).string(message.label);
    }
    for (const v of message.updates) {
      WidgetUpdate.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): WidgetUpdates {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseWidgetUpdates } as WidgetUpdates;
    message.updates = [];
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.label = reader.string();
          break;
        case 2:
          message.updates.push(WidgetUpdate.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): WidgetUpdates {
    const message = { ...baseWidgetUpdates } as WidgetUpdates;
    message.updates = [];
    if (object.label !== undefined && object.label !== null) {
      message.label = String(object.label);
    } else {
      message.label = "";
    }
    if (object.updates !== undefined && object.updates !== null) {
      for (const e of object.updates) {
        message.updates.push(WidgetUpdate.fromJSON(e));
      }
    }
    return message;
  },

  toJSON(message: WidgetUpdates): unknown {
    const obj: any = {};
    message.label !== undefined && (obj.label = message.label);
    if (message.updates) {
      obj.updates = message.updates.map((e) =>
        e ? WidgetUpdate.toJSON(e) : undefined
      );
    } else {
      obj.updates = [];
    }
    return obj;
  },

  fromPartial(object: DeepPartial<WidgetUpdates>): WidgetUpdates {
    const message = { ...baseWidgetUpdates } as WidgetUpdates;
    message.updates = [];
    if (object.label !== undefined && object.label !== null) {
      message.label = object.label;
    } else {
      message.label = "";
    }
    if (object.updates !== undefined && object.updates !== null) {
      for (const e of object.updates) {
        message.updates.push(WidgetUpdate.fromPartial(e));
      }
    }
    return message;
  },
};

const baseNewWidget: object = { label: "" };

export const NewWidget = {
  encode(
    message: NewWidget,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.label !== "") {
      writer.uint32(10).string(message.label);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): NewWidget {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseNewWidget } as NewWidget;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.label = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): NewWidget {
    const message = { ...baseNewWidget } as NewWidget;
    if (object.label !== undefined && object.label !== null) {
      message.label = String(object.label);
    } else {
      message.label = "";
    }
    return message;
  },

  toJSON(message: NewWidget): unknown {
    const obj: any = {};
    message.label !== undefined && (obj.label = message.label);
    return obj;
  },

  fromPartial(object: DeepPartial<NewWidget>): NewWidget {
    const message = { ...baseNewWidget } as NewWidget;
    if (object.label !== undefined && object.label !== null) {
      message.label = object.label;
    } else {
      message.label = "";
    }
    return message;
  },
};

const baseWidgetData: object = {};

export const WidgetData = {
  encode(
    message: WidgetData,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.newWidget !== undefined) {
      NewWidget.encode(message.newWidget, writer.uint32(10).fork()).ldelim();
    }
    if (message.widgetUpdates !== undefined) {
      WidgetUpdates.encode(
        message.widgetUpdates,
        writer.uint32(18).fork()
      ).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): WidgetData {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseWidgetData } as WidgetData;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.newWidget = NewWidget.decode(reader, reader.uint32());
          break;
        case 2:
          message.widgetUpdates = WidgetUpdates.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): WidgetData {
    const message = { ...baseWidgetData } as WidgetData;
    if (object.newWidget !== undefined && object.newWidget !== null) {
      message.newWidget = NewWidget.fromJSON(object.newWidget);
    } else {
      message.newWidget = undefined;
    }
    if (object.widgetUpdates !== undefined && object.widgetUpdates !== null) {
      message.widgetUpdates = WidgetUpdates.fromJSON(object.widgetUpdates);
    } else {
      message.widgetUpdates = undefined;
    }
    return message;
  },

  toJSON(message: WidgetData): unknown {
    const obj: any = {};
    message.newWidget !== undefined &&
      (obj.newWidget = message.newWidget
        ? NewWidget.toJSON(message.newWidget)
        : undefined);
    message.widgetUpdates !== undefined &&
      (obj.widgetUpdates = message.widgetUpdates
        ? WidgetUpdates.toJSON(message.widgetUpdates)
        : undefined);
    return obj;
  },

  fromPartial(object: DeepPartial<WidgetData>): WidgetData {
    const message = { ...baseWidgetData } as WidgetData;
    if (object.newWidget !== undefined && object.newWidget !== null) {
      message.newWidget = NewWidget.fromPartial(object.newWidget);
    } else {
      message.newWidget = undefined;
    }
    if (object.widgetUpdates !== undefined && object.widgetUpdates !== null) {
      message.widgetUpdates = WidgetUpdates.fromPartial(object.widgetUpdates);
    } else {
      message.widgetUpdates = undefined;
    }
    return message;
  },
};

const baseCheckbox: object = { label: "", checked: false };

export const Checkbox = {
  encode(
    message: Checkbox,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.label !== "") {
      writer.uint32(10).string(message.label);
    }
    if (message.checked === true) {
      writer.uint32(16).bool(message.checked);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Checkbox {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseCheckbox } as Checkbox;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.label = reader.string();
          break;
        case 2:
          message.checked = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Checkbox {
    const message = { ...baseCheckbox } as Checkbox;
    if (object.label !== undefined && object.label !== null) {
      message.label = String(object.label);
    } else {
      message.label = "";
    }
    if (object.checked !== undefined && object.checked !== null) {
      message.checked = Boolean(object.checked);
    } else {
      message.checked = false;
    }
    return message;
  },

  toJSON(message: Checkbox): unknown {
    const obj: any = {};
    message.label !== undefined && (obj.label = message.label);
    message.checked !== undefined && (obj.checked = message.checked);
    return obj;
  },

  fromPartial(object: DeepPartial<Checkbox>): Checkbox {
    const message = { ...baseCheckbox } as Checkbox;
    if (object.label !== undefined && object.label !== null) {
      message.label = object.label;
    } else {
      message.label = "";
    }
    if (object.checked !== undefined && object.checked !== null) {
      message.checked = object.checked;
    } else {
      message.checked = false;
    }
    return message;
  },
};

const baseF64Slider: object = { label: "", default: 0, min: 0, max: 0 };

export const F64Slider = {
  encode(
    message: F64Slider,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.label !== "") {
      writer.uint32(10).string(message.label);
    }
    if (message.default !== 0) {
      writer.uint32(17).double(message.default);
    }
    if (message.min !== 0) {
      writer.uint32(25).double(message.min);
    }
    if (message.max !== 0) {
      writer.uint32(33).double(message.max);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): F64Slider {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseF64Slider } as F64Slider;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.label = reader.string();
          break;
        case 2:
          message.default = reader.double();
          break;
        case 3:
          message.min = reader.double();
          break;
        case 4:
          message.max = reader.double();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): F64Slider {
    const message = { ...baseF64Slider } as F64Slider;
    if (object.label !== undefined && object.label !== null) {
      message.label = String(object.label);
    } else {
      message.label = "";
    }
    if (object.default !== undefined && object.default !== null) {
      message.default = Number(object.default);
    } else {
      message.default = 0;
    }
    if (object.min !== undefined && object.min !== null) {
      message.min = Number(object.min);
    } else {
      message.min = 0;
    }
    if (object.max !== undefined && object.max !== null) {
      message.max = Number(object.max);
    } else {
      message.max = 0;
    }
    return message;
  },

  toJSON(message: F64Slider): unknown {
    const obj: any = {};
    message.label !== undefined && (obj.label = message.label);
    message.default !== undefined && (obj.default = message.default);
    message.min !== undefined && (obj.min = message.min);
    message.max !== undefined && (obj.max = message.max);
    return obj;
  },

  fromPartial(object: DeepPartial<F64Slider>): F64Slider {
    const message = { ...baseF64Slider } as F64Slider;
    if (object.label !== undefined && object.label !== null) {
      message.label = object.label;
    } else {
      message.label = "";
    }
    if (object.default !== undefined && object.default !== null) {
      message.default = object.default;
    } else {
      message.default = 0;
    }
    if (object.min !== undefined && object.min !== null) {
      message.min = object.min;
    } else {
      message.min = 0;
    }
    if (object.max !== undefined && object.max !== null) {
      message.max = object.max;
    } else {
      message.max = 0;
    }
    return message;
  },
};

const baseComponent: object = {};

export const Component = {
  encode(
    message: Component,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.checkbox !== undefined) {
      Checkbox.encode(message.checkbox, writer.uint32(10).fork()).ldelim();
    }
    if (message.f64Slider !== undefined) {
      F64Slider.encode(message.f64Slider, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Component {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseComponent } as Component;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.checkbox = Checkbox.decode(reader, reader.uint32());
          break;
        case 2:
          message.f64Slider = F64Slider.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Component {
    const message = { ...baseComponent } as Component;
    if (object.checkbox !== undefined && object.checkbox !== null) {
      message.checkbox = Checkbox.fromJSON(object.checkbox);
    } else {
      message.checkbox = undefined;
    }
    if (object.f64Slider !== undefined && object.f64Slider !== null) {
      message.f64Slider = F64Slider.fromJSON(object.f64Slider);
    } else {
      message.f64Slider = undefined;
    }
    return message;
  },

  toJSON(message: Component): unknown {
    const obj: any = {};
    message.checkbox !== undefined &&
      (obj.checkbox = message.checkbox
        ? Checkbox.toJSON(message.checkbox)
        : undefined);
    message.f64Slider !== undefined &&
      (obj.f64Slider = message.f64Slider
        ? F64Slider.toJSON(message.f64Slider)
        : undefined);
    return obj;
  },

  fromPartial(object: DeepPartial<Component>): Component {
    const message = { ...baseComponent } as Component;
    if (object.checkbox !== undefined && object.checkbox !== null) {
      message.checkbox = Checkbox.fromPartial(object.checkbox);
    } else {
      message.checkbox = undefined;
    }
    if (object.f64Slider !== undefined && object.f64Slider !== null) {
      message.f64Slider = F64Slider.fromPartial(object.f64Slider);
    } else {
      message.f64Slider = undefined;
    }
    return message;
  },
};

const baseUpdateBuffer: object = {};

export const UpdateBuffer = {
  encode(
    message: UpdateBuffer,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.widgetDataVec) {
      WidgetData.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.componentVec) {
      Component.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UpdateBuffer {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseUpdateBuffer } as UpdateBuffer;
    message.widgetDataVec = [];
    message.componentVec = [];
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.widgetDataVec.push(
            WidgetData.decode(reader, reader.uint32())
          );
          break;
        case 2:
          message.componentVec.push(Component.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): UpdateBuffer {
    const message = { ...baseUpdateBuffer } as UpdateBuffer;
    message.widgetDataVec = [];
    message.componentVec = [];
    if (object.widgetDataVec !== undefined && object.widgetDataVec !== null) {
      for (const e of object.widgetDataVec) {
        message.widgetDataVec.push(WidgetData.fromJSON(e));
      }
    }
    if (object.componentVec !== undefined && object.componentVec !== null) {
      for (const e of object.componentVec) {
        message.componentVec.push(Component.fromJSON(e));
      }
    }
    return message;
  },

  toJSON(message: UpdateBuffer): unknown {
    const obj: any = {};
    if (message.widgetDataVec) {
      obj.widgetDataVec = message.widgetDataVec.map((e) =>
        e ? WidgetData.toJSON(e) : undefined
      );
    } else {
      obj.widgetDataVec = [];
    }
    if (message.componentVec) {
      obj.componentVec = message.componentVec.map((e) =>
        e ? Component.toJSON(e) : undefined
      );
    } else {
      obj.componentVec = [];
    }
    return obj;
  },

  fromPartial(object: DeepPartial<UpdateBuffer>): UpdateBuffer {
    const message = { ...baseUpdateBuffer } as UpdateBuffer;
    message.widgetDataVec = [];
    message.componentVec = [];
    if (object.widgetDataVec !== undefined && object.widgetDataVec !== null) {
      for (const e of object.widgetDataVec) {
        message.widgetDataVec.push(WidgetData.fromPartial(e));
      }
    }
    if (object.componentVec !== undefined && object.componentVec !== null) {
      for (const e of object.componentVec) {
        message.componentVec.push(Component.fromPartial(e));
      }
    }
    return message;
  },
};

const baseCheckboxEvent: object = { label: "", checked: false };

export const CheckboxEvent = {
  encode(
    message: CheckboxEvent,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.label !== "") {
      writer.uint32(10).string(message.label);
    }
    if (message.checked === true) {
      writer.uint32(16).bool(message.checked);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CheckboxEvent {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseCheckboxEvent } as CheckboxEvent;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.label = reader.string();
          break;
        case 2:
          message.checked = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): CheckboxEvent {
    const message = { ...baseCheckboxEvent } as CheckboxEvent;
    if (object.label !== undefined && object.label !== null) {
      message.label = String(object.label);
    } else {
      message.label = "";
    }
    if (object.checked !== undefined && object.checked !== null) {
      message.checked = Boolean(object.checked);
    } else {
      message.checked = false;
    }
    return message;
  },

  toJSON(message: CheckboxEvent): unknown {
    const obj: any = {};
    message.label !== undefined && (obj.label = message.label);
    message.checked !== undefined && (obj.checked = message.checked);
    return obj;
  },

  fromPartial(object: DeepPartial<CheckboxEvent>): CheckboxEvent {
    const message = { ...baseCheckboxEvent } as CheckboxEvent;
    if (object.label !== undefined && object.label !== null) {
      message.label = object.label;
    } else {
      message.label = "";
    }
    if (object.checked !== undefined && object.checked !== null) {
      message.checked = object.checked;
    } else {
      message.checked = false;
    }
    return message;
  },
};

const baseF64SliderEvent: object = { label: "", value: 0 };

export const F64SliderEvent = {
  encode(
    message: F64SliderEvent,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.label !== "") {
      writer.uint32(10).string(message.label);
    }
    if (message.value !== 0) {
      writer.uint32(17).double(message.value);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): F64SliderEvent {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseF64SliderEvent } as F64SliderEvent;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.label = reader.string();
          break;
        case 2:
          message.value = reader.double();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): F64SliderEvent {
    const message = { ...baseF64SliderEvent } as F64SliderEvent;
    if (object.label !== undefined && object.label !== null) {
      message.label = String(object.label);
    } else {
      message.label = "";
    }
    if (object.value !== undefined && object.value !== null) {
      message.value = Number(object.value);
    } else {
      message.value = 0;
    }
    return message;
  },

  toJSON(message: F64SliderEvent): unknown {
    const obj: any = {};
    message.label !== undefined && (obj.label = message.label);
    message.value !== undefined && (obj.value = message.value);
    return obj;
  },

  fromPartial(object: DeepPartial<F64SliderEvent>): F64SliderEvent {
    const message = { ...baseF64SliderEvent } as F64SliderEvent;
    if (object.label !== undefined && object.label !== null) {
      message.label = object.label;
    } else {
      message.label = "";
    }
    if (object.value !== undefined && object.value !== null) {
      message.value = object.value;
    } else {
      message.value = 0;
    }
    return message;
  },
};

const baseEvent: object = {};

export const Event = {
  encode(message: Event, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.checkboxEvent !== undefined) {
      CheckboxEvent.encode(
        message.checkboxEvent,
        writer.uint32(10).fork()
      ).ldelim();
    }
    if (message.f64SliderEvent !== undefined) {
      F64SliderEvent.encode(
        message.f64SliderEvent,
        writer.uint32(18).fork()
      ).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Event {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseEvent } as Event;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.checkboxEvent = CheckboxEvent.decode(reader, reader.uint32());
          break;
        case 2:
          message.f64SliderEvent = F64SliderEvent.decode(
            reader,
            reader.uint32()
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Event {
    const message = { ...baseEvent } as Event;
    if (object.checkboxEvent !== undefined && object.checkboxEvent !== null) {
      message.checkboxEvent = CheckboxEvent.fromJSON(object.checkboxEvent);
    } else {
      message.checkboxEvent = undefined;
    }
    if (object.f64SliderEvent !== undefined && object.f64SliderEvent !== null) {
      message.f64SliderEvent = F64SliderEvent.fromJSON(object.f64SliderEvent);
    } else {
      message.f64SliderEvent = undefined;
    }
    return message;
  },

  toJSON(message: Event): unknown {
    const obj: any = {};
    message.checkboxEvent !== undefined &&
      (obj.checkboxEvent = message.checkboxEvent
        ? CheckboxEvent.toJSON(message.checkboxEvent)
        : undefined);
    message.f64SliderEvent !== undefined &&
      (obj.f64SliderEvent = message.f64SliderEvent
        ? F64SliderEvent.toJSON(message.f64SliderEvent)
        : undefined);
    return obj;
  },

  fromPartial(object: DeepPartial<Event>): Event {
    const message = { ...baseEvent } as Event;
    if (object.checkboxEvent !== undefined && object.checkboxEvent !== null) {
      message.checkboxEvent = CheckboxEvent.fromPartial(object.checkboxEvent);
    } else {
      message.checkboxEvent = undefined;
    }
    if (object.f64SliderEvent !== undefined && object.f64SliderEvent !== null) {
      message.f64SliderEvent = F64SliderEvent.fromPartial(
        object.f64SliderEvent
      );
    } else {
      message.f64SliderEvent = undefined;
    }
    return message;
  },
};

type Builtin =
  | Date
  | Function
  | Uint8Array
  | string
  | number
  | boolean
  | undefined;
export type DeepPartial<T> = T extends Builtin
  ? T
  : T extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U>
  ? ReadonlyArray<DeepPartial<U>>
  : T extends {}
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}

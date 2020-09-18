import { observable, computed, ObservableMap } from "mobx";
import { Image } from "../../genproto/farm_ng_proto/tractor/v1/image";
import { Resource } from "../../genproto/farm_ng_proto/tractor/v1/resource";
import { BusEventEmitter } from "../models/BusEventEmitter";
import { ResourceArchive } from "../models/ResourceArchive";
import { UploadBuffer } from "../models/UploadBuffer";
import { EventTypeId } from "../registry/events";
import {
  Visualizer,
  VisualizerId,
  VisualizerOption,
  VisualizerOptionConfig,
  visualizerRegistry
} from "../registry/visualization";
import { Buffer } from "../types/common";

export function visualizerId(v: Visualizer): VisualizerId {
  return Object.getPrototypeOf(v).constructor.id;
}

export class Panel {
  public id = Math.random().toString(36).substring(7);

  @observable tagFilter = "";
  @observable eventType: EventTypeId =
    "type.googleapis.com/farm_ng_proto.tractor.v1.Vec2";
  @observable selectedVisualizer = 0;
  @observable selectedOptions = this.optionConfigs.map((_) => 0);

  @computed get visualizers(): Visualizer[] {
    return Object.values(visualizerRegistry).filter(
      (v) => v.types.includes(this.eventType) || v.types === "*"
    );
  }

  @computed get visualizer(): Visualizer {
    return this.visualizers[this.selectedVisualizer];
  }

  @computed get optionConfigs(): VisualizerOptionConfig[] {
    return this.visualizer.options;
  }

  @computed get options(): VisualizerOption[] {
    return this.optionConfigs.map((o, index) => ({
      ...o,
      value: o.options[this.selectedOptions[index]]
    }));
  }

  setEventType(d: EventTypeId): void {
    this.eventType = d;
    this.selectedVisualizer = 0;
    this.selectedOptions = this.optionConfigs.map((_) => 0);
  }

  setVisualizer(index: number): void {
    this.selectedVisualizer = index;
    this.selectedOptions = this.optionConfigs.map((_) => 0);
  }

  setOption(optionIndex: number, valueIndex: number): void {
    this.selectedOptions[optionIndex] = valueIndex;
  }
}

export type DataSourceType = "live" | "pause" | "log";

function testBuffer(): Buffer {
  return {
    "type.googleapis.com/farm_ng_proto.tractor.v1.Image": {
      foo: [
        "a.jpg",
        "b.jpg",
        "c.jpg",
        "foo/a.jpg",
        "foo/bar/a.jpg",
        "foo/bar/b.jpg",
        "foo/bar/c.png"
      ].map((path, i) => [
        i,
        Image.fromJSON({ resource: Resource.fromJSON({ path }) })
      ])
    }
  };
}

export class VisualizationStore {
  @observable dataSource: DataSourceType = "log";
  @observable bufferStart: Date | null = null;
  @observable bufferEnd: Date | null = null;
  @observable bufferRangeStart = 0;
  @observable bufferRangeEnd = 1;
  @observable bufferThrottle = 0;
  @observable bufferSize = 0;
  @observable buffer: Buffer = {};
  @observable bufferLoadProgress = 0;
  @observable resourceArchive: ResourceArchive | null = null;

  @observable panels: ObservableMap<string, Panel>;

  private streamingBuffer: UploadBuffer = new UploadBuffer();
  private streamingUpdatePeriod = 1000;

  constructor(public busEventEmitter: BusEventEmitter) {
    const p = new Panel();
    this.panels = new ObservableMap<string, Panel>([[p.id, p]]);
    this.buffer = testBuffer();

    this.busEventEmitter.on("*", (event) => {
      if (this.dataSource !== "live") {
        return;
      }
      this.streamingBuffer.add(event);
    });
    setInterval(() => {
      if (this.dataSource !== "live") {
        return;
      }
      // this.buffer = this.streamingBuffer.data;
      Object.entries(this.streamingBuffer.data).forEach(
        ([typeKey, streams]) => {
          this.buffer[typeKey as EventTypeId] =
            this.buffer[typeKey as EventTypeId] || {};
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          Object.entries(streams!).forEach(([streamKey, values]) => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.buffer[typeKey as EventTypeId]![streamKey] =
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              [
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                ...(this.buffer[typeKey as EventTypeId]![streamKey] || []),
                ...values
              ] || values;
          });
        }
      );
      this.bufferStart = this.bufferStart || this.streamingBuffer.bufferStart;
      this.bufferEnd = this.streamingBuffer.bufferEnd;
      this.streamingBuffer = new UploadBuffer();
    }, this.streamingUpdatePeriod);
  }

  addPanel(): void {
    const panel = new Panel();
    this.panels.set(panel.id, panel);
  }

  setDataSource(d: DataSourceType): void {
    this.dataSource = d;
    this.buffer = {};
    this.setBufferRangeStart(0);
    this.setBufferRangeEnd(1);
    this.bufferLoadProgress = 0;
    this.bufferSize = 0;
  }

  setBufferRangeStart(value: number): void {
    if (value < this.bufferRangeEnd) {
      this.bufferRangeStart = value;
    }
  }

  setBufferRangeEnd(value: number): void {
    if (value > this.bufferRangeStart) {
      this.bufferRangeEnd = value;
    }
  }

  setBuffer(buffer: Buffer): void {
    this.buffer = buffer;
  }

  deletePanel(id: string): void {
    this.panels.delete(id);
  }
}

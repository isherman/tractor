import { observable, computed } from "mobx";
import { BusEventEmitter } from "../models/BusEventEmitter";
import { ResourceArchive } from "../models/ResourceArchive";
import { StreamingBuffer } from "../models/StreamingBuffer";
import { EventTypeId } from "../registry/events";
import {
  Visualizer,
  VisualizerId,
  VisualizerOption,
  VisualizerOptionConfig,
  visualizerRegistry
} from "../registry/visualization";
import { Buffer } from "../types/common";
import { duration } from "../utils/duration";

export function visualizerId(v: Visualizer): VisualizerId {
  return Object.getPrototypeOf(v).constructor.id;
}

function mapToDateRange(value: number, startDate: Date, endDate: Date): Date {
  return new Date(
    startDate.getTime() + (endDate.getTime() - startDate.getTime()) * value
  );
}

export class Panel {
  public id = Math.random().toString(36).substring(7);

  @observable tagFilter = "";
  @observable eventType: EventTypeId | null = null;
  @observable selectedVisualizer = 0;
  @observable selectedOptions = this.optionConfigs.map((_) => 0);

  @computed get visualizers(): Visualizer[] {
    return Object.values(visualizerRegistry).filter(
      (v) =>
        (this.eventType && v.types.includes(this.eventType)) || v.types === "*"
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
    this.setVisualizer(0);
  }

  setVisualizer(index: number): void {
    this.selectedVisualizer = index;
    this.selectedOptions = this.optionConfigs.map((_) => 0);
  }

  setOption(optionIndex: number, valueIndex: number): void {
    this.selectedOptions[optionIndex] = valueIndex;
  }
}

export class VisualizationStore {
  @observable isStreaming = false;
  @observable bufferStart: Date | null = null;
  @observable bufferEnd: Date | null = null;
  @observable bufferRangeStart = 0;
  @observable bufferRangeEnd = 1;
  @observable bufferThrottle = 0;
  @observable buffer: Buffer = {};
  @observable bufferLogLoadProgress = 0;
  @observable bufferExpirationWindow = duration.minute;
  @observable resourceArchive: ResourceArchive | null = null;
  @observable panels: { [k: string]: Panel } = {};

  constructor(public busEventEmitter: BusEventEmitter) {
    const p = new Panel();
    this.panels = { [p.id]: p };
  }

  // private streamingBuffer: StreamingBuffer = new StreamingBuffer();
  // private streamingUpdatePeriod = 1000; // ms
  // private startStreaming(): void {
  //   this.busEventEmitter.on("*", (event) => {
  //     if (!this.isStreaming) {
  //       return;
  //     }
  //     this.streamingBuffer.add(event);
  //   });
  //   setInterval(() => {
  //     if (!this.isStreaming) {
  //       return;
  //     }
  //     Object.entries(this.streamingBuffer.data).forEach(
  //       ([typeKey, streams]) => {
  //         this.buffer[typeKey as EventTypeId] =
  //           this.buffer[typeKey as EventTypeId] || {};
  //         // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  //         Object.entries(streams!).forEach(([streamKey, values]) => {
  //           // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  //           this.buffer[typeKey as EventTypeId]![streamKey] =
  //             // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  //             [
  //               // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  //               ...(this.buffer[typeKey as EventTypeId]![streamKey] || []),
  //               ...values
  //             ] || values;
  //         });
  //       }
  //     );
  //     this.bufferStart = this.bufferStart || this.streamingBuffer.bufferStart;
  //     this.bufferEnd = this.streamingBuffer.bufferEnd;
  //     this.streamingBuffer = new StreamingBuffer();
  //   }, this.streamingUpdatePeriod);
  // }

  @computed get bufferEmpty(): boolean {
    return Object.keys(this.buffer).length === 0;
  }

  @computed get bufferRangeStartDate(): Date | null {
    if (!this.bufferStart || !this.bufferEnd) {
      return null;
    }
    return mapToDateRange(
      this.bufferRangeStart,
      this.bufferStart,
      this.bufferEnd
    );
  }

  @computed get bufferRangeEndDate(): Date | null {
    if (!this.bufferStart || !this.bufferEnd) {
      return null;
    }
    return mapToDateRange(
      this.bufferRangeEnd,
      this.bufferStart,
      this.bufferEnd
    );
  }

  addPanel(): void {
    const panel = new Panel();
    this.panels[panel.id] = panel;
  }

  deletePanel(id: string): void {
    delete this.panels[id];
  }

  toggleStreaming(): void {
    const bufferDirty = this.bufferLogLoadProgress > 0;
    if (!this.isStreaming && bufferDirty) {
      this.buffer = {};
      this.setBufferRangeStart(0);
      this.setBufferRangeEnd(1);
      this.bufferStart = null;
      this.bufferEnd = null;
      this.bufferLogLoadProgress = 0;
    }
    this.isStreaming = !this.isStreaming;
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

  replaceBuffer(streamingBuffer: StreamingBuffer): void {
    this.buffer = streamingBuffer.data;
    this.bufferStart = streamingBuffer.bufferStart;
    this.bufferEnd = streamingBuffer.bufferEnd;
  }
}

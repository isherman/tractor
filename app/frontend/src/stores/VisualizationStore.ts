import { observable, computed, ObservableMap } from "mobx";
import {
  EventTypeId,
  Visualizer,
  VisualizerId,
  visualizerMap,
  VisualizerOption,
  VisualizerOptionConfig,
  visualizerRegistry,
  visualizerRegistryGlobals
} from "../data/registry";

export type DataSourceType = "live" | "pause" | "log";

function getVisualizers(eventType: EventTypeId): Visualizer[] {
  const visualizers = visualizerMap[eventType] as Visualizer[];
  return [...(visualizers || []), ...visualizerRegistryGlobals] as Visualizer[];
}

function getVisualizerOptionConfigs(
  visualizerId: VisualizerId
): VisualizerOptionConfig[] {
  return visualizerRegistry[visualizerId].options || [];
}

export class Panel {
  public id = Math.random().toString(36).substring(7);

  @observable tagFilter = "";
  @observable eventType: EventTypeId =
    "type.googleapis.com/farm_ng_proto.tractor.v1.Vec2";
  @observable visualizers: Visualizer[];
  @observable selectedVisualizer: number;
  @observable optionConfigs: VisualizerOptionConfig[];
  @observable selectedOptions: number[];

  constructor() {
    this.visualizers = getVisualizers(this.eventType);
    this.selectedVisualizer = 0;
    this.optionConfigs = getVisualizerOptionConfigs(this.visualizer.name);
    this.selectedOptions = this.optionConfigs.map((_) => 0);
  }

  @computed get visualizer(): Visualizer {
    return this.visualizers[this.selectedVisualizer];
  }

  @computed get options(): VisualizerOption[] {
    return this.optionConfigs.map((o, index) => ({
      ...o,
      value: o.options[this.selectedOptions[index]]
    }));
  }

  setEventType(d: EventTypeId): void {
    this.eventType = d;
    this.visualizers = getVisualizers(d);
    this.selectedVisualizer = 0;
    this.optionConfigs = getVisualizerOptionConfigs(this.visualizer.name);
    this.selectedOptions = this.optionConfigs.map((_) => 0);
  }

  setVisualizer(index: number): void {
    this.selectedVisualizer = index;
    this.optionConfigs = getVisualizerOptionConfigs(this.visualizer.name);
    this.selectedOptions = this.optionConfigs.map((_) => 0);
  }

  setOption(optionIndex: number, valueIndex: number): void {
    this.selectedOptions[optionIndex] = valueIndex;
  }
}

export class VisualizationStore {
  @observable dataSource: DataSourceType = "live";
  @observable bufferStart = new Date();
  @observable bufferEnd = new Date();
  @observable bufferRangeStart = 0;
  @observable bufferRangeEnd = 1;
  @observable bufferThrottle = 0;
  @observable bufferSize = 0;

  @observable panels: ObservableMap<string, Panel>;

  constructor() {
    const p = new Panel();
    this.panels = new ObservableMap<string, Panel>([[p.id, p]]);
  }

  addPanel(): void {
    const panel = new Panel();
    this.panels.set(panel.id, panel);
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

  deletePanel(id: string): void {
    this.panels.delete(id);
  }
}

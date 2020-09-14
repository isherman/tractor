import { observable, computed, ObservableMap } from "mobx";
import {
  EventTypeId,
  Visualizer,
  VisualizerId,
  visualizerMap,
  VisualizerOption,
  visualizerRegistry
} from "../data/registry";

export type DataSourceType = "live" | "pause" | "log";

function getVisualizers(eventType: EventTypeId): Visualizer[] {
  const registeredVisualizers = visualizerMap[eventType];
  if (registeredVisualizers && registeredVisualizers.length > 0) {
    return registeredVisualizers as Visualizer[];
  }
  return [visualizerRegistry.default];
}

function getVisualizerOptions(visualizerId: VisualizerId): VisualizerOption[] {
  return visualizerRegistry[visualizerId].options;
}

export class Panel {
  @observable tagFilter = "";
  private streams = ["tractor", "steering", "joystick"];
  public id = Math.random().toString(36).substring(7);
  @observable eventType: EventTypeId =
    "type.googleapis.com/farm_ng_proto.tractor.v1.SteeringCommand";
  @observable visualizers: Visualizer[];
  @observable selectedVisualizer: number;
  @observable options: VisualizerOption[];
  @observable selectedOptions: number[];

  constructor() {
    this.visualizers = getVisualizers(this.eventType);
    this.selectedVisualizer = 0;
    this.options = getVisualizerOptions(this.visualizer.name);
    this.selectedOptions = this.options.map((_) => 0);
  }

  @computed get visualizer(): Visualizer {
    return this.visualizers[this.selectedVisualizer];
  }

  @computed get visibleStreams(): string[] {
    return this.streams.filter((_) => new RegExp(this.tagFilter).test(_));
  }

  setEventType(d: EventTypeId): void {
    this.eventType = d;
    this.visualizers = getVisualizers(d);
    this.selectedVisualizer = 0;
    this.options = getVisualizerOptions(this.visualizer.name);
    this.selectedOptions = this.options.map((_) => 0);
  }

  setVisualizer(index: number): void {
    this.selectedVisualizer = index;
    this.options = getVisualizerOptions(this.visualizer.name);
    this.selectedOptions = this.options.map((_) => 0);
  }

  setOption(optionIndex: number, valueIndex: number): void {
    this.selectedOptions[optionIndex] = valueIndex;
  }
}

export class VisualizationStore {
  @observable dataSource: DataSourceType = "live";
  @observable bufferStart = new Date();
  @observable bufferEnd = new Date();
  @observable bufferRangeStart = new Date();
  @observable bufferRangeEnd = new Date();
  @observable bufferRate = 0;
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

  deletePanel(id: string): void {
    this.panels.delete(id);
  }
}

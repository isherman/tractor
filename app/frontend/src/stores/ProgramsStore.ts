/* eslint-disable no-console */
import { computed, observable } from "mobx";
import { decodeAnyEvent } from "../models/decodeAnyEvent";
import { Event as BusEvent } from "../../genproto/farm_ng_proto/tractor/v1/io";
import {
  BusEventEmitter,
  BusEventEmitterHandle
} from "../models/BusEventEmitter";
import { DeserializedEvent, EventType, EventTypeId } from "../registry/events";
import {
  ProgramExecution,
  ProgramSupervisorStatus
} from "../../genproto/farm_ng_proto/tractor/v1/program_supervisor";
import { Program, programForProgramId } from "../registry/programs";
import { Visualizer, visualizersForEventType } from "../registry/visualization";

export class ProgramsStore {
  private busHandle: BusEventEmitterHandle | null = null;

  // The latest supervisor status
  @observable supervisorStatus: ProgramSupervisorStatus | null = null;

  // A buffer of events, as populated by the active program's eventLog predicate
  @observable eventLog: DeserializedEvent[] = [];

  // A user-selected element in the eventLog buffer
  @observable selectedEntry: number | null = null;

  constructor(private busEventEmitter: BusEventEmitter) {}

  @computed get runningProgram(): ProgramExecution | null {
    return this.supervisorStatus?.running?.program || null;
  }

  @computed get lastProgram(): ProgramExecution | null {
    return this.supervisorStatus?.stopped?.lastProgram || null;
  }

  @computed get selectedEvent(): DeserializedEvent | null {
    return this.selectedEntry ? this.eventLog[this.selectedEntry] : null;
  }

  @computed get latestEvent(): DeserializedEvent | null {
    return this.eventLog.length > 0
      ? this.eventLog[this.eventLog.length - 1]
      : null;
  }

  @computed get program(): Program | null {
    const programId = this.runningProgram?.id || this.lastProgram?.id;
    return programId ? programForProgramId(programId) : null;
  }

  @computed get eventLogPredicate(): (e: BusEvent) => boolean {
    return (
      (this.runningProgram && this.program && this.program.eventLogPredicate) ||
      (() => false)
    );
  }

  @computed get inputRequired(): EventType | null {
    return (
      this.runningProgram &&
      this.latestEvent &&
      this.program &&
      this.program.inputRequired(this.latestEvent)
    );
  }

  @computed get visualizer(): Visualizer | null {
    return this.selectedEvent
      ? visualizersForEventType(this.selectedEvent.typeUrl)[0]
      : null;
  }

  public startStreaming(): void {
    this.busHandle = this.busEventEmitter.on("*", (busEvent: BusEvent) => {
      if (!busEvent || !busEvent.data) {
        console.error(`ProgramStore received incomplete event ${busEvent}`);
        return;
      }
      if (
        busEvent.data.typeUrl ===
        "type.googleapis.com/farm_ng_proto.tractor.v1.ProgramSupervisorStatus"
      ) {
        this.supervisorStatus = decodeAnyEvent(busEvent);
      }
      // TODO: ugly
      const eventLogPredicate = (() => this.eventLogPredicate)();
      if (eventLogPredicate(busEvent)) {
        const data = decodeAnyEvent(busEvent);
        if (!data) {
          console.error(`ProgramsStore could not decode Any event`, busEvent);
          return;
        }
        if (eventLogPredicate(busEvent)) {
          this.eventLog.push({
            stamp: busEvent.stamp,
            name: busEvent.name,
            typeUrl: busEvent.data.typeUrl as EventTypeId,
            data
          });
        }
      }
    });
  }

  public stopStreaming(): void {
    if (this.busHandle) {
      this.busHandle.unsubscribe();
      this.busHandle = null;
    }
  }

  public resetEventLog(): void {
    this.eventLog = [];
    this.selectedEntry = null;
  }
}

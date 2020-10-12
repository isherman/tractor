/* eslint-disable no-console */
import { computed, observable } from "mobx";
import { decodeAnyEvent } from "../models/decodeAnyEvent";
import { Event as BusAnyEvent } from "../../genproto/farm_ng_proto/tractor/v1/io";
import {
  BusEventEmitter,
  BusEventEmitterHandle
} from "../models/BusEventEmitter";
import { EventType, EventTypeId } from "../registry/events";
import {
  ProgramExecution,
  ProgramSupervisorStatus
} from "../../genproto/farm_ng_proto/tractor/v1/program_supervisor";
import { BusClient } from "../models/BusClient";
import { Program, programForProgramId } from "../registry/programs";
import { Visualizer, visualizersForEventType } from "../registry/visualization";
import { ResourceArchive } from "../models/ResourceArchive";

export interface EventLogEntry {
  stamp: Date | undefined;
  name: string;
  typeUrl: EventTypeId;
  event: EventType;
}

export class ProgramsStore {
  private busHandle: BusEventEmitterHandle | null = null;

  // The latest supervisor status
  @observable supervisorStatus: ProgramSupervisorStatus | null = null;

  // A buffer of events, as populated by the active program's eventLog predicate
  @observable eventLog: EventLogEntry[] = [];

  // A user-selected element in the eventLog buffer
  @observable selectedEntry: number | null = null;

  constructor(
    public busClient: BusClient,
    private busEventEmitter: BusEventEmitter,
    public resourceArchive: ResourceArchive
  ) {}

  @computed get runningProgram(): ProgramExecution | null {
    return this.supervisorStatus?.running?.program || null;
  }

  @computed get lastProgram(): ProgramExecution | null {
    return this.supervisorStatus?.stopped?.lastProgram || null;
  }

  @computed get selectedEvent(): EventLogEntry | null {
    return this.selectedEntry ? this.eventLog[this.selectedEntry] : null;
  }

  @computed get latestEvent(): EventLogEntry | null {
    return this.eventLog.length > 0
      ? this.eventLog[this.eventLog.length - 1]
      : null;
  }

  @computed get program(): Program | null {
    const programId = this.runningProgram?.id || this.lastProgram?.id;
    return programId ? programForProgramId(programId) : null;
  }

  @computed get eventLogPredicate(): (e: BusAnyEvent) => boolean {
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
    this.busHandle = this.busEventEmitter.on("*", (anyEvent: BusAnyEvent) => {
      if (!anyEvent || !anyEvent.data) {
        console.error(`ProgramStore received incomplete event ${anyEvent}`);
        return;
      }
      if (
        anyEvent.data.typeUrl ===
        "type.googleapis.com/farm_ng_proto.tractor.v1.ProgramSupervisorStatus"
      ) {
        this.supervisorStatus = decodeAnyEvent(anyEvent);
      }
      // TODO: ugly
      const eventLogPredicate = (() => this.eventLogPredicate)();
      if (eventLogPredicate(anyEvent)) {
        const event = decodeAnyEvent(anyEvent);
        if (!event) {
          console.error(`ProgramsStore could not decode Any event`, anyEvent);
          return;
        }
        const logEntry = {
          stamp: anyEvent.stamp,
          name: anyEvent.name,
          typeUrl: anyEvent.data.typeUrl as EventTypeId,
          event
        };
        if (eventLogPredicate(anyEvent)) {
          this.eventLog.push(logEntry);
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

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
import { ProgramUI, programUIForProgramId } from "../registry/programs";
import { Visualizer, visualizersForEventType } from "../registry/visualization";

interface EventLogEntry {
  stamp: Date | undefined;
  name: string;
  typeUrl: EventTypeId;
  event: EventType;
}

const nullPredicate = (): boolean => false;

export class ProgramsStore {
  private busHandle: BusEventEmitterHandle | null = null;

  // The latest supervisor status, automatically managed by the store
  @observable supervisorStatus: ProgramSupervisorStatus | null = null;

  // Specifies events that should be added to the inputRequired buffer (of length 1)
  public inputRequiredPredicate: (e: BusAnyEvent) => boolean = nullPredicate;
  @observable inputRequired: EventLogEntry | null = null;

  // Specifies events that should be added to the eventLog buffer (of unlimited length)
  public eventLogPredicate: (e: BusAnyEvent) => boolean = nullPredicate;
  @observable eventLog: EventLogEntry[] = [];

  // A user-selected element in the eventLog buffer
  @observable selectedEntry: number | null = null;

  constructor(
    public busClient: BusClient,
    private busEventEmitter: BusEventEmitter
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

  @computed get programUI(): ProgramUI | null {
    const programId = this.runningProgram?.id || this.lastProgram?.id;
    return programId ? programUIForProgramId(programId) : null;
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
      const inputRequiredPredicate = (() => this.inputRequiredPredicate)();
      if (eventLogPredicate(anyEvent) || inputRequiredPredicate(anyEvent)) {
        const event = decodeAnyEvent(anyEvent);
        if (!event) {
          console.error(`ProgramsStore could not decode event ${anyEvent}`);
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
        if (inputRequiredPredicate(anyEvent)) {
          this.inputRequired = logEntry;
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

  public reset(): void {
    this.eventLogPredicate = nullPredicate;
    this.eventLog = [];
    this.selectedEntry = null;
    this.inputRequiredPredicate = nullPredicate;
    this.inputRequired = null;
  }
}

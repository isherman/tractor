/* eslint-disable no-console */
import { computed, observable } from "mobx";
import { decodeAnyEvent } from "../models/decodeAnyEvent";
import { Event as BusEvent } from "@farm-ng/genproto-core/farm_ng/core/io";
import {
  BusEventEmitter,
  BusEventEmitterHandle,
} from "../models/BusEventEmitter";
import { EventType } from "../registry/events";
import {
  ProgramExecution,
  ProgramSupervisorStatus,
} from "@farm-ng/genproto-core/farm_ng/core/programd";
import { Program, programForProgramId } from "../registry/programs";
import { TimestampedEventVector } from "../types/common";

export class ProgramsStore {
  private busHandle: BusEventEmitterHandle | null = null;
  private lastInputRequired: EventType | null = null;

  // The latest supervisor status
  @observable supervisorStatus: ProgramSupervisorStatus | null = null;

  // A buffer of events, as populated by the active program's eventLog predicate
  eventLog: TimestampedEventVector<BusEvent> = observable.array([], {
    deep: false,
  });

  // A user-selected element in the eventLog buffer
  @observable selectedEntry: number | null = null;

  constructor(private busEventEmitter: BusEventEmitter) {}

  @computed get runningProgram(): ProgramExecution | null {
    return this.supervisorStatus?.running?.program || null;
  }

  @computed get lastProgram(): ProgramExecution | null {
    return this.supervisorStatus?.stopped?.lastProgram || null;
  }

  @computed get latestEvent(): BusEvent | null {
    return this.eventLog.length > 0
      ? this.eventLog[this.eventLog.length - 1][1]
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
    // Somewhat gross. Avoid triggering a mobx update if we're just receiving
    // the same inputRequired request periodically.
    // TODO(isherman): Rethink this whole area.
    if (this.runningProgram && this.latestEvent && this.program) {
      const inputRequired = this.program.inputRequired(this.latestEvent);
      if (
        JSON.stringify(inputRequired) === JSON.stringify(this.lastInputRequired)
      ) {
        return this.lastInputRequired;
      }
      this.lastInputRequired = inputRequired;
      return inputRequired;
    }
    this.lastInputRequired = null;
    return null;
  }

  public startStreaming(): void {
    this.busHandle = this.busEventEmitter.on("*", (busEvent: BusEvent) => {
      if (!busEvent || !busEvent.data) {
        console.error(`ProgramStore received incomplete event ${busEvent}`);
        return;
      }
      if (
        busEvent.data.typeUrl ===
        "type.googleapis.com/farm_ng.core.ProgramSupervisorStatus"
      ) {
        this.supervisorStatus = decodeAnyEvent(busEvent);
      }
      // TODO: ugly
      const eventLogPredicate = (() => this.eventLogPredicate)();
      if (eventLogPredicate(busEvent) && busEvent.stamp) {
        this.eventLog.push([busEvent.stamp.getTime(), busEvent]);
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

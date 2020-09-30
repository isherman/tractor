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
import { Visualizer, visualizersForEventType } from "../registry/visualization";

interface EventLogEntry {
  stamp: Date | undefined;
  name: string;
  typeUrl: EventTypeId;
  event: EventType;
}

export class ProgramsStore {
  private supervisorBusHandle: BusEventEmitterHandle | null = null;
  @observable supervisorStatus: ProgramSupervisorStatus | null = null;
  private programBusHandle: BusEventEmitterHandle | null = null;
  @observable eventLog: EventLogEntry[] = [];
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

  @computed get visualizer(): Visualizer | null {
    if (!this.selectedEvent) {
      return null;
    }
    return visualizersForEventType(this.selectedEvent.typeUrl)[0];
  }

  public startSupervisor(): void {
    const statusTypeId =
      "type.googleapis.com/farm_ng_proto.tractor.v1.ProgramSupervisorStatus";
    this.supervisorBusHandle = this.busEventEmitter.on(
      statusTypeId,
      (event: BusAnyEvent) => {
        if (!event || !event.data) {
          // eslint-disable-next-line no-console
          console.error(
            `Subscriber to type ${statusTypeId} receives incomplete event ${event}`
          );
          return;
        }
        const typeUrl = event.data.typeUrl as EventTypeId;
        if (typeUrl !== statusTypeId) {
          // eslint-disable-next-line no-console
          console.error(
            `Subscriber to type ${statusTypeId} received message of type ${typeUrl}`
          );
          return;
        }
        this.supervisorStatus = decodeAnyEvent(event);
      }
    );
  }

  public stopSupervisor(): void {
    if (this.supervisorBusHandle) {
      this.supervisorBusHandle.unsubscribe();
      this.supervisorBusHandle = null;
    }
  }

  public startProgram(): void {
    this.programBusHandle = this.busEventEmitter.on(
      "*",
      (anyEvent: BusAnyEvent) => {
        if (!anyEvent || !anyEvent.data) {
          console.error(`ProgramsStore received incomplete event ${anyEvent}`);
          return;
        }
        if (!anyEvent.name.startsWith("calibrator")) {
          return;
        }
        const event = decodeAnyEvent(anyEvent);
        if (!event) {
          console.error(`ProgramsStore could not decode event ${anyEvent}`);
          return;
        }
        this.eventLog.push({
          stamp: anyEvent.stamp,
          name: anyEvent.name,
          typeUrl: anyEvent.data.typeUrl as EventTypeId,
          event
        });
      }
    );
  }

  public stopProgram(): void {
    if (this.programBusHandle) {
      this.programBusHandle.unsubscribe();
      this.programBusHandle = null;
    }
  }
}

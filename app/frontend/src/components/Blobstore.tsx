/* eslint-disable no-console */
import {
  FileBrowser,
  FileSearch,
  FileToolbar,
  FileList,
  FileData,
  ChonkyActions,
  FileAction,
  FileActionData
} from "chonky";
import * as React from "react";
import "chonky/style/main.css";
import { useEffect, useState } from "react";
import { File } from "../../genproto/farm_ng_proto/tractor/v1/resource";
import { httpResourceArchive } from "../contexts";
import styles from "./Blobstore.module.scss";
import { TractorConfig } from "../../genproto/farm_ng_proto/tractor/v1/tractor";
import { eventRegistry, EventType, EventTypeId } from "../registry/events";
import { visualizersForEventType } from "../registry/visualization";
import { Button } from "react-bootstrap";

// TODO: import
const baseUrl = `http://${window.location.hostname}:8081/blobstore`;

const fileToFileData = (f: File): FileData => ({
  id: f.name,
  name: f.name,
  isDir: Boolean(f.directory),
  modDate: f.modificationTime,
  size: parseInt((f.size as unknown) as string) // TODO: fix
});

const folderChainToPath = (folderChain: FileData[]): string =>
  folderChain
    .slice(1)
    .map((_) => _.name)
    .join("/") + (folderChain.length > 1 ? "/" : "");

const exampleTractorConfig = TractorConfig.fromPartial({
  wheelRadius: 1,
  hubMotorGearRatio: 10.5,
  hubMotorPollPairs: 6,
  basePosesSensor: [
    {
      frameA: "base",
      frameB: "camera_left",
      aPoseB: { position: { x: 0.2, y: 1, z: 2.2 } }
    }
  ]
});
console.log(TractorConfig.toJSON(exampleTractorConfig));

export const Blobstore: React.FC = () => {
  const [folderChain, setFolderChain] = useState<FileData[]>([]);
  const [dirInfo, setDirInfo] = useState<File>();
  const [selectedPath, setSelectedPath] = useState<string>();
  const [selectedEventType, setSelectedEventType] = useState<EventTypeId>();
  const [selectedResource, setSelectedResource] = useState<EventType>();
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchSelected = async (): Promise<void> => {
      if (!selectedPath) {
        return;
      }
      let eventType: EventTypeId | null = null;
      if (folderChain.map((_) => _.name).includes("apriltag_rig_models")) {
        eventType =
          "type.googleapis.com/farm_ng_proto.tractor.v1.CalibrateApriltagRigResult";
      }
      if (folderChain.map((_) => _.name).includes("configurations")) {
        eventType =
          "type.googleapis.com/farm_ng_proto.tractor.v1.TractorConfig";
      }
      if (folderChain.map((_) => _.name).includes("base_to_camera_models")) {
        eventType =
          "type.googleapis.com/farm_ng_proto.tractor.v1.CalibrateBaseToCameraResult";
      }
      if (folderChain.map((_) => _.name).includes("calibration-datasets")) {
        eventType =
          "type.googleapis.com/farm_ng_proto.tractor.v1.CaptureCalibrationDatasetResult";
      }

      if (!eventType) {
        setSelectedResource(undefined);
        window.open(`${baseUrl}/${selectedPath}`);
        return;
      }
      try {
        const json = await httpResourceArchive.getJson(selectedPath);
        setSelectedEventType(eventType);
        setSelectedResource(eventRegistry[eventType].fromJSON(json));
      } catch (e) {
        console.error(`Error loading resource ${selectedPath}: ${e}`);
      }
    };
    fetchSelected();
  }, [selectedPath]);

  useEffect(() => {
    const fetchFolder = async (): Promise<void> => {
      const path = folderChainToPath(folderChain);
      const response = await fetch(`${baseUrl}/${path}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/protobuf"
        }
      });
      const file = File.decode(new Uint8Array(await response.arrayBuffer()));
      setDirInfo(file);
      if (folderChain.length === 0) {
        setFolderChain((prev) => [...prev, fileToFileData(file)]);
      }
    };
    fetchFolder();
  }, [folderChain]);

  const files = dirInfo?.directory?.files.map<FileData>(fileToFileData);
  const visualizer =
    selectedEventType && visualizersForEventType(selectedEventType)[0];

  const handleFileAction = (action: FileAction, data: FileActionData): void => {
    if (action.id === ChonkyActions.OpenFiles.id) {
      const target = data?.target;
      if (!target) {
        return;
      }
      if (!target.isDir) {
        setSelectedPath(`${folderChainToPath(folderChain)}${target.name}`);
        return;
      }
      const index = folderChain.findIndex((_) => _.id === target.id);
      if (index >= 0) {
        setFolderChain((prev) => prev.slice(0, index));
      } else {
        setFolderChain((prev) => [...prev, target]);
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.browser}>
        <FileBrowser
          files={files || []}
          folderChain={folderChain}
          onFileAction={handleFileAction}
          clearSelectionOnOutsideClick={false}
          defaultFileViewActionId={ChonkyActions.EnableListView.id}
        >
          <FileToolbar />
          <FileSearch />
          <FileList />
        </FileBrowser>
      </div>
      <div className={styles.detail}>
        {selectedResource && !isEditing && (
          <Button onClick={() => setIsEditing(true)}>{"Edit"}</Button>
        )}
        {selectedResource && isEditing && (
          <Button onClick={() => setIsEditing(false)}>{"Cancel"}</Button>
        )}
        {selectedResource && isEditing && (
          <Button onClick={() => setIsEditing(false)}>{"Submit"}</Button>
        )}
        {!isEditing && selectedResource && (
          <>
            {visualizer &&
              React.createElement(visualizer.Component, {
                values: [[0, selectedResource]],
                options: [{ label: "", options: [], value: "overlay" }],
                resources: httpResourceArchive
              })}
          </>
        )}
        {isEditing && selectedResource && visualizer?.Form && (
          <>
            {React.createElement(visualizer.Form, {
              initialValue: selectedResource,
              onChange: (updated) => console.log("Updated: ", updated)
            })}
          </>
        )}
      </div>
    </div>
  );
};

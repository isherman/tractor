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
// import styles from "./Blobstore.module.scss";

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

export const Blobstore: React.FC = () => {
  const [folderChain, setFolderChain] = useState<FileData[]>([]);
  const [dirInfo, setDirInfo] = useState<File | null>(null);

  useEffect(() => {
    const fetchResult = async (): Promise<void> => {
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
    fetchResult();
  }, [folderChain]);

  const files = dirInfo?.directory?.files.map<FileData>(fileToFileData);

  const handleFileAction = (action: FileAction, data: FileActionData): void => {
    if (action.id === ChonkyActions.OpenFiles.id) {
      const target = data?.target;
      if (target) {
        if (!target.isDir) {
          window.open(
            `${baseUrl}/${folderChainToPath(folderChain)}${target.name}`
          );
          return;
        }
        const index = folderChain.findIndex((_) => _.id === target.id);
        if (index >= 0) {
          setFolderChain((prev) => prev.slice(0, index));
        } else {
          setFolderChain((prev) => [...prev, target]);
        }
      }
    }
  };

  return (
    <FileBrowser
      files={files || []}
      folderChain={folderChain}
      onFileAction={handleFileAction}
      defaultFileViewActionId={ChonkyActions.EnableListView.id}
    >
      <FileToolbar />
      <FileSearch />
      <FileList />
    </FileBrowser>
  );
};

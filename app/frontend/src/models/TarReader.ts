const filenameMaxLength = 100;
const fileSizeOffset = 124;
const fileTypeOffset = 156;

interface FileInfo {
  name: string;
  type: string;
  size: number;
  headerOffset: number;
}

function readString(
  buffer: ArrayBuffer,
  strOffset: number,
  size: number
): string {
  const strView = new Uint8Array(buffer, strOffset, size);
  let i = 0;
  let rtnStr = "";
  while (strView[i] != 0) {
    rtnStr += String.fromCharCode(strView[i]);
    i++;
  }
  return rtnStr;
}

function readFileName(buffer: ArrayBuffer, headerOffset: number): string {
  return readString(buffer, headerOffset, filenameMaxLength);
}

function readFileType(buffer: ArrayBuffer, headerOffset: number): string {
  const typeView = new Uint8Array(buffer, headerOffset + fileTypeOffset, 1);
  const typeStr = String.fromCharCode(typeView[0]);
  if (typeStr == "0") {
    return "file";
  } else if (typeStr == "5") {
    return "directory";
  } else {
    return typeStr;
  }
}

function readFileSize(buffer: ArrayBuffer, headerOffset: number): number {
  const szView = new Uint8Array(buffer, headerOffset + fileSizeOffset, 12);
  let szStr = "";
  for (let i = 0; i < 11; i++) {
    szStr += String.fromCharCode(szView[i]);
  }
  return parseInt(szStr, 8);
}

function readFileInfo(buffer: ArrayBuffer): FileInfo[] {
  let offset = 0;
  let fileSize = 0;
  let fileName = "";
  let fileType = null;
  const fileInfo: FileInfo[] = [];
  while (offset < buffer.byteLength - 512) {
    fileName = readFileName(buffer, offset);
    if (fileName.length == 0) {
      break;
    }
    fileType = readFileType(buffer, offset);
    fileSize = readFileSize(buffer, offset);

    fileInfo.push({
      name: fileName,
      type: fileType,
      size: fileSize,
      headerOffset: offset
    });

    offset += 512 + 512 * Math.trunc(fileSize / 512);
    if (fileSize % 512) {
      offset += 512;
    }
  }
  return fileInfo;
}

function readFileBlob(
  buffer: ArrayBuffer,
  fileOffset: number,
  size: number,
  blobProperties?: BlobPropertyBag
): Blob {
  const view = new Uint8Array(buffer, fileOffset, size);
  const blob = new Blob([view], blobProperties);
  return blob;
}

function normalizeName(name: string): string {
  return name.substring(name.indexOf("/") + 1);
}

export class TarReader {
  private data: Promise<{ fileInfo: FileInfo[]; buffer: ArrayBuffer }>;

  constructor(file: File) {
    const reader = new FileReader();
    this.data = new Promise((resolve, reject) => {
      reader.onload = (event) => {
        const buffer = event.target?.result;
        if (!(buffer instanceof ArrayBuffer)) {
          reject(`failed to readAsArrayBuffer ${file.name}`);
        } else {
          const fileInfo = readFileInfo(buffer);
          resolve({ buffer, fileInfo });
        }
      };
      reader.readAsArrayBuffer(file);
    });
  }

  public async getFileBlob(
    fileName: string,
    blobProperties?: BlobPropertyBag
  ): Promise<Blob> {
    const { buffer, fileInfo } = await this.data;
    const info = fileInfo.find((_) => fileName === normalizeName(_.name));
    if (!info) {
      return Promise.reject(`${fileName} not found in tar directory`);
    }
    return readFileBlob(
      buffer,
      info.headerOffset + 512,
      info.size,
      blobProperties
    );
  }

  public async getFileInfo(): Promise<string[]> {
    const { fileInfo } = await this.data;
    return fileInfo.map((_) => _.name);
  }
}

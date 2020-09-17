export class ResourceArchive {
  constructor(private files: FileList | null) {}

  public async get(path: string): Promise<string | null> {
    for (let i = 0; i < (this.files?.length || 0); i++) {
      const file = this.files?.item(i);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const webkitRelativePath = (file as any).webkitRelativePath;
      const normalizedPath = webkitRelativePath.substring(
        webkitRelativePath.indexOf("/") + 1
      );
      if (file && normalizedPath === path) {
        const reader = new FileReader();
        return new Promise((resolve) => {
          reader.onload = (e: ProgressEvent<FileReader>) => {
            resolve(e.target?.result as string);
          };
          reader.readAsDataURL(file);
        });
      }
    }
    return Promise.resolve(null);
  }
}

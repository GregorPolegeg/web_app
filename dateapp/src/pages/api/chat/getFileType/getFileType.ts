export function getFileType(fileUrl: string) {
    const extension = fileUrl.split(".").pop();
    if (extension?.match(/(jpg|jpeg|png|gif)$/i)) {
      return "image";
    }
    if (extension?.match(/(mp4|webm|ogg|avi)$/i)) {
      return "video";
    }
    return null;
  }
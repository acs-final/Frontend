export default function downloadPhoto(url: string, filename: string) {
  const finalFilename = filename ?? url.split("\\").pop()?.split("/").pop() ?? "download";
  fetch(url, {
    headers: new Headers({
      Origin: location.origin,
    }),
    mode: "cors",
  })
    .then((response) => response.blob())
    .then((blob) => {
      const blobUrl = window.URL.createObjectURL(blob);
      forceDownload(blobUrl, finalFilename);
    })
    .catch((e) => console.error(e));
}

function forceDownload(blobUrl: string, filename: string) {
  const a: HTMLAnchorElement = document.createElement("a");
  a.download = filename;
  a.href = blobUrl;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

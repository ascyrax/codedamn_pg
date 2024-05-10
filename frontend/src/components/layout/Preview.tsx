import { useEffect, useRef, useState } from "react";
import { PreviewProps } from "../../models/interfaces";

const Preview: React.FC<PreviewProps> = ({
  filesData,
  previewSrc,
  setPreviewSrc,
}) => {
  let [refreshCnt, setRefreshCnt] = useState<number>(0);
  let refIframe = useRef<HTMLIFrameElement>(null);

  function handleUrlChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPreviewSrc(e.target.value);
  }

  function handleRefresh() {
    setRefreshCnt(refreshCnt + 1);
    if (refIframe && refIframe.current && refIframe.current.src)
      refIframe.current.src = previewSrc;
  }

  return (
    <div id="preview" style={{ height: "100vh", padding: 0 }}>
      <button onClick={handleRefresh} className="refresh-button">
        refresh
      </button>
      <label>
        <input type="text" value={previewSrc} onChange={handleUrlChange} />
      </label>
      <iframe
        id="iFrame"
        ref={refIframe}
        style={{ width: "100%", height: "100%", padding: "1rem" }}
        sandbox={"allow-scripts"}
        src={previewSrc}
        title="Preview"
      ></iframe>
    </div>
  );
};

export { Preview };

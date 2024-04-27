import { useState } from "react";
import MonacoEditor from "react-monaco-editor";

function EditorWithPreview() {
  const [html, setHtml] = useState("");
  const [css, setCss] = useState("");
  const [js, setJs] = useState("");

  const handleHtmlChange = (value: any) => {
    setHtml(value);
  };

  const handleCssChange = (value: any) => {
    setCss(value);
  };

  const handleJsChange = (value: any) => {
    setJs(value);
  };

  const handleRunCode = () => {
    const previewFrame = document.getElementById(
      "preview-frame"
    ) as HTMLIFrameElement;
    const previewContent = `
            <html>
                <head>
                    <style>${css}</style>
                </head>
                <body>${html}</body>
                <script>${js}</script>
            </html>
        `;
    if (previewFrame) previewFrame.srcdoc = previewContent;
  };

  return (
    <div>
      <div style={{ display: "flex" }}>
        <div style={{ flex: 1 }}>
          <MonacoEditor
            language="html"
            theme="vs-dark"
            value={html}
            onChange={handleHtmlChange}
            height="400"
          />
        </div>
        <div style={{ flex: 1 }}>
          <MonacoEditor
            language="css"
            theme="vs-dark"
            value={css}
            onChange={handleCssChange}
            height="400"
          />
        </div>
        <div style={{ flex: 1 }}>
          <MonacoEditor
            language="javascript"
            theme="vs-dark"
            value={js}
            onChange={handleJsChange}
            height="400"
          />
        </div>
      </div>
      <button onClick={handleRunCode}>Run Code</button>
      <div>
        <h3>Preview:</h3>
        <iframe
          id="preview-frame"
          title="Preview"
          width="100%"
          height="400"
        ></iframe>
      </div>
    </div>
  );
}

export default EditorWithPreview;

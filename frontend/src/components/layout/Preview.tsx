import { useEffect, useRef, useState } from "react";
import { PreviewProps } from "../../models/interfaces";

const Preview: React.FC<PreviewProps> = ({ filesData }) => {
  let [htmlCode, setHtmlCode] = useState(
    '<h1 style="color:white"> Welcome :) to the Live Preview </h1>'
  );
  let [cssCode, setCssCode] = useState("");
  let [jsCode, setJsCode] = useState("");
  let [iFrameContent, setIframeContent] = useState(`
  <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <style>${cssCode}</style>
        </head>
        <body>
            ${htmlCode}
            <script>${jsCode}<\/script>
        </body>
        </html>
  `);
  let refIframe = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (filesData) {
      if (filesData["playground/index.html"])
        setHtmlCode(filesData["playground/index.html"].value);
      if (filesData["playground/style.css"])
        setCssCode(filesData["playground/style.css"].value);
      if (filesData["playground/script.js"])
        setJsCode(filesData["playground/script.js"].value);
    }
  }, [filesData]);

  useEffect(() => {
    setIframeContent(`
    <!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <style>${cssCode}</style>
          </head>
          <body>
              ${htmlCode}
              <script>${jsCode}<\/script>
          </body>
          </html>
    `);
  }, [htmlCode, cssCode, jsCode]);

  useEffect(() => {
    if (refIframe.current) refIframe.current.srcdoc = iFrameContent;
  }, [iFrameContent]);

  return (
    <div id="preview" style={{ height: "100vh", padding: 0 }}>
      <iframe
        id="iFrame"
        ref={refIframe}
        style={{ width: "100%", height: "100%" }}
        sandbox={"allow-scripts"}
      ></iframe>
    </div>
  );
};

export { Preview };

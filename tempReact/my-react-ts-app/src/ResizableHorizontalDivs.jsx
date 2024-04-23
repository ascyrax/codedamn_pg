import React, { useState, useEffect } from 'react';
import { Rnd } from 'react-rnd';

function ResizableHorizontalDivs() {
  const [width, setWidth] = useState(window.innerWidth / 2); // Initialize both widths to half the window width

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth / 2); // Reset widths on window resize
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleResizeLeft = (e, direction, ref, delta, position) => {
    setWidth(ref.offsetWidth);
  };

  const handleResizeRight = (e, direction, ref, delta, position) => {
    setWidth(window.innerWidth - ref.offsetWidth);
  };

  return (
    <div style={{ display: 'flex', width: '90vw', height: '100vh' }}>
      <Rnd
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "solid 1px #ddd",
          background: "#f0f0f0"
        }}
        size={{ width: width, height: "100%" }}
        position={{ x: 0, y: 0 }}
        onResize={handleResizeLeft}
        enableResizing={{
          right: true
        }}
        bounds={parent}
        disableDragging={true}
      >
        Left Div (Resizable)
      </Rnd>
      <Rnd
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "solid 1px #ddd",
          background: "#d0e0f0"
        }}
        size={{ width: window.innerWidth - width, height: "100%" }}
        position={{ x: width, y: 0 }}
        onResize={handleResizeRight}
        enableResizing={{
          left: true
        }}
        bounds={parent}
        disableDragging={true}
      >
        Right Div (Resizable)
      </Rnd>
    </div>
  );
}

export default ResizableHorizontalDivs;

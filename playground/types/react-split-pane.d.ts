// types/react-split-pane.d.ts
import * as React from 'react';

declare module 'react-split-pane' {
  export interface SplitPaneProps {
    children?: React.ReactNode;  // Ensure this line is here
  }
}

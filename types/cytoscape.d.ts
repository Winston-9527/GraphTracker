// Type declarations for cytoscape modules without types

declare module 'react-cytoscapejs' {
  import * as React from 'react';
  import * as cytoscape from 'cytoscape';

  interface CytoscapeComponentProps {
    elements: cytoscape.ElementDefinition[];
    stylesheet?: cytoscape.Stylesheet[];
    layout?: cytoscape.LayoutOptions;
    style?: React.CSSProperties;
    className?: string;
    cy?: (cy: cytoscape.Core) => void;
    minZoom?: number;
    maxZoom?: number;
    wheelSensitivity?: number;
  }

  export default class CytoscapeComponent extends React.Component<CytoscapeComponentProps> {}
}

declare module 'cytoscape-cose-bilkent' {
  import * as cytoscape from 'cytoscape';
  
  const coseBilkent: cytoscape.Ext;
  export default coseBilkent;
}

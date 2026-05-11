declare module 'react-cytoscapejs' {
  import * as React from 'react';
  import cytoscape from 'cytoscape';

  interface CytoscapeComponentProps {
    cy?: (cy: cytoscape.Core) => void;
    elements?: cytoscape.ElementDefinition[];
    style?: React.CSSProperties;
    stylesheet?: cytoscape.Stylesheet[];
    layout?: cytoscape.LayoutOptions | Record<string, unknown>;
    wheelSensitivity?: number;
    minZoom?: number;
    maxZoom?: number;
    zoom?: number;
    zoomingEnabled?: boolean;
    userZoomingEnabled?: boolean;
    panningEnabled?: boolean;
    userPanningEnabled?: boolean;
    boxSelectionEnabled?: boolean;
    autoungrabify?: boolean;
    autolock?: boolean;
    autounselectify?: boolean;
    className?: string;
    id?: string;
  }

  export default class CytoscapeComponent extends React.Component<CytoscapeComponentProps> {}
}

declare module 'cytoscape-cose-bilkent' {
  import cytoscape from 'cytoscape';
  const coseBilkent: cytoscape.Ext;
  export default coseBilkent;
}

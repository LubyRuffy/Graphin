import { Group, Shape } from '@antv/g-canvas';
import { IEdge } from '@antv/g6/lib/interface/item';
import { G6Edge } from '../../types';
import { normalizeColor } from './utils';
import {
  EDGE_LINE_DEFAULT_COLOR,
  EDGE_LABEL_DEFAULT_COLOR,
  HIDDEN_LABEL_COLOR,
  GREY,
  EnumNodeAndEdgeStatus,
} from './constants';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default (g6: any) => {
  g6.registerEdge('LineEdge', {
    draw(cfg: G6Edge, group: Group) {
      const hasLabel = cfg.label;
      const { startPoint, endPoint } = cfg;
      const d = (cfg.style?.line?.width || 1) + 1;

      const attrs = {
        path: [
          ['M', startPoint.x, startPoint.y],
          ['L', endPoint.x, endPoint.y],
        ],
      };

      const lineColor = cfg.style?.line?.color ? normalizeColor(cfg.style?.line?.color) : EDGE_LINE_DEFAULT_COLOR;
      const labelColor = cfg.style?.label?.color ? normalizeColor(cfg.style?.label?.color) : EDGE_LABEL_DEFAULT_COLOR;

      group.addShape('path', {
        attrs: {
          id: 'selected',
          ...attrs,
          lineWidth: 1,
          stroke: '#000',
          opacity: 0.05,
        },
        draggable: true,
        name: 'selected',
      });

      const key = group.addShape('path', {
        attrs: {
          id: 'main',
          ...attrs,
          lineAppendWidth: 4,
          stroke: cfg.style?.dark ? GREY.dark : lineColor.dark,
          lineWidth: cfg.style?.dark ? 1 : cfg.style?.line?.width || 1,
          lineDash: cfg.style?.line?.dash,
          endArrow: {
            d: -d / 2,
            path: `M 0,0 L ${d},${d / 2} L ${d},-${d / 2} Z`,
          },
        },
        draggable: true,
        name: 'main',
      });

      if (hasLabel) {
        const label = group.addShape('text', {
          attrs: {
            id: 'label',
            x: 0,
            y: 0,
            fontSize: cfg.style?.label?.size || 12,
            text: cfg.label,
            textAlign: 'center',
            fontFamily: cfg.style?.label?.family,
            fill: cfg.style?.dark ? HIDDEN_LABEL_COLOR.normal : labelColor.dark,
          },
          draggable: true,
          name: 'label',
        });
        label.rotate(
          endPoint.x - startPoint.x === 0
            ? Math.PI / 2
            : Math.atan((endPoint.y - startPoint.y) / (endPoint.x - startPoint.x)),
        );
        label.translate((startPoint.x + endPoint.x) / 2, (startPoint.y + endPoint.y) / 2);
      }
      return key;
    },
    setState(name: EnumNodeAndEdgeStatus, value: string, edge: IEdge) {
      if (!name) return;
      const data: G6Edge = edge.get('model');
      const mainShape = edge
        .getContainer()
        .get('children')
        .find((item: Shape.Base) => item.attr().id === 'main');
      const selectedShape = edge
        .getContainer()
        .get('children')
        .find((item: Shape.Base) => item.attr().id === 'selected');
      const textShape = edge
        .getContainer()
        .get('children')
        .find((item: Shape.Base) => item.attr().id === 'label');
      const d = (data.style?.line?.width || 1) + 1;
      const basicLineWidth = data.style?.dark ? 1 : data.style?.line?.width || 1;
      const lineColor = data.style?.line?.color ? normalizeColor(data.style?.line?.color) : EDGE_LINE_DEFAULT_COLOR;
      const labelColor = data.style?.label?.color ? normalizeColor(data.style?.label?.color) : EDGE_LABEL_DEFAULT_COLOR;

      const targetAttrs = {
        main: {},
        selected: {},
        text: {},
      };

      targetAttrs.main = {
        stroke: data.style?.dark ? GREY.dark : lineColor.dark,
        lineWidth: basicLineWidth,
        endArrow: {
          d: -d / 2,
          path: `M 0,0 L ${d},${d / 2} L ${d},-${d / 2} Z`,
        },
      };
      targetAttrs.selected = {
        lineWidth: 0,
      };
      targetAttrs.text = {
        fill: data.style?.dark ? HIDDEN_LABEL_COLOR.normal : labelColor.dark,
      };

      if (name === EnumNodeAndEdgeStatus.HOVERED && value) {
        const deltaD = d + 1;
        targetAttrs.main = {
          lineWidth: basicLineWidth + 1,
          endArrow: {
            d: -deltaD / 2,
            path: `M 0,0 L ${deltaD},${deltaD / 2} L ${deltaD},-${deltaD / 2} Z`,
          },
        };
      }
      if ((name === EnumNodeAndEdgeStatus.SELECTED && value) || (name === EnumNodeAndEdgeStatus.LIGHT && value)) {
        const deltaD = d + 1;
        targetAttrs.main = {
          lineWidth: basicLineWidth + 1,
          endArrow: {
            d: -deltaD / 2,
            path: `M 0,0 L ${deltaD},${deltaD / 2} L ${deltaD},-${deltaD / 2} Z`,
          },
        };
        targetAttrs.selected = {
          lineWidth: basicLineWidth + 10,
        };
      }
      if (name === EnumNodeAndEdgeStatus.DARK && value) {
        targetAttrs.main = {
          stroke: GREY.dark,
          lineWidth: 1,
          endArrow: {
            d: -1,
            path: 'M 0,0 L 2,1 L 2,-1 Z',
          },
        };
        targetAttrs.text = {
          fill: '#8D93B0',
        };
      }

      mainShape.attr(targetAttrs.main);
      selectedShape.attr(targetAttrs.selected);
      if (textShape) textShape.attr(targetAttrs.text);
    },
  });
};

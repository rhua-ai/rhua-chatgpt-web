import React, {useEffect} from "react";
import mermaid from "mermaid";

interface MermaidBoxProps {
  elementId: string;
  chartContent: string;
}

const isEqual = (prevProps: MermaidBoxProps, currentProps: MermaidBoxProps) => {
  return prevProps.elementId === currentProps.elementId
    && prevProps.chartContent.length === currentProps.chartContent.length;
}

export const MermaidBox: React.FC<MermaidBoxProps> = React.memo((
  {
    elementId,
    chartContent
  }
) => {
  const ref = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    renderChart();
  }, [chartContent]);

  const renderChart = async () => {
    try {
      const { svg, bindFunctions } = await mermaid.render('graph-' + elementId, chartContent);
      if (ref.current) {
        ref.current.innerHTML = svg;
        if (bindFunctions) {
          bindFunctions(ref.current);
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
      } else {
        console.error(error);
      }
    }
  }

  return (
    <div style={{textAlign: 'center', padding: 10}} ref={ref}></div>
  )
}, isEqual);
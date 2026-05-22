import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface VitalWaveformProps {
  data: { value: number; timestamp: number }[];
  color: string;
  width?: number;
  height?: number;
  maxVal?: number;
  label?: string;
  unit?: string;
}

export const VitalWaveform: React.FC<VitalWaveformProps> = ({ 
  data, 
  color, 
  width: fixedWidth, 
  height: fixedHeight = 80,
  maxVal = 200,
  label,
  unit
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: fixedWidth || 0, height: fixedHeight });
  const [tooltip, setTooltip] = useState<{ x: number; y: number; value: number; timestamp: number } | null>(null);

  useEffect(() => {
    if (fixedWidth) return;
    
    const observer = new ResizeObserver(entries => {
      if (entries[0]) {
        setDimensions({
          width: entries[0].contentRect.width,
          height: entries[0].contentRect.height || fixedHeight
        });
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [fixedWidth, fixedHeight]);

  useEffect(() => {
    if (!svgRef.current || data.length === 0 || dimensions.width === 0) return;

    const width = dimensions.width;
    const height = dimensions.height;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 10, right: 10, bottom: 10, left: 10 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
      .domain([0, data.length - 1])
      .range([0, innerWidth]);

    const y = d3.scaleLinear()
      .domain([0, maxVal])
      .range([innerHeight, 0]);

    const line = d3.line<{ value: number; timestamp: number }>()
      .x((_, i) => x(i))
      .y(d => y(d.value))
      .curve(d3.curveMonotoneX);

    // Add gradient
    const gradientId = `vital-gradient-${Math.random().toString(36).substr(2, 9)}`;
    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
      .attr("id", gradientId)
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");

    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", color)
      .attr("stop-opacity", 0.4);

    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", color)
      .attr("stop-opacity", 0);

    // Area
    const area = d3.area<{ value: number; timestamp: number }>()
      .x((_, i) => x(i))
      .y0(innerHeight)
      .y1(d => y(d.value))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(data)
      .attr("fill", `url(#${gradientId})`)
      .attr("d", area);

    // Line
    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", color)
      .attr("stroke-width", 2)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("d", line);

    // Add grid lines (horizontal)
    const yTicks = [maxVal * 0.25, maxVal * 0.5, maxVal * 0.75];
    g.selectAll(".grid-line")
      .data(yTicks)
      .enter()
      .append("line")
      .attr("class", "grid-line")
      .attr("x1", 0)
      .attr("x2", innerWidth)
      .attr("y1", d => y(d))
      .attr("y2", d => y(d))
      .attr("stroke", "currentColor")
      .attr("stroke-width", 0.5)
      .attr("stroke-opacity", 0.1)
      .attr("stroke-dasharray", "2,2");

    // Interaction layer
    const bisect = d3.bisector((d: any, i: number) => i).left;

    const overlay = svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "transparent")
      .on("mousemove", (event) => {
        const [mx] = d3.pointer(event);
        const xPos = mx - margin.left;
        const i = Math.round(x.invert(xPos));
        const d = data[i];

        if (d) {
          setTooltip({
            x: x(i) + margin.left,
            y: y(d.value) + margin.top,
            value: d.value,
            timestamp: d.timestamp
          });
        }
      })
      .on("mouseleave", () => setTooltip(null));

    if (tooltip) {
      g.append("circle")
        .attr("cx", x(data.findIndex(d => d.timestamp === tooltip.timestamp)))
        .attr("cy", y(tooltip.value))
        .attr("r", 4)
        .attr("fill", color)
        .attr("stroke", "white")
        .attr("stroke-width", 2);
      
      g.append("line")
        .attr("x1", x(data.findIndex(d => d.timestamp === tooltip.timestamp)))
        .attr("x2", x(data.findIndex(d => d.timestamp === tooltip.timestamp)))
        .attr("y1", 0)
        .attr("y2", innerHeight)
        .attr("stroke", color)
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "4,4")
        .attr("opacity", 0.5);
    }

  }, [data, color, dimensions, maxVal, tooltip]);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[40px] relative">
      <svg 
        ref={svgRef} 
        width={dimensions.width} 
        height={dimensions.height} 
        className="overflow-visible"
      />
      {tooltip && (
        <div 
          className="absolute z-[100] bg-slate-900 text-white rounded-xl p-3 shadow-2xl pointer-events-none border border-white/10 backdrop-blur-md"
          style={{ 
            left: `${Math.min(dimensions.width - 120, Math.max(10, tooltip.x - 60))}px`, 
            top: `${Math.max(-100, tooltip.y - 110)}px` 
          }}
        >
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label || 'Reading'}</p>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-xl font-black">{tooltip.value.toFixed(1)}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase">{unit}</span>
          </div>
          <p className="text-[9px] font-bold text-slate-500">{new Date(tooltip.timestamp).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
};

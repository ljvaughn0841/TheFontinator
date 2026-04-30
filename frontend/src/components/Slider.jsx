import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

// Generates a smooth bell-ish distribution curve for mock data
// Replace this with your real API call
const generateDistribution = (min, max, points = 60) => {
  return d3.range(points).map(i => {
    const x = min + (i / (points - 1)) * (max - min);
    // Slightly randomized bell curve so each slider looks unique
    const center = min + (max - min) * (0.4 + Math.random() * 0.2);
    const spread = (max - min) * 0.25;
    const y = Math.exp(-0.5 * Math.pow((x - center) / spread, 2));
    return { x, y };
  });
};




const Slider = ({ label, min = 0, max = 100, value, onChange }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [distribution] = useState(() => generateDistribution(min, max));

  useEffect(() => {
    if (!svgRef.current) return;

    const W = svgRef.current.clientWidth || 260;
    const H = 80;
    const margin = { left: 12, right: 12, top: 8, bottom: 20 };
    const innerW = W - margin.left - margin.right;
    const innerH = H - margin.top - margin.bottom;

    // Clear previous render
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', W)
      .attr('height', H);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleLinear().domain([min, max]).range([0, innerW]);
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(distribution, d => d.y)])
      .range([innerH, 0]);

    // Smooth curve generator
    const area = d3.area()
      .x(d => xScale(d.x))
      .y0(innerH)
      .y1(d => yScale(d.y))
      .curve(d3.curveBasis);

    const line = d3.line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveBasis);

    // Clip path — only show area between the two handles
    svg.append('defs').append('clipPath')
      .attr('id', `clip-${label}`)
      .append('rect')
      .attr('x', margin.left + xScale(value[0]))
      .attr('y', margin.top)
      .attr('width', xScale(value[1]) - xScale(value[0]))
      .attr('height', innerH);

    // Full dim area (unselected)
    g.append('path')
      .datum(distribution)
      .attr('d', area)
      .attr('fill', 'rgba(255,255,255,0.06)');

    // Highlighted area (selected range)
    g.append('path')
      .attr('class', 'selected-area')
      .datum(distribution)
      .attr('d', area)
      .attr('fill', 'rgba(255,255,255,0.25)')
      .attr('clip-path', `url(#clip-${label})`);

    // Curve line on top
    g.append('path')
      .datum(distribution)
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', 'rgba(255,255,255,0.4)')
      .attr('stroke-width', 1.5);

    // Track line
    g.append('line')
      .attr('x1', 0).attr('x2', innerW)
      .attr('y1', innerH).attr('y2', innerH)
      .attr('stroke', 'rgba(255,255,255,0.15)')
      .attr('stroke-width', 1);

    // Active track segment between handles
    g.append('line')
      .attr('class', 'active-track')
      .attr('x1', xScale(value[0])).attr('x2', xScale(value[1]))
      .attr('y1', innerH).attr('y2', innerH)
      .attr('stroke', 'rgba(255,255,255,0.7)')
      .attr('stroke-width', 2)
      .attr('stroke-linecap', 'round');

    // Drag behavior factory
    const makeDrag = (handleIndex) => d3.drag()
      .on('drag', (event) => {
        const [px] = d3.pointer(event, svgRef.current);
        const rawX = px - margin.left;
        const newVal = Math.round(xScale.invert(rawX));
        const clamped = Math.max(min, Math.min(max, newVal));

        const next = [...value];
        if (handleIndex === 0) {
          next[0] = Math.min(clamped, value[1] - 1);
        } else {
          next[1] = Math.max(clamped, value[0] + 1);
        }
        onChange(next);
      });

    // Handle circles
    [value[0], value[1]].forEach((val, i) => {
      g.append('circle')
        .attr('cx', xScale(val))
        .attr('cy', innerH)
        .attr('r', 6)
        .attr('fill', '#fff')
        .attr('stroke', 'rgba(0,0,0,0.3)')
        .attr('stroke-width', 1.5)
        .attr('cursor', 'grab')
        .style('filter', 'drop-shadow(0 1px 3px rgba(0,0,0,0.4))')
        .call(makeDrag(i));
    });

    // Min/max labels
    g.append('text')
      .attr('x', 0).attr('y', innerH + 16)
      .attr('fill', 'rgba(255,255,255,0.35)')
      .attr('font-size', 10)
      .text(min);

    g.append('text')
      .attr('x', innerW).attr('y', innerH + 16)
      .attr('fill', 'rgba(255,255,255,0.35)')
      .attr('font-size', 10)
      .attr('text-anchor', 'end')
      .text(max);

  }, [value, distribution, min, max, label, onChange]);

  return (
    <div ref={containerRef} className='px-3 py-3'>
      <div className='flex justify-between items-baseline mb-1'>
        <p className='text-xs uppercase tracking-widest text-white/50'>{label}</p>
        <p className='text-xs text-white/70 font-mono'>{value[0]} – {value[1]}</p>
      </div>
      <svg ref={svgRef} className='w-full' />
    </div>
  );
};

export default Slider;
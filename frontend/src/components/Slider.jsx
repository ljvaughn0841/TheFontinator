import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { debounce } from 'lodash';
import * as d3 from 'd3';

const Slider = ({ label, sliderKey, min = 0, max = 100, value, onChange, fontFilters }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);

  // Two separate distributions from the API
  const [fullDist, setFullDist] = useState([]);       // all fonts — static, fetched once
  const [filteredDist, setFilteredDist] = useState([]); // fonts matching current range

  // Fetch the full distribution once on mount
  useEffect(() => {
    const fetchFull = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/distribution', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: sliderKey }),
        });
        const data = await res.json();
        setFullDist(data); // expects [{ x, y }, ...]
      } catch (err) {
        console.error(`Failed to fetch full distribution for ${sliderKey}:`, err);
      }
    };
    fetchFull();
  }, [sliderKey]); // only re-runs if the slider key changes

  // Fetch the filtered distribution whenever the range changes
  // Debounced fetch — created once, stable across renders
  const debouncedFetch = useMemo(
    () => debounce(async (key, filters) => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/distribution/filtered', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, filters }),
        });
        const data = await res.json();
        setFilteredDist(data);
      } catch (err) {
        console.error(`Failed to fetch filtered distribution for ${key}:`, err);
      }
    }, 200),
    [] // created once on mount, never recreated
  );

  // Cancel any pending debounced call when component unmounts
  useEffect(() => {
    return () => debouncedFetch.cancel();
  }, [debouncedFetch]);

  // Call the debounced fetch when filters change
  useEffect(() => {
    if (!value || !fontFilters) return;
    debouncedFetch(sliderKey, fontFilters);
  }, [sliderKey, fontFilters]);

  // D3 render — runs when either distribution or value changes
  useEffect(() => {
    if (!svgRef.current || !fullDist.length) return;
    console.log(`${sliderKey} fullDist yMax:`, d3.max(fullDist, d => d.y));
    console.log(`${sliderKey} filteredDist yMax:`, d3.max(filteredDist, d => d.y));

    const W = svgRef.current.clientWidth || 260;
    const H = 90;
    const margin = { left: 12, right: 12, top: 8, bottom: 20 };
    const innerW = W - margin.left - margin.right;
    const innerH = H - margin.top - margin.bottom;

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', W)
      .attr('height', H);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleLinear().domain([min, max]).range([0, innerW]);

    // Use the full distribution's max y for both scales
    // so the filtered curve is always proportionally smaller
    const yMax = d3.max(fullDist, d => d.y) || 1;
    const yScale = d3.scaleLinear().domain([0, yMax]).range([innerH, 0]);

    const area = d3.area()
      .x(d => xScale(d.x))
      .y0(innerH)
      .y1(d => yScale(d.y))
      .curve(d3.curveBumpX);

    const line = d3.line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveBumpX);

    // --- Layer 1: full distribution (background, darkest) ---
    g.append('path')
      .datum(fullDist)
      .attr('d', area)
      .attr('fill', 'rgba(255,255,255,0.05)');

    g.append('path')
      .datum(fullDist)
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', 'rgba(255,255,255,0.15)')
      .attr('stroke-width', 1);

    // --- Layer 2: filtered distribution (foreground, brighter) ---
    if (filteredDist.length) {
      g.append('path')
        .datum(filteredDist)
        .attr('d', area)
        .attr('fill', 'rgba(255,255,255,0.18)');

      g.append('path')
        .datum(filteredDist)
        .attr('d', line)
        .attr('fill', 'none')
        .attr('stroke', 'rgba(255,255,255,0.55)')
        .attr('stroke-width', 1.5);
    }

    // --- Track ---
    g.append('line')
      .attr('x1', 0).attr('x2', innerW)
      .attr('y1', innerH).attr('y2', innerH)
      .attr('stroke', 'rgba(255,255,255,0.1)')
      .attr('stroke-width', 1);

    // Active track between handles
    g.append('line')
      .attr('x1', xScale(value[0])).attr('x2', xScale(value[1]))
      .attr('y1', innerH).attr('y2', innerH)
      .attr('stroke', 'rgba(255,255,255,0.6)')
      .attr('stroke-width', 2)
      .attr('stroke-linecap', 'round');

    // --- Drag handles ---
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

    [value[0], value[1]].forEach((val, i) => {
      g.append('circle')
        .attr('cx', xScale(val))
        .attr('cy', innerH)
        .attr('r', 6)
        .attr('fill', '#fff')
        .attr('stroke', 'rgba(0,0,0,0.3)')
        .attr('stroke-width', 1.5)
        .attr('cursor', 'grab')
        .style('filter', 'drop-shadow(0 1px 3px rgba(0,0,0,0.5))')
        .call(makeDrag(i));
    });

    // Min/max labels
    g.append('text')
      .attr('x', 0).attr('y', innerH + 16)
      .attr('fill', 'rgba(255,255,255,0.3)')
      .attr('font-size', 10)
      .text(min);

    g.append('text')
      .attr('x', innerW).attr('y', innerH + 16)
      .attr('fill', 'rgba(255,255,255,0.3)')
      .attr('font-size', 10)
      .attr('text-anchor', 'end')
      .text(max);

  }, [onChange, fullDist, filteredDist, value, min, max]);

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
import React, { useState } from 'react';

const GridSelector = () => {
  const rows = 34;
  const cols = 35;
  const [selected, setSelected] = useState(Array(rows * cols).fill(false));
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const toggleCell = (index) => {
    const newSelected = [...selected];
    newSelected[index] = !newSelected[index];
    setSelected(newSelected);
  };

  const isAdjacent = (i1, i2) => {
    const r1 = Math.floor(i1 / cols);
    const c1 = i1 % cols;
    const r2 = Math.floor(i2 / cols);
    const c2 = i2 % cols;
    return (Math.abs(r1 - r2) === 1 && c1 === c2) || (Math.abs(c1 - c2) === 1 && r1 === r2);
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${cols}, 10px)`,
    gridTemplateRows: `repeat(${rows}, 10px)`,
    gap: '0px',
  };

  const [hoveredFont, setHoveredFont] = useState(null);

  return (
    <div style={gridStyle}>
      {selected.map((isSelected, index) => {
        let bgClass = 'bg-gray-300';
        if (isSelected) bgClass = 'bg-gray-800';
        else if (hoveredIndex === index) bgClass = 'bg-gray-500';
        else if (hoveredIndex !== null && isAdjacent(hoveredIndex, index)) bgClass = 'bg-gray-400';

        return (
          <div
            key={index}
            className={`w-2.5 h-2.5 cursor-pointer ${bgClass}`}
            onClick={() => toggleCell(index)}
            onMouseEnter={async () => {
              setHoveredIndex(index);

              try {
                const res = await fetch('http://127.0.0.1:8000/api/gridhover', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ index })
                });

                const data = await res.json(); // or res.text()
                setHoveredFont(data);
              } catch (error) {
                console.error('Error calling gridhover:', error);
              }
            }}
            onMouseLeave={() => setHoveredIndex(null)}
          />
        );

      })}

      <div style={{ marginTop: '10px' }}>
      {hoveredFont ? (
        <pre>{JSON.stringify(hoveredFont, null, 2)}</pre>
      ) : (
        <span>Hover over a cell to see font</span>
      )}
    </div>
    </div>
  );
};

export default GridSelector;
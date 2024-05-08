import React, { useState, useRef, useEffect } from 'react';
import * as d3 from 'd3';

interface LineData {
    x: number;
    label: string;
}

const GraphWithInteractiveLines: React.FC = () => {
    const [linesData, setLinesData] = useState<LineData[]>([]);
    const [currentLine, setCurrentLine] = useState<LineData | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        const svg = d3.select(svgRef.current);

        svg.on('mousemove', (event: MouseEvent) => {
            const [x] = d3.pointer(event, svgRef.current);
            setCurrentLine({ x, label: Value: ${x.toFixed(2)} }); // Например, отображаем координату X
        });

        svg.on('click', (event: MouseEvent) => {
            if (currentLine) {
                setLinesData([...linesData, currentLine]);
                setCurrentLine(null); // Скрываем текущую линию после добавления
            }
        });

        svg.on('mouseleave', () => {
            setCurrentLine(null); // Скрываем текущую линию при выходе курсора за пределы svg
        });

        return () => {
            svg.on('mousemove', null).on('click', null).on('mouseleave', null);
        };
    }, [currentLine, linesData]);

    return (
        <div style={{ position: 'relative' }}>
    <svg ref={svgRef} width={800} height={500} style={{ border: '1px solid black' }}>
    {linesData.map((line, index) => (
        <g key={index}>
        <line
            x1={line.x}
        y1={0}
        x2={line.x}
        y2={500}
        stroke="blue"
        strokeWidth="2"
        />
        <text x={line.x} y={500} dy="-1em" fill="blue">
        {line.label}
        </text>
        </g>
    ))}
    {currentLine && (
        <g>
            <line
                x1={currentLine.x}
        y1={0}
        x2={currentLine.x}
        y2={500}
        stroke="red"
        strokeWidth="2"
        />
        <text x={currentLine.x} y={500} dy="-1em" fill="red">
        {currentLine.label}
        </text>
        </g>
    )}
    </svg>
    {linesData.map((line, index) => (
        <div
            key={index}
        style={{
        position: 'absolute',
            top: ${500}px, // Высота SVG минус высота элемента tooltip
            left: ${line.x}px,
            transform: 'translate(-50%, 0)',
            padding: '4px 8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            backgroundColor: '#fff',
            pointerEvents: 'none', // Пропускает события мыши через элементы tooltip
    }}
    >
        {line.label}
        </div>
    ))}
    </div>
);
};

export default GraphWithInteractiveLines;

Этот код реализует компонент, который рисует вертикальную линию, следующую за курсором мыши, при наведении на SVG-элемент. Когда пользователь кликает мышью, текущая линия фиксируется и добавляется к массиву linesData, который затем рендерится как устойчивые линии с соответствующими всплывающими подсказками (tooltips). При выходе курсора за пределы SVG текущая линия исчезает.
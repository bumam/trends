import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

const GraphWithVerticalLine: React.FC = () => {
    const svgRef = useRef<SVGSVGElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const verticalLineRef = useRef<SVGLineElement>(null);
    const isLineFixedRef = useRef<boolean>(false);

    useEffect(() => {
        if (!svgRef.current) return;

        const svg = d3.select(svgRef.current);
        const width = +svg.attr('width');
        const height = +svg.attr('height');

        // Настройка шкалы оси X (предполагается, что ваша ось X основана на времени)
        const xScale = d3.scaleTime().range([0, width]);

        // Обработчики событий
        const handleMouseMove = (event: MouseEvent) => {
            if (isLineFixedRef.current || !verticalLineRef.current) return;

            const xPosition = d3.pointer(event, svgRef.current)[0];
            const xValue = xScale.invert(xPosition);

            d3.select(verticalLineRef.current)
                .attr('x1', xPosition)
                .attr('x2', xPosition)
                .attr('visibility', 'visible');

            // Отображение значения оси X во всплывающем окне (tooltip)
            if (tooltipRef.current) {
                tooltipRef.current.textContent = xValue.toString();  // Форматируйте это значение как нужно
                tooltipRef.current.style.left = ${xPosition}px;
            }
        };

        const handleMouseOut = () => {
            if (isLineFixedRef.current) return;
            d3.select(verticalLineRef.current).attr('visibility', 'hidden');
            // Скрытие tooltip
            if (tooltipRef.current) {
                tooltipRef.current.textContent = '';
            }
        };

        const handleClick = () => {
            isLineFixedRef.current = !isLineFixedRef.current;
        };

        // Настройка SVG
        svg.on('mousemove', handleMouseMove)
            .on('mouseout', handleMouseOut)
            .on('click', handleClick)
            .append('line')
            .attr('y1', 0)
            .attr('y2', height)
            .attr('stroke', 'black')
            .attr('visibility', 'hidden')
            .attr('pointer-events', 'none')  // Игнорировать события указателя, чтобы они проходили к SVG
            .style('pointer-events', 'none');

        svg.selectAll('line')
            .data([{}]) // используется пустой набор данных для установления ссылки на элемент линии
            .join()
            .attr('ref', verticalLineRef);
    }, []);

    // Рендеринг SVG и tooltip
    return (
        <div style={{ position: 'relative' }}>
    <svg ref={svgRef} width={800} height={400} />
    <div
    ref={tooltipRef}
    style={{
        visibility: 'hidden',
            position: 'absolute',
            bottom: '0px',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            pointerEvents: 'none'
    }}
    />
    </div>
);
};

export default GraphWithVerticalLine;

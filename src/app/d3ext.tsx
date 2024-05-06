import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const Chart: React.FC<{ data: [number, number][] }> = ({ data }) => {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (svgRef.current) {
            const svg = d3.select(svgRef.current);
            const width = +svg.attr('width');
            const height = +svg.attr('height');
            console.log('data', data)
            const xScale = d3.scaleLinear()
                .domain([0, d3.max(data, d => d[0]) || 1])
                .range([0, width]);

            const yScale = d3.scaleLinear()
                .domain([0, d3.max(data, d => d[1]) || 1])
                .range([height, 0]);

            const xAxis = d3.axisBottom(xScale);
            const yAxis = d3.axisLeft(yScale);
            const  xGrid = svg.selectAll('line')
                    .data(xScale.ticks())
                    .join('line')
                    .attr('x1', d => xScale(d))
                    .attr('x2', d => xScale(d))
                    .attr('y1', 10)
                    .attr('y2', height - 10)
                    .style("stroke-width", 0.2)
                    .style("stroke", "black")

            const  yGrid = svg.attr('class', 'grid-lines')
                    .selectAll('line')
                    .data(yScale.ticks())
                    .join('line')
                    .attr('x1', 10)
                    .attr('x2', width - 10)
                    .attr('y1', d => yScale(d))
                    .attr('y2', d => yScale(d))
                    .style("stroke-width", 0.2)
                    .style("stroke", "black")

            svg.append('g')
                // .attr('transform', `translate(0, ${180})`)
                .call(xAxis);

            svg.append('g')
                .call(yAxis);

            const line = d3.line<[number, number]>()
                .x(d => xScale(d[0]))
                .y(d => yScale(d[1]));

            svg.append('path')
                .datum(data)
                .attr('d', line)
                .style('fill', 'none');

            // Добавление сегментов разного цвета
            data.forEach((d, i) => {
                if (i < data.length - 1) {
                    svg.append('path')
                        .datum([data[i], data[i + 1]])
                        .attr('d', line)
                        .style('stroke', i % 2 === 0 ? 'red' : 'green');
                }
            });
        }
    }, [data]);

    return <svg ref={svgRef} width={400} height={200} />;
};

const Appd: React.FC = () => {
    const data: [number, number][] = [[0, 30], [50, 70], [100, 20], [150, 90], [200, 50]];

    return <Chart data={data} />;
};

export default Appd;
import React, { useState, useEffect, useRef, FC } from 'react';
import * as d3 from 'd3';

interface Margin {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

interface DataItem {
    date: Date;
    value: number;
}

export  const LineChart: React.FC = () => {
    const svgRef = useRef<SVGSVGElement>(null);

    const [data, setData] = useState<DataItem[]>([]);

    const margin: Margin = { top: 10, right: 30, bottom: 30, left: 60 };
    const width: number = 460 - margin.left - margin.right;
    const height: number = 400 - margin.top - margin.bottom;

    useEffect(() => {
        d3.csv(
            "https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/3_TwoNumOrdered_comma.csv",
            (d) => {
                return { date: d3.timeParse("%Y-%m-%d")(d.date), value: +d.value } as DataItem;
            }
        ).then((data: DataItem[]) => {
            setData(data);
        });
    }, []);

    useEffect(() => {
        if (data.length === 0 || !svgRef.current) {
            return;
        }

        let svgElement = d3.select(svgRef.current);
        svgElement.selectAll("*").remove(); // Очищаем содержимое SVG перед добавлением новых элементов

        const xScale = d3.scaleTime()
            .domain(d3.extent(data, (d) => d.date) as [Date, Date])
            .range([0, width]);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, (d) => d.value)!])
            .range([height, 0]);

        var brush = d3.brushX()
            .extent( [ [0,0], [width,height] ] )
            .on("end", updateChart)

        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3.axisLeft(yScale);

        svgElement
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Ось X
        svgElement
            .append("g")
            .attr("transform", `translate(0,${height})`)
            .call(xAxis);

        // Ось Y
        svgElement
            .append("g")
            .call(yAxis);

        svgElement
            .append("g")
            .attr("class", "brush")
            .call(brush);

        // Линия
        svgElement.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line<DataItem>()
                .x((d) => xScale(d.date))
                .y((d) => yScale(d.value))
            );
    }, [data, height, margin.bottom, margin.left, margin.right, margin.top, width]);

    return <svg ref={svgRef} />;
};








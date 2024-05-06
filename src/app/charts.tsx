'use client'
import React, { useState, useCallback } from 'react';
import {
    LineChart,
    Line,
    YAxis,
    XAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

const ZoomableChart = () => {
    // Исходные данные
    const [data, setData] = useState([
        { date: new Date('2020-01-01').getTime(), value: 2400 },
        { date: new Date('2020-01-02').getTime(), value: 1398 },
        { date: new Date('2020-01-04').getTime(), value: 898 },
        { date: new Date('2020-01-05').getTime(), value: 798 },
        { date: new Date('2020-01-06').getTime(), value: 698 },
        // ...другие точки данных
    ]);

    // Состояния для масштабирования
    const [scaleX, setScaleX] = useState(1);
    const [scaleY, setScaleY] = useState(1);
    const [isZooming, setIsZooming] = useState(false);
    const [refArea, setRefArea] = useState({ x: 0, y: 0 });

    // Начало зума (сохраняем начальную точку)
    const handleMouseDown = (e: any) => {
        if (e && e.activePayload && e.activePayload.length && e.activeCoordinate) {
            setIsZooming(true);
            setRefArea({
                ...refArea,
                x: e.activeCoordinate.x,
                y: e.activeCoordinate.y,
            });
        }
    };

    // Во время зума (пересчитываем состояние)
    const handleMouseMove = (e: any) => {
        if (isZooming && e && e.chartX && e.chartY) {
            const newScaleX = scaleX * (1 + (e.chartX - refArea.x) / 100);
            const newScaleY = scaleY * (1 - (e.chartY - refArea.y) / 100);
            setScaleX(newScaleX);
            setScaleY(newScaleY);
            setRefArea({
                x: e.chartX,
                y: e.chartY,
            });
        }
    };

    // Окончание зума
    const handleMouseUp = () => {
        setIsZooming(false);
    };

    const dateTimeFormatter = (tickItem: number) => {
        return new Date(tickItem).toLocaleDateString();
    };

    return (
        <div
            onMouseDown={(e) => handleMouseDown(e)}
            onMouseMove={(e) => handleMouseMove(e)}
            onMouseUp={() => handleMouseUp()}
            style={{ width: '100%', height: '400px', cursor: 'ns-resize' }}
        >
            <ResponsiveContainer>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        type="number"
                        domain={['dataMin', 'dataMax']}
                        dataKey="date"
                        name="Time"
                        tickFormatter={dateTimeFormatter}
                        scale="time"
                        padding={{ left: 30, right: 30 }}
                    />
                    <YAxis
                        scale="linear"
                        domain={['auto', 'auto']}
                        tickCount={10 * scaleY}
                    />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
                    {/* Другие Series Lines или graphical elements */}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};


chart.js
chartjs-plugin-annotation
chartjs-plugin-zoom",
react-chartjs-2
chartjs-plugin-crosshair
chartjs-react
chartjs-plugin-datalabels
@types/chartjs-plugin-annotation
@types/chartjs-plugin-crosshair
export default ZoomableChart;
import React, { useRef, useEffect } from 'react';
import Chart from 'chart.js/auto';

interface Point {
    x: number;
    y: number;
}

const MyChart: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<Chart | null>(null);
    const guideLineIndex = useRef<number | null>(null);

    useEffect(() => {
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');

            if (ctx) {
                chartRef.current = new Chart(ctx, {
                    type: 'line',
                    data: {
                        // Пример данных для демонстрации
                        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
                        datasets: [
                            {
                                label: 'Demo dataset',
                                data: [65, 59, 80, 81, 56, 55, 40],
                                fill: false,
                                borderColor: 'rgb(75, 192, 192)',
                                tension: 0.1,
                            },
                        ],
                    },
                    options: {
                        responsive: true,
                        scales: {
                            x: {
                                type: 'category',
                            },
                            y: {
                                type: 'linear',
                            },
                        },
                        plugins: {
                            tooltip: {
                                mode: 'index',
                                intersect: false,
                            },
                        },
                        onHover: (event, chartElements) => {
                            const canvas = canvasRef.current;
                            const chart = chartRef.current;

                            if (!canvas || !chart) return;

                            if (chartElements.length > 0) {
                                const x = chartElements[0].element.x;
                                const hoverX = event.x;

                                if (Math.abs(x - hoverX) < 8) {
                                    canvas.style.cursor = 'pointer';
                                    if (guideLineIndex.current === null) {
                                        guideLineIndex.current = chartElements[0].index;
                                        chart.update('quiet');
                                    }
                                } else {
                                    canvas.style.cursor = 'default';
                                    if (guideLineIndex.current != null) {
                                        guideLineIndex.current = null;
                                        chart.update('quiet');
                                    }
                                }
                            }
                        },
                        onClick: (event, chartElements) => {
                            const chart = chartRef.current;
                            if (!chart) return;

                            if (chartElements.length > 0) {
                                guideLineIndex.current = chartElements[0].index;
                                chart.update('quiet');
                            }
                        },
                    },
                    plugins: [
                        {
                            id: 'crosshair',
                            afterDraw: (chart) => {
                                const ctx = chart.ctx;
                                if (guideLineIndex.current != null) {
                                    const x = chart.scales.x.getPixelForValue(guideLineIndex.current);
                                    const chartArea = chart.chartArea;

                                    ctx.save();
                                    ctx.beginPath();
                                    ctx.moveTo(x, chartArea.top);
                                    ctx.lineTo(x, chartArea.bottom);
                                    ctx.lineWidth = 1;
                                    ctx.strokeStyle = 'red';
                                    ctx.stroke();
                                    ctx.restore();
                                }
                            },
                        },
                    ],
                });
            }
        }

        return () => {
            chartRef.current?.destroy();
        };
    }, []);

    return <canvas ref={canvasRef} width="400" height="400"></canvas>;
};

export default MyChart;
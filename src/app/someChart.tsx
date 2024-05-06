'use client'
import React, { useState, useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { Line } from 'react-chartjs-2';
import zoomPlugin from 'chartjs-plugin-zoom';

console.log('zoomPlugin', zoomPlugin)
// Регистрация компонентов Chart.js и плагина зума
Chart.register(...registerables, zoomPlugin);

const getInitialData = () => ({
    labels: Array.from({ length: 10 }, (_, i) => i), // Начальные лейблы от 0 до 9
    datasets: [{
        label: 'Dataset',
        data: Array.from({ length: 10 }, () => Math.random() * 100), // Начальные случайные данные
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
    }],
});

const RealtimeZoomableChart = () => {
    const [data, setData] = useState(getInitialData);
    const chartRef = useRef(null);

    const options = {
        plugins: {
            zoom: {
                pan: {
                    enabled: true,
                    mode: 'x'
                },
                zoom: {
                    wheel: {
                        enabled: true
                    },
                    pinch: {
                        enabled: true
                    },
                    drag: {
                        enabled: true
                    },
                    mode: 'x',
                    scaleMode: 'xy'
                }
            }
        },
        scales: {
            x: {
                type: 'linear',
                position: 'bottom'
            },
            y: {
                beginAtZero: true,
            },
        },
        animation: {
            duration: 0 // Отключаем анимацию, чтобы предотвратить "всплески" при обновлении
        },
        maintainAspectRatio: false,
        responsive: true
    };

    const addData = () => {
        const newLabel = data.labels[data.labels.length - 1] + 1;
        const newDataPoint = Math.random() * 100;

        if (chartRef.current) {
            const chart = chartRef.current;

            chart.data.labels.push(newLabel);
            chart.data.datasets.forEach((dataset) => {
                dataset.data.push(newDataPoint);
            });

            // Обновляем график без анимации
            chart.update('none');
        }
    };

    useEffect(() => {
        const intervalId = setInterval(() => {
            addData(); // Функция добавляет данные к графику
        }, 5000); // Интервал в миллисекундах

        return () => clearInterval(intervalId); // Очистка интервала при размонтировании компонента
    }, [data]);

    return <Line ref={chartRef} data={data} options={options} />;
};

export default RealtimeZoomableChart;

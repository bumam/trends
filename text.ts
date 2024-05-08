// @ts-noCheck
// Для стилизации осей и добавления подписей и линий вдоль осей в D3.js вместе с React, вам потребуется выполнить несколько действий:
//
//     1. Стилизация осей и тиков: Используйте CSS для задания стилей линий сетки и текста тиков. Например, в вашем CSS файле или теге <style>:
//
// css
//
//     .axis path,
// .axis line {
//     fill: none;
//     stroke: #000; /* Цвет линий осей */
//     shape-rendering: crispEdges;
// }
//
// .grid line {
//     stroke: lightgrey;
//     stroke-opacity: 0.7;
//     shape-rendering: crispEdges;
// }
//
// .grid .tick text {
//     display: none; /* Скрывает текст тиков для линий сетки */
// }
//
// 2. Добавление подписи оси: Для добавления подписей к оси, вы можете создать ещё один SVG текстовый элемент и позиционировать его соответствующим образом.
//
//     JavaScript
//
// // Подпись оси X
// svg.append("text")
//     .attr("text-anchor", "end")
//     .attr("x", width)
//     .attr("y", height - 5)
//     .text("Ось X");
//
// // Подпись оси Y
// svg.append("text")
//     .attr("text-anchor", "end")
//     .attr("transform", "rotate(-90)")
//     .attr("y", 6)
//     .attr("dy", ".75em")
//     .style("text-anchor", "end")
//     .text("Ось Y");
//
// 3. Добавление линий вдоль осей: Чтобы добавить линии вдоль осей, вам нужно убедиться, что в коде создания осей используются пути (path). Если они не создаются автоматически, то вы можете создать их вручную:
//
//     JavaScript
//
// // Вертикальная линия вдоль оси Y
// svg.append("line")
//     .attr("class", "grid")
//     .attr("x1", xScale(0)) // Измените 0 на значение, если ваша шкала не начинается с 0
//     .attr("x2", xScale(0)) // Тоже самое значение, что и x1
//     .attr("y1", 0)
//     .attr("y2", height)
//     .attr("stroke", "currentColor"); // Используйте CSS класс для стилизации, если необходимо
//
// // Горизонтальная линия вдоль оси X
// svg.append("line")
//     .attr("class", "grid")
//     .attr("x1", 0)
//     .attr("x2", width)
//     .attr("y1", yScale(0)) // Измените 0 на значение, если ваша шкала не начинается с 0
//     .attr("y2", yScale(0)) // Тоже самое значение, что и y1
//     .attr("stroke", "currentColor");

// Хоть в D3.js и нет прямого метода для добавления дополнительных путей (path) к элементу domain, вы всё же можете это сделать вручную, после того как ось будет отрендерена. Это можно сделать, добавив SVG path или line элемент и задав ему соответствующие атрибуты для имитации продолжения domain.
//
//     Например, если вы хотите добавить дополнительную длину к основной линии оси Х на 20 пикселей справа, вы можете сделать следующее:
//
//     JavaScript
//
// // Предположим, что у вас есть уже созданная ось 'xAxis' и добавленная на SVG:
// svg.append("g")
//     .attr("class", "x-axis")
//     // Позиционируем ось на SVG
//     .attr("transform", "translate(0," + height + ")")
//     .call(xAxis);
//
// // Получаем текущие координаты конца domain оси X
// var domain = svg.select(".x-axis .domain");
// var domainEnd = domain.node().getPointAtLength(domain.node().getTotalLength());
//
// // Добавляем линию, продолжающую domain оси X
// svg.select(".x-axis")
//     .append("line")
//     .attr("class", "domain-extension")
//     .attr("stroke", "currentColor") // Цвет такой же, как и у domain
//     .attr("stroke-width", 1) // Толщина линии такая же, как у domain
//     .attr("x1", domainEnd.x)
//     .attr("y1", domainEnd.y)
//     .attr("x2", domainEnd.x + 20)
//     .attr("y2", domainEnd.y);
//
// Обратите внимание, что .getPointAtLength() и .getTotalLength() - это методы SVG DOM API, которые позволяют вам определить точную позицию конца пути domain.
//
//     Этот код расширит основную линию оси x на 20 пикселей вправо. Вы можете изменить числа для расширения линии в другую сторону или для оси Y.

// Предположим, что ось Y уже добавлена в SVG:
const yAxisGroup = svg.append("g").attr("class", "y-axis").call(yAxis);

// После отрисовки оси найдите конечную точку domain оси Y
const domainPathY = yAxisGroup.select(".domain").node();
const domainEndY = domainPathY.getPointAtLength(domainPathY.getTotalLength());

// Добавьте к конечной точке вертикальную линию
yAxisGroup
  .append("line")
  .attr("class", "domain-extension-y")
  .attr("stroke", "currentColor") // используйте цвет, совпадающий с основной линией domain
  .attr("stroke-width", 1) // толщина линии, как у основной линии domain
  .attr("x1", domainEndY.x)
  .attr("y1", domainEndY.y)
  .attr("x2", domainEndY.x) // x не изменяется
  .attr("y2", domainEndY.y - 20); // уменьшаем y чтобы поднять линию выше



TypeScript

import React, { useEffect } from 'react';
import * as d3 from 'd3';

interface YourComponentProps {
    // Определите свои собственные типы свойств здесь, если нужно
}

const YourComponent: React.FC<YourComponentProps> = (props) => {
    // Типы для вашего ref и anchorEl, нужно их определить согласно вашему использованию
    const ref = React.useRef<SVGGElement>(null);
    const anchorEl = React.useRef<SVGGElement>(null);

    // Добавьте типы для вашего масштаба. Например:
    const scale = d3.scaleTime().domain(/* ... */).range(/* ... */);

    useEffect(() => {
        const anchorElement: SVGGElement | null = anchorEl.current;
        if (!anchorElement) return;

        const handleMouseOut = () => {
            d3.select(ref.current)
                .selectAll("text")
                .attr("opacity", 0.5)
                .style("font-weight", "normal");
        };

        const handleMouseMove = () => {
            const mouse = d3.mouse(anchorElement);
            const yDate = scale.invert(mouse[1]);

            const textElements = d3.select(ref.current).selectAll("text");
            // Предположим, у нас есть тип DateValuePair для данных
            const data: DateValuePair[] = textElements.data();
            const index = d3.bisector((d: DateValuePair) => d.date).left(data, yDate);
            textElements
                .attr("opacity", (_, i) => (i === index - 1 ? 1 : 0.5))
                .style("font-weight", (_, i) => (i === index - 1 ? "bold" : "normal"));
        };

        d3.select(anchorElement)
            .on("mouseout.axisY", handleMouseOut)
            .on("mousemove.axisY", handleMouseMove);

        // Clean up event listeners when the component unmounts
        return () => {
            if (ref.current) {
                d3.select(anchorElement).on(".axisY", null);
            }
        };
    }, [scale]);

    // Рендеринг компонента...
    return (
        // Ваш JSX здесь
    );
};

interface DateValuePair {
    date: Date;
    value: number;
}

export default YourComponent;

Этот код предполагает, что тип DateValuePair используется для представления данных, связанных с каждым текстовым элементом, и он состоит из двух свойств: date, который является объектом Date, и value, представляющим числовое значение.

    Объект scale также должен иметь соответствующие типы, исходя из того, что это временная шкала (scaleTime), вам потребуется определить домен и диапазон для этой функции масштабирования. Укажите соответствующие типы и данные согласно вашему контексту и требованиям.


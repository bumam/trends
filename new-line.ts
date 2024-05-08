// ... Импорты и определения ...

const GraphWithInteractiveLines: React.FC = () => {
    const [linesData, setLinesData] = useState<LineData[]>([]);
    const [currentLine, setCurrentLine] = useState<LineData | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    const getTouchPosition = (touchEvent: TouchEvent, element: SVGSVGElement) => {
        const touch = touchEvent.touches[0];
        const rect = element.getBoundingClientRect();
        return touch.clientX - rect.left;
    };

    useEffect(() => {
        const svg = d3.select(svgRef.current);

        const handleTouchMove = (event: TouchEvent) => {
            event.preventDefault(); // Отключаем стандартную прокрутку при касании
            const x = getTouchPosition(event, svgRef.current!);
            setCurrentLine({ x, label: Value: ${x.toFixed(2)} });
        };

        const handleTouchStart = (event: TouchEvent) => {
            event.preventDefault(); // Отключаем обработку браузером касания как клика
            const x = getTouchPosition(event, svgRef.current!);
            if (currentLine) {
                setLinesData([...linesData, currentLine]);
                setCurrentLine(null);
            } else {
                setCurrentLine({ x, label: Value: ${x.toFixed(2)} });
            }
        };

        svg.on('touchmove', handleTouchMove);
        svg.on('touchstart', handleTouchStart);

        return () => {
            svg.on('touchmove', null).on('touchstart', null);
        };
    }, [currentLine, linesData]);

    // ... рендер SVG и всплывающих подсказок ...

    return (
        // ... рендер компонента ...
    );
};

export default GraphWithInteractiveLines;

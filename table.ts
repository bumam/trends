const createRow = (item: Row, index: number): IDataGridRow[] => {
  const { ts, ts2, value, invalid, trendName, label, objectLabel, color } =
    item;

  const full: IDataGridRow = {
    id: index,
    ts: timeCell(ts, invalid),
    ts2: timeCell(ts2, invalid),
    value,
    invalid: invalidCell(invalid),
    trendName: trendNameCell(
      trendName || "",
      label || "",
      objectLabel || "",
      color || ""
    ),
  };

  return Object.entries(full).reduce((acc: any, current: any) => {
    if (selectedColumnsKeys.has(current[0])) {
      acc[current[0]] = current[1];
    }
    return acc;
  }, {});
};


2.

const timeCell = (time: number | null, invalid: boolean): React.JSX.Element => {
  if (time === null || Number.isNaN(+time)) {
    return (
      <div className={s.SignalTable__timeCell}>
        <span className={s.SignalTable__time}>{time}</span>
      </div>
    );
  }

  return (
    <div className={s.SignalTable__timeCell}>
      <span className={cn(s.SignalTable__date, invalid && s.SignalTable__time)}>
        {timeFormat('%d.%m.%Y')(time as Date)}
      </span>
      <span className={s.SignalTable__time}>{timeFormat('%H:%M:%S')(time as Date)}</span>
    </div>
  );
};


3.
useEffect(() => {
  setTotalPagesCount(Math.round((selectedTrendData.current.length - 1) / +rowsPerPage));
}, [selectedTrendData.current, rowsPerPage]);


4

const rowsDTO = (serverData: TStoredSignalData[]): Row[] => {
  return serverData.map((data: TStoredSignalData, index: number) => {
    const fullTrendData = trendsDataStore.periodDataFullSortedByTs.find(
      (i: ITrendData) => i.trendTagName === data.tag
    );
    return {
      id: index,
      ts: data.ts,
      ts2: data.ts2 || null,
      value: data.value || null,
      invalid: data.invalid,
      trendName: fullTrendData?.trendTagName || '',
      label: fullTrendData?.label || '',
      objectLabel: fullTrendData?.objectLabel || '',
      color: fullTrendData?.color || '',
    };
  });
};


5

const rowKeyGetter = (row: IDataGridRow) => row.id;

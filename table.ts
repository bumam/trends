import {
    BASEMENT_CHART_AREA_ID,
    BASEMENT_TAG_ID_FOR_INIT,
    ISignalKey,
    ITrendData,
    TStoredSignalData,
  } from '@transneft/hmi-da-trends';
  import { CloseMdIcon, ErrorTriangleIcon, ExportIcon, SettingsIcon } from '@transneft/hmi-icons';
  import { FlatButton } from '@transneft/hmi-ui-kit';
  import cn from 'classnames';
  import { timeFormat } from 'd3-time-format';
  import { jsPDF } from 'jspdf';
  import autoTable from 'jspdf-autotable';
  import { observer } from 'mobx-react-lite';
  import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
  import { CSVLink } from 'react-csv';
  import { Scrollbars } from 'react-custom-scrollbars-2';
  import DataGrid from 'react-data-grid';
  import 'react-data-grid/lib/styles.css';
  import { Rnd } from 'react-rnd';
  
  import { useRootStore } from '../..';
  import { Roboto_Bold_base64 } from '../../fonts/Roboto_Bold_base64';
  import { Roboto_Regular_base64 } from '../../fonts/Roboto_Regular_base64';
  import { Checkbox } from '../form';
  import { SignalTableTagItem } from '../signal-table-tag-item/signal-table-tag-item';
  import { TablePagination } from '../table-pagination/table-pagination';
  import { Column, COLUMN_ENUM, Row, SortColumn, tableColumns } from './interface';
  import s from './signal-table.module.scss';
  import { getComparator } from './utils';
  
  interface IDataGridRow {
    id: number;
    ts: React.JSX.Element;
    ts2: React.JSX.Element;
    value: number | null;
    invalid: React.JSX.Element | null;
    trendName: React.JSX.Element;
    label?: string;
  }
  
  const SignalTable = observer(() => {
    const { trendsDataStore, globalStore, connectedPanelsStore, graphsStore, signalsPanelStore } = useRootStore();
    const mainAxisId = connectedPanelsStore.getMainAxisIdByChartId(BASEMENT_CHART_AREA_ID);
    const mainStore = connectedPanelsStore.getAxisStoreByXId(mainAxisId);
  
    const [totalPagesCount, setTotalPagesCount] = useState<number>(0);
    const [width, setWidth] = useState<number>(0);
  
    const [settingsShow, setSettingsShow] = useState<boolean>(false);
    const [CSVData, setCSVData] = useState<string[][]>([]);
    const [dataGridRows, setDataGridRows] = useState<IDataGridRow[][]>([]);
  
    const [selectedColumnsKeys, setSelectedColumnsKeys] = useState<Set<COLUMN_ENUM>>(
      new Set(tableColumns.map((i: Column) => i.key))
    );
    const sliceRef = useRef(null);
  
    const gridRef = useRef<any>();
    const [trendsUnitsHeader, setTrendsUnitsHeader] = useState<ITrendData[]>([]);
  
    const [selectedTrendIds, setSelectedTrendIds] = useState<Set<string>>(new Set());
    const selectedTrendData = useRef<TStoredSignalData[]>([]);
  
    const [rowsPerPage, setRowsPerPage] = useState<string | number>(10);
    const [page, setPage] = useState<number>(0);
  
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const autoSizerRef = useRef(null);
  
    const [rows, setRows] = useState<Row[]>([]);
    const [columns, setColumns] = useState(tableColumns);
    const [sortColumns, setSortColumns] = useState<readonly SortColumn[]>([]);
    const rowKeyGetter = (row: IDataGridRow[]) => {
      return (row as unknown as Row).id; // todo: возможно тут ошибка
    };
  
    const fileName = useCallback(() => {
      if (!mainStore) {
        return null;
      }
      return `Trends_from_${timeFormat('%d-%m-%Y')(mainStore.currentXDomain[0])}/${timeFormat('%H:%M:%S')(
        mainStore.currentXDomain[0]
      )}_to_${timeFormat('%d-%m-%Y')(mainStore.currentXDomain[1])}/${timeFormat('%H:%M:%S')(
        mainStore.currentXDomain[1]
      )}`;
    }, []);
  
    const toggleColumnChange = (key: COLUMN_ENUM) => {
      setSelectedColumnsKeys((prev) => {
        const set = prev;
        set.has(key) ? set.delete(key) : set.add(key);
        return set;
      });
    };
  
    useEffect(() => {
      setColumns((prev) => {
        return prev.filter((item) => selectedColumnsKeys.has(item.key));
      });
    }, [selectedColumnsKeys]);
  
    useEffect(() => {
      setTrendsUnitsHeader((prev: ITrendData[]) => {
        return prev.filter((item: ITrendData) => {
          return signalsPanelStore.selected.map((select: ISignalKey) => select.label).includes(item.id);
        });
      });
    }, [signalsPanelStore.selected]);
  
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
  
    const sortedRows = useMemo((): Row[] => {
      const maxItemIndexOnPage = page * +rowsPerPage;
      const minItemIndexOnPage = page > 1 ? (page - 1) * +rowsPerPage : 0;
  
      if (sortColumns.length === 0) {
        return rows.slice(minItemIndexOnPage, maxItemIndexOnPage);
      }
      const sortedRows: Row[] = rowsDTO(selectedTrendData.current);
  
      return sortedRows
        .sort((a, b) => {
          for (const sort of sortColumns) {
            const comparator = getComparator(sort.columnKey);
            const compResult = comparator(a as never as Row, b as never as Row);
            if (compResult !== 0) {
              return sort.direction === 'ASC' ? compResult : -compResult;
            }
          }
          return 0;
        })
        .slice(minItemIndexOnPage, maxItemIndexOnPage);
    }, [rows, sortColumns, rowsPerPage, page]);
  
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const updatePagesCount = useMemo(() => {
      setTotalPagesCount(Math.round((selectedTrendData.current.length - 1) / +rowsPerPage));
    }, [selectedTrendData.current, rowsPerPage]);
  
    const timeCell = (time: number | null, invalid: boolean): React.JSX.Element => {
      return !Number.isNaN(+time!) ? (
        <div className={s.SignalTable__timeCell}>
          <span className={cn(s.SignalTable__date, invalid && s.SignalTable__time)}>
            {timeFormat('%d.%m.%Y')(time as never as Date)}
          </span>
          <span className={s.SignalTable__time}>{timeFormat('%H:%M:%S')(time as never as Date)}</span>
        </div>
      ) : (
        <div className={s.SignalTable__timeCell}>
          <span className={s.SignalTable__time}>{time}</span>
        </div>
      );
    };
  
    const invalidCell = (invalid: boolean): React.JSX.Element | null => {
      return invalid ? (
        <div className={s.SignalTable__invalidCellWrap}>
          <div className={s.SignalTable__invalidCell}>
            <ErrorTriangleIcon />
            <span className={cn(s.SignalTable__invalidValue)}>Не валидно</span>
          </div>
        </div>
      ) : null;
    };
  
    const trendNameCell = (trendName: string, label: string, objectLabel: string, color: string): React.JSX.Element => {
      return (
        <SignalTableTagItem
          isSelectable={false}
          hasTooltip={false}
          titleFontWeight={500}
          trendData={{
            color,
            id: 0 + '',
            data: [],
            label,
            objectLabel,
            trendTagName: trendName,
          }}
        />
      );
    };
  
    const createRow = (item: Row, index: number): IDataGridRow[] => {
      const { ts, ts2, value, invalid, trendName, label, objectLabel, color } = item;
  
      const full: IDataGridRow = {
        id: index,
        ts: timeCell(ts, invalid),
        ts2: timeCell(ts2, invalid),
        value,
        invalid: invalidCell(invalid),
        trendName: trendNameCell(trendName, label || '', objectLabel || '', color || ''),
      };
  
      return Object.entries(full).reduce((acc: any, current: any) => {
        if (selectedColumnsKeys.has(current[0])) {
          acc[current[0]] = current[1];
        }
        return acc;
      }, {});
    };
  
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const updateRows = useMemo(() => {
      setRows(rowsDTO(selectedTrendData.current));
    }, [selectedTrendData.current, rowsPerPage, page]);
  
    const toggleSelectedIds = (id: string, e?: any) => {
      e?.stopPropagation();
      const ids = new Set(selectedTrendIds);
      ids.has(id) ? ids.delete(id) : ids.add(id);
  
      setSelectedTrendIds(ids);
    };
  
    const handleDragStart = (e: React.DragEvent, index: number) => {
      e.dataTransfer.setData('index', index.toString());
    };
  
    const handleClose = () => {
      globalStore.toggleSignalTable();
    };
  
    const getExportRowsAndHeader = (): { tableHeader: Column[]; rowsTable: string[][] } => {
      const tableHeader: Column[] = tableColumns.filter((item) => selectedColumnsKeys.has(item.key));
      const tableKeys: string[] = tableHeader.map((i) => i.key);
  
      const rowsTable: any[] = rows.map((i: Row) => {
        const row: Row = {} as Row;
        tableKeys.forEach((key: string) => {
          if (key === 'ts' || key === 'ts2') {
            row[key] = (
              Number.isNaN(+i[key]!)
                ? i[key]
                : timeFormat('%d.%m.%Y')(i[key] as never as Date) + ', ' + timeFormat('%H:%M:%S')(i[key] as never as Date)
            ) /* eslint-disable @typescript-eslint/no-explicit-any */ as any;
          } else {
            row[key] = i[key];
          }
        });
  
        return Object.values(row);
      });
      return { tableHeader, rowsTable };
    };
  
    const handleExportPDF = () => {
      const doc = new jsPDF({ filters: ['ASCIIHexEncode'] });
  
      doc.addFileToVFS('Roboto_Regular_base64.ttf', Roboto_Regular_base64);
      doc.addFileToVFS('Roboto_Bold_base64.ttf', Roboto_Bold_base64);
  
      doc.addFont('Roboto_Regular_base64.ttf', 'Roboto_Regular_base64', 'normal');
      doc.addFont('Roboto_Bold_base64.ttf', 'Roboto_Bold_base64', 'bold');
  
      doc.setFont('Roboto_Bold_base64', 'bold');
  
      if (mainStore) {
        doc.text(
          `${timeFormat('%d.%m.%Y')(mainStore.currentXDomain[0])} ${timeFormat('%H:%M:%S')(
            mainStore.currentXDomain[0]
          )} - ${timeFormat('%d.%m.%Y')(mainStore.currentXDomain[1])} ${timeFormat('%H:%M:%S')(
            mainStore.currentXDomain[1]
          )}`,
          15,
          10
        );
      }
  
      const tableData = getExportRowsAndHeader();
  
      autoTable(doc, {
        head: [tableData.tableHeader.map((i) => i.name)],
        body: tableData.rowsTable as any,
        styles: {
          font: 'Roboto_Regular_base64',
          textColor: '#626F84',
        },
        headStyles: {
          fillColor: '#0062ff',
          textColor: 'white',
          font: 'Roboto_Bold_base64',
        },
        columnStyles: {
          0: {
            font: 'Roboto_Bold_base64',
          },
        },
      });
  
      doc.save(fileName() + `.pdf`);
    };
  
    const handleDrop = (e: React.DragEvent, index: number) => {
      const droppedIndex = Number(e.dataTransfer.getData('index'));
      const newList = [...trendsUnitsHeader];
      const [removed] = newList.splice(droppedIndex, 1);
      newList.splice(index, 0, removed);
      setTrendsUnitsHeader(newList);
    };
  
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const updateCSV = useMemo(() => {
      const tableData = getExportRowsAndHeader();
      const array: string[][] = tableData.rowsTable;
  
      array.unshift([tableData.tableHeader.map((i: Column) => i.name.toString()).join(',')]);
      setCSVData(array);
    }, [rows, selectedColumnsKeys]);
  
    const sortedRowClass = (key: string, isHeader = false) => {
      const sorderKeys = sortColumns.map((i) => i.columnKey);
      return sorderKeys.includes(key) ? (isHeader ? s.SignalTable__highlightHeader : s.SignalTable__highlight) : '';
    };
  
    useEffect(() => {
      selectedTrendData.current = trendsDataStore.periodDataFullSortedByTs
        .filter((data: ITrendData) => selectedTrendIds.has(data.id))
        .map((i: ITrendData) => {
          return i.data;
        })
        .flat();
  
      if (!trendsUnitsHeader.length) {
        setTrendsUnitsHeader(trendsDataStore.periodDataFullSortedByTs.filter((i) => i.id !== BASEMENT_TAG_ID_FOR_INIT));
        toggleSelectedIds(trendsDataStore.periodDataFullSortedByTs[0].id);
      }
    }, [selectedTrendIds, trendsDataStore.periodDataFullSortedByTs]);
  
    useEffect(() => {
      setDataGridRows(sortedRows.map((item, index) => createRow(item, index)));
    }, [sortedRows]);
  
    return (
      <Rnd
        className={s.SignalTable__wrap}
        default={{
          x: 150,
          y: -20,
          width: 1000,
          height: 800,
        }}
        cancel={'.stopRnD'}
      >
        <div className={cn(s.SignalTable, 'stopRnD')}>
          <div className={s.SignalTable__closeWrap}>
            <FlatButton hasRipple={false} className={cn(s.SignalTable__close)} onClick={handleClose}>
              <CloseMdIcon width={'20'} />
            </FlatButton>
          </div>
  
          <div className={s.SignalTable__titleBlock}>
            {mainStore && (
              <div className={s.SignalTable__timeWrap}>
                <div className={s.SignalTable__timeBlock}>
                  <span className={s.SignalTable__date}>{timeFormat('%d.%m.%Y')(mainStore.currentXDomain[0])}</span>
                  <span className={s.SignalTable__time}>{timeFormat('%H:%M:%S')(mainStore.currentXDomain[0])}</span>
                </div>
                –
                <div className={s.SignalTable__timeBlock}>
                  <span className={s.SignalTable__date}>{timeFormat('%d.%m.%Y')(mainStore.currentXDomain[1])}</span>
                  <span className={s.SignalTable__time}>{timeFormat('%H:%M:%S')(mainStore.currentXDomain[1])}</span>
                </div>
              </div>
            )}
  
            <div className={cn(s.SignalTable__exports)}>
              <CSVLink className={s.SignalTable__iconLink} data={CSVData} filename={fileName() + '.csv'}>
                <FlatButton hasRipple={false} className={s.SignalTable__iconWrap}>
                  <ExportIcon className={cn(s.SignalTable__icon)} width={'25'} />
                  <span className={cn(s.SignalTable__iconText)}>CSV</span>
                </FlatButton>
              </CSVLink>
  
              <FlatButton hasRipple={false} onClick={handleExportPDF} className={s.SignalTable__iconWrap}>
                <ExportIcon className={cn(s.SignalTable__icon)} width={'25'} />
                <span className={cn(s.SignalTable__iconText)}>PDF</span>
              </FlatButton>
            </div>
          </div>
          <Scrollbars
            renderTrackHorizontal={(props) => <div {...props} className="track-horizontal" />}
            renderThumbHorizontal={(props) => <div {...props} className="thumb-horizontal" />}
            style={{ height: 110 }}
          >
            <div className={s.SignalTable__dragWrap}>
              {trendsUnitsHeader.map((data: ITrendData, index: number) => {
                return data ? (
                  <div
                    className={cn(s.SignalTable__drag)}
                    key={index}
                    draggable
                    onClick={(e) => toggleSelectedIds(data.id, e)}
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    <SignalTableTagItem trendData={data} isSelectable isSelected={selectedTrendIds.has(data.id)} />
                  </div>
                ) : null;
              })}
            </div>
          </Scrollbars>
  
          <div className={s.SignalTable__tableBigWrap}>
            <div className={s.SignalTable__tableWrap}>
              <DataGrid
                className={s.SignalTable__dataGrid}
                columns={columns
                  .filter((i: Column) => selectedColumnsKeys.has(i.key))
                  .map((col, i) => {
                    return {
                      ...col,
                      cellClass: sortedRowClass(col.key),
                      headerCellClass: sortedRowClass(col.key, true),
                    };
                  })}
                rows={dataGridRows}
                ref={gridRef}
                onRowsChange={(rows: IDataGridRow[][]) => {
                  setRows(rows as unknown as Row[]);
                }}
                sortColumns={sortColumns}
                rowKeyGetter={rowKeyGetter}
                onSortColumnsChange={setSortColumns}
                defaultColumnOptions={{
                  sortable: true,
                  resizable: true,
                }}
              />
            </div>
            <div ref={sliceRef} className={s.SignalTable__settingsWrap}>
              <FlatButton
                hasRipple={false}
                className={cn(s.SignalTable__button, s.SignalTable__buttonBlue)}
                onClick={() => setSettingsShow((prev) => !prev)}
              >
                <SettingsIcon width="20" height="20" />
              </FlatButton>
  
              {settingsShow && (
                <div className={s.SignalTable__slicePanel}>
                  {tableColumns.map((item, index) => {
                    return (
                      <div className={s.SignalTable__slicePanelItem} key={index}>
                        <Checkbox
                          isBig={true}
                          checked={selectedColumnsKeys.has(item.key)}
                          onChange={() => toggleColumnChange(item.key)}
                        />
                        {item.name}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
  
          <div className={s.SignalTable__pagination}>
            <TablePagination
              totalCountItems={selectedTrendData.current.length}
              totalPagesCount={totalPagesCount}
              currentPage={page}
              onPageChange={(e) => {
                setPage(e);
              }}
              currentRowsPerPage={+rowsPerPage}
              onRowsPerPageChange={(e) => setRowsPerPage(e)}
            />
          </div>
        </div>
      </Rnd>
    );
  });
  
  export default React.memo(SignalTable);
  
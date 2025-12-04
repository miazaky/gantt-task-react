import React from "react";
import { Task } from "../../types/public-types";
import { addToDate } from "../../helpers/date-helper";
import styles from "./grid.module.css";

export type GridBodyProps = {
  tasks: Task[];
  dates: Date[];
  svgWidth: number;
  rowHeight: number;
  columnWidth: number;
  todayColor: string;
  rtl: boolean;
};
export const GridBody: React.FC<GridBodyProps> = ({
  tasks,
  dates,
  rowHeight,
  svgWidth,
  columnWidth,
  todayColor,
  rtl,
}) => {
  const groups = tasks.reduce((acc, t) => {
    const key = t.name ?? "";
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {} as Record<string, Task[]>);

  const groupNames = Object.keys(groups);
  const rowCount = groupNames.length;
  const gridRows: React.ReactNode[] = [];
  const rowLines: React.ReactNode[] = [];

  let totalHeight = rowCount * rowHeight;

  rowLines.push(
    <line
      key="RowLineFirst"
      x="0"
      y1={0}
      x2={svgWidth}
      y2={0}
      className={styles.gridRowLine}
    />
  );

  let y = 0;
  for (let i = 0; i < rowCount; i++) {
    gridRows.push(
      <rect
        key={`Row${i}`}
        x="0"
        y={y}
        width={svgWidth}
        height={rowHeight}
        className={styles.gridRow}
      />
    );
    rowLines.push(
      <line
        key={`RowLine${i}`}
        x="0"
        y1={y + rowHeight}
        x2={svgWidth}
        y2={y + rowHeight}
        className={styles.gridRowLine}
      />
    );
    y += rowHeight;
  }
  const now = new Date();
  let tickX = 0;
  const ticks: React.ReactNode[] = [];
  let today: React.ReactNode = <rect />;
  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];
    ticks.push(
      <line
        key={date.getTime()}
        x1={tickX}
        y1={0}
        x2={tickX}
        y2={totalHeight}
        className={styles.gridTick}
      />
    );
    const isToday =
      (i + 1 < dates.length &&
        date.getTime() < now.getTime() &&
        dates[i + 1].getTime() >= now.getTime()) ||
      (i > 0 &&
        i + 1 === dates.length &&
        date.getTime() < now.getTime() &&
        addToDate(
          date,
          date.getTime() - dates[i - 1].getTime(),
          "millisecond"
        ).getTime() >= now.getTime());

    if (isToday) {
      today = (
        <rect
          key="today-highlight"
          x={tickX}
          y={0}
          width={columnWidth}
          height={totalHeight}
          fill={todayColor}
        />
      );
    }
    const isTodayRTL =
      rtl &&
      i + 1 < dates.length &&
      date.getTime() >= now.getTime() &&
      dates[i + 1].getTime() < now.getTime();

    if (isTodayRTL) {
      today = (
        <rect
          key="today-highlight"
          x={tickX + columnWidth}
          y={0}
          width={columnWidth}
          height={totalHeight}
          fill={todayColor}
        />
      );
    }

    tickX += columnWidth;
  }

  return (
    <g className="gridBody">
      <g className="rows">{gridRows}</g>
      <g className="rowLines">{rowLines}</g>
      <g className="ticks">{ticks}</g>
      <g className="today">{today}</g>
    </g>
  );
};

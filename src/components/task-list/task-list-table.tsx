import React, { useMemo } from "react";
import styles from "./task-list-table.module.css";
import { Task } from "../../types/public-types";

const localeDateStringCache: Record<string, string> = {};
const toLocaleDateStringFactory =
  (locale: string) =>
  (date: Date, dateTimeOptions: Intl.DateTimeFormatOptions) => {
    const key = JSON.stringify([locale, date.getTime(), dateTimeOptions]);
    let lds = localeDateStringCache[key];
    if (!lds) {
      lds = date.toLocaleDateString(locale, dateTimeOptions);
      localeDateStringCache[key] = lds;
    }
    return lds;
  };
const dateTimeOptions: Intl.DateTimeFormatOptions = {
  weekday: "short",
  year: "numeric",
  month: "long",
  day: "numeric",
};

export const TaskListTableDefault: React.FC<{
  rowHeight: number;
  rowWidth: string;
  fontFamily: string;
  fontSize: string;
  locale: string;
  tasks: Task[];
  selectedTaskId: string;
  setSelectedTask: (taskId: string) => void;
  onExpanderClick: (task: Task) => void;
}> = ({
  rowHeight,
  rowWidth,
  tasks,
  fontFamily,
  fontSize,
  locale,
  onExpanderClick,
}) => {
  const toLocaleDateString = useMemo(
    () => toLocaleDateStringFactory(locale),
    [locale]
  );

  return (
    <div
      className={styles.taskListWrapper}
      style={{
        fontFamily: fontFamily,
        fontSize: fontSize,
      }}
    >
    {(() => {
  // 1️⃣ Group tasks by employee name
      const groups = tasks.reduce((acc, t) => {
        const key = t.name ?? "";
        if (!acc[key]) acc[key] = [];
        acc[key].push(t);
        return acc;
      }, {} as Record<string, Task[]>);

      return Object.entries(groups).map(([name, employeeTasks]) => {
        // 2️⃣ Sort tasks by start
        const sorted = [...employeeTasks].sort(
          (a, b) => a.start.getTime() - b.start.getTime()
        );

        // 3️⃣ Merge overlapping tasks → blocks
        const blocks: { start: Date; end: Date }[] = [];
        let currentStart = sorted[0].start;
        let currentEnd = sorted[0].end;

        for (let i = 1; i < sorted.length; i++) {
          const t = sorted[i];
          if (t.start <= currentEnd) {
            // they overlap → extend current block
            currentEnd = new Date(Math.max(currentEnd.getTime(), t.end.getTime()));
          } else {
            // no overlap → push block and start new one
            blocks.push({ start: currentStart, end: currentEnd });
            currentStart = t.start;
            currentEnd = t.end;
          }
        }
        blocks.push({ start: currentStart, end: currentEnd });

        // 4️⃣ Expander based on first task
        const main = employeeTasks[0];
        let expanderSymbol = "";
        if (main.hideChildren === false) expanderSymbol = "▼";
        else if (main.hideChildren === true) expanderSymbol = "▶";

        return (
          <div
            key={name}
            className={styles.taskListTableRow}
            style={{ height: rowHeight }}
          >
            {/* NAME CELL */}
            <div
              className={styles.taskListCell}
              style={{
                minWidth: rowWidth,
                maxWidth: rowWidth,
              }}
              title={name}
            >
              <div className={styles.taskListNameWrapper}>
                <div
                  className={
                    expanderSymbol
                      ? styles.taskListExpander
                      : styles.taskListEmptyExpander
                  }
                  onClick={() => onExpanderClick(main)}
                >
                  {expanderSymbol}
                </div>
                <div>{name}</div>
              </div>
            </div>

            {/* 5️⃣ DATE BLOCKS — one row, multiple blocks horizontally */}
            {blocks.map((block, idx) => (
              <div
                key={idx}
                className={styles.taskListCell}
                style={{
                  minWidth: rowWidth,
                  maxWidth: rowWidth,
                }}
              >
                {toLocaleDateString(block.start, dateTimeOptions)}
                {" — "}
                {toLocaleDateString(block.end, dateTimeOptions)}
              </div>
            ))}
          </div>
        );
      });
    })()}


    </div>
  );
};

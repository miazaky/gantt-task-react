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

  const groups = tasks.reduce((acc, t) => {
    const key = t.name ?? "";
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {} as Record<string, Task[]>);

  return (
    <div
      className={styles.taskListWrapper}
      style={{
        fontFamily: fontFamily,
        fontSize: fontSize,
      }}
    >
      {Object.entries(groups).map(([name, employeeTasks]) => {
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
            <div
              className={styles.taskListCell}
              style={{ minWidth: rowWidth, maxWidth: rowWidth }}
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

            <div
              className={styles.taskListCell}
              style={{ minWidth: rowWidth, maxWidth: rowWidth }}
            >
              &nbsp;
              {toLocaleDateString(
                new Date(
                  Math.min(...employeeTasks.map(t => t.start.getTime()))
                ),
                dateTimeOptions
              )}
            </div>

            <div
              className={styles.taskListCell}
              style={{ minWidth: rowWidth, maxWidth: rowWidth }}
            >
              &nbsp;
              {toLocaleDateString(
                new Date(
                  Math.max(...employeeTasks.map(t => t.end.getTime()))
                ),
                dateTimeOptions
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

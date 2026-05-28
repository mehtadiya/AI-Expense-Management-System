import React, { useState, useMemo, useEffect } from "react";

export default function Calendar({
  initialDate = null,
  onChange = () => {},
  startMonth = null,
}) {
  const today = new Date();

  const initial = initialDate ? new Date(initialDate) : null;

  const [selected, setSelected] = useState(initial);
  const [viewMonth, setViewMonth] = useState(() => {
    if (startMonth) {
      const sm = startMonth.getFullYear
        ? startMonth
        : new Date(startMonth);
      return new Date(sm.getFullYear(), sm.getMonth(), 1);
    }
    if (initial) {
      return new Date(initial.getFullYear(), initial.getMonth(), 1);
    }
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  useEffect(() => {
    if (initialDate) {
      const d = new Date(initialDate);
      setSelected(d);
      setViewMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    }
  }, [initialDate]);

  const monthName = viewMonth.toLocaleString(undefined, {
    month: "long",
    year: "numeric",
  });

  const firstDayOfMonth = new Date(
    viewMonth.getFullYear(),
    viewMonth.getMonth(),
    1
  );

  const startWeekday = firstDayOfMonth.getDay();

  const daysInMonth = new Date(
    viewMonth.getFullYear(),
    viewMonth.getMonth() + 1,
    0
  ).getDate();

  const weeks = useMemo(() => {
    const grid = [];
    let currentDay = 1 - startWeekday;

    while (currentDay <= daysInMonth) {
      const week = [];

      for (let i = 0; i < 7; i++) {
        const date = new Date(
          viewMonth.getFullYear(),
          viewMonth.getMonth(),
          currentDay
        );

        week.push({
          date,
          inMonth: date.getMonth() === viewMonth.getMonth(),
        });

        currentDay++;
      }

      grid.push(week);
    }

    return grid;
  }, [viewMonth, startWeekday, daysInMonth]);

  function selectDate(d) {
    setSelected(d);
    onChange(d);
  }

  function prevMonth() {
    setViewMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  }

  function nextMonth() {
    setViewMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  }

  const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="calendar-card" style={styles.card}>
      <div style={styles.header}>
        <button
          className="btn btn-sm"
          onClick={prevMonth}
          style={styles.navBtn}
        >
          ‹
        </button>

        <div style={styles.monthName}>{monthName}</div>

        <button
          className="btn btn-sm"
          onClick={nextMonth}
          style={styles.navBtn}
        >
          ›
        </button>
      </div>

      <div style={styles.weekdays}>
        {weekdayNames.map((w) => (
          <div key={w} style={styles.weekdayCell}>
            {w}
          </div>
        ))}
      </div>

      <div style={styles.grid}>
        {weeks.map((week, wi) => (
          <div key={wi} style={styles.weekRow}>
            {week.map(({ date, inMonth }, di) => {
              const isToday =
                date.toDateString() === today.toDateString();

              const isSelected =
                selected &&
                date.toDateString() === selected.toDateString();

              return (
                <button
                  key={di}
                  disabled={!inMonth}
                  onClick={() =>
                    inMonth &&
                    selectDate(
                      new Date(
                        date.getFullYear(),
                        date.getMonth(),
                        date.getDate()
                      )
                    )
                  }
                  style={{
                    ...styles.dayCell,
                    opacity: inMonth ? 1 : 0.35,
                    background: isSelected ? "#C19A6B" : "transparent",
                    color: isSelected
                      ? "#fff"
                      : isToday
                      ? "#C19A6B"
                      : "#333",
                    cursor: inMonth ? "pointer" : "default",
                  }}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  card: {
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
    height: "100%",
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
    padding: 10,
    overflow: "hidden",
  },

  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    width: "100%",
  },

  navBtn: {
    background: "transparent",
    border: "none",
    fontSize: 16,
    width: 28,
    height: 28,
    color: "#3E2723",
    padding: 0,
  },

  monthName: {
    fontWeight: 700,
    fontSize: 15,
    color: "#3E2723",
    textAlign: "center",
    flex: 1,
  },

  weekdays: {
    display: "grid",
    gridTemplateColumns: "repeat(7, minmax(0,1fr))",
    fontSize: 11,
    textAlign: "center",
    color: "#6D4C41",
    marginBottom: 4,
    width: "100%",
  },

  weekdayCell: {
    padding: "4px 0",
  },

  grid: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    width: "100%",
  },

  weekRow: {
    display: "grid",
    gridTemplateColumns: "repeat(7, minmax(0,1fr))",
    gap: 4,
    width: "100%",
  },

  dayCell: {
    width: "100%",
    aspectRatio: "1 / 1",
    minHeight: 32,
    borderRadius: 6,
    border: "none",
    background: "transparent",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    padding: 0,
  },
};
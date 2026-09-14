import clsx from 'clsx';
import styles from './CharacterTable.module.scss';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ColumnDefinition<TRow extends { id: string }, TValue = any> {
  id: string;
  field?: keyof TRow;
  headerLabel?: string;
  width?: number | string;
  headerCellClass?: string;
  rowCellClass?: string;
  cellRenderer?: (value: TValue, row: TRow) => React.ReactNode;
}

interface CharacterTableProps<TRow extends { id: string }> {
  columnDefinitions: ColumnDefinition<TRow>[];
  rows: TRow[];
  className?: string;
  rowClassName?: string;
  isFullWidth?: boolean;
  selectedRowIds?: string[];
  onRowClick?: (rowId: string) => void;
}

export const CharacterTable = <
  TRow extends { id: string; [key: string]: any }, // eslint-disable-line @typescript-eslint/no-explicit-any
>({
  columnDefinitions,
  rows,
  className = '',
  rowClassName = '',
  isFullWidth = false,
  selectedRowIds = [],
  onRowClick,
}: CharacterTableProps<TRow>) => {
  const renderCell = (row: TRow, columnDefinition: ColumnDefinition<TRow>) => {
    const cellValue = columnDefinition.field
      ? row[columnDefinition.field]
      : null;

    if (columnDefinition.cellRenderer) {
      return columnDefinition.cellRenderer(cellValue, row);
    }

    return cellValue;
  };

  const templateColumns = columnDefinitions
    .map(({ width }) => {
      if (typeof width === 'number') {
        return `${width}px`;
      }

      return width || 'auto';
    })
    .join(' ');

  return (
    <div
      className={clsx(
        styles.grid,
        { [styles.fullWidth]: isFullWidth },
        className,
      )}
      style={{
        gridTemplateColumns: templateColumns,
      }}
    >
      <div
        className={clsx(styles.headerRow, rowClassName)}
        style={{ gridColumn: `1 / span ${columnDefinitions.length}` }}
      >
        {columnDefinitions.map((columnDefinition) => (
          <div
            key={columnDefinition.id}
            className={columnDefinition.headerCellClass}
          >
            {columnDefinition.headerLabel}
          </div>
        ))}
      </div>
      <div
        className={styles.rows}
        style={{ gridColumn: `1 / span ${columnDefinitions.length}` }}
      >
        {rows.map((row) => (
          <div
            key={row.id}
            className={clsx(
              styles.row,
              {
                [styles.selected]: selectedRowIds.includes(row.id),
              },
              rowClassName,
            )}
            style={{ gridColumn: `1 / span ${columnDefinitions.length}` }}
            onClick={() => onRowClick?.(row.id)}
          >
            {columnDefinitions.map((columnDefinition) => (
              <div
                key={columnDefinition.id}
                className={columnDefinition.rowCellClass}
              >
                {renderCell(row, columnDefinition)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

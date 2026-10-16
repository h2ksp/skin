import type { MaterialItem, LaborItem, CostMachine, CostGroup } from './types';

type RowItem = MaterialItem | LaborItem | CostMachine | CostGroup;
type RowType = RowItem['type'];

const ROW_TYPES: RowType[] = ['자재', '노무', '건설기계', '일위대가'];

interface CostTableProps {
    items: RowItem[];
    onChange: (items: RowItem[]) => void;
    onOpenDetail?: (row: CostMachine | CostGroup, index: number) => void;
    showCode?: boolean;
    showRemark?: boolean;
}

const cellStyle = {
    border: '1px solid #bbb',
    padding: '4px 6px',
    fontSize: '12px',
} as const;

const inputStyle = {
    width: '100%',
    boxSizing: 'border-box' as const,
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontSize: '12px',
    fontFamily: 'monospace, sans-serif',
};

export function CostTable({ 
    items = [], 
    onChange, 
    onOpenDetail,
    showCode = true, 
    showRemark = true 
}: CostTableProps) {
    const handleAddRow = () => {
        const newRow: MaterialItem = {
            type: '자재',
            code: '',
            name: '',
            spec: '',
            unit: '',
            qty: 1,
            baseMat: 0,
            baseLab: 0,
            baseExp: 0,
            remark: '',
        };
        onChange([...items, newRow]);
    };

    const handleChange = (index: number, field: keyof RowItem, val: string) => {
        const updated = items.map((row, i) => {
            if (i !== index) return row;

            const isNum = ['qty', 'baseMat', 'baseLab', 'baseExp'].includes(field);
            const value = isNum ? Number(val.replace(/,/g, '')) || 0 : val;
            return { ...row, [field]: value };
        });

        onChange(updated as RowItem[]);
    };

    const handleTypeChange = (index: number, newType: RowType) => {
        const target = items[index];
        const base = {
            code: target.code ?? '',
            name: target.name,
            spec: target.spec ?? '',
            unit: target.unit ?? '',
            qty: target.qty,
            baseMat: target.baseMat,
            baseLab: target.baseLab,
            baseExp: target.baseExp,
            remark: target.remark ?? '',
        };
        let updated: RowItem;

        switch (newType) {
            case '자재':
                updated = { ...base, type: '자재' };
                break;
            case '노무':
                updated = { ...base, type: '노무' };
                break;
            case '건설기계':
                updated = { ...base, type: '건설기계', detail: [] };
                break;
            case '일위대가':
                updated = { ...base, type: '일위대가', detail: [] };
                break;
        }

        const next = [...items];
        next[index] = updated;
        onChange(next);
    };

    // 행 위/아래 이동
    const handleMoveRow = (index: number, direction: 'up' | 'down') => {
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= items.length) return;

        const next = [...items];
        const temp = next[index];
        next[index] = next[targetIndex];
        next[targetIndex] = temp;
        onChange(next);
    };

    // 삭제 전 확인창 띄우기
    const handleDeleteRow = (index: number) => {
        const target = items[index];
        const label = target.name.trim() ? `'${target.name.trim()}'` : `${index + 1}번 품목`;
        
        if (confirm(`${label}을(를) 삭제할 거야?`)) {
            onChange(items.filter((_, i) => i !== index));
        }
    };

    const totalMat = items.reduce((sum, r) => sum + r.qty * r.baseMat, 0);
    const totalLab = items.reduce((sum, r) => sum + r.qty * r.baseLab, 0);
    const totalExp = items.reduce((sum, r) => sum + r.qty * r.baseExp, 0);
    const grandTotal = totalMat + totalLab + totalExp;

    const currentCols = 13 + (showCode ? 1 : 0) + (showRemark ? 1 : 0);

    return (
        <div style={{ fontFamily: 'monospace, sans-serif', padding: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                <button
                    type="button"
                    onClick={handleAddRow}
                    style={{
                        border: '1px solid #333',
                        background: '#fff',
                        cursor: 'pointer',
                        padding: '2px 8px',
                        fontSize: '12px',
                    }}
                >
                    + 품목 추가
                </button>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #333', tableLayout: 'fixed' }}>
                <thead>
                    <tr style={{ background: '#eee', textAlign: 'center' }}>
                        <th style={{ ...cellStyle, width: '44px' }}>-</th>
                        {showCode && <th style={{ ...cellStyle, width: '80px' }}>코드</th>}
                        <th style={{ ...cellStyle, width: '85px' }}>Type</th>
                        <th style={{ ...cellStyle, minWidth: '130px' }}>품명</th>
                        <th style={{ ...cellStyle, minWidth: '100px' }}>규격</th>
                        <th style={{ ...cellStyle, width: '45px' }}>단위</th>
                        <th style={{ ...cellStyle, width: '60px' }}>수량</th>
                        <th style={{ ...cellStyle, width: '90px' }}>재료비</th>
                        <th style={{ ...cellStyle, width: '90px' }}>노무비</th>
                        <th style={{ ...cellStyle, width: '90px' }}>경비</th>
                        <th style={{ ...cellStyle, width: '95px' }}>소계</th>
                        <th style={{ ...cellStyle, width: '95px' }}>공사비</th>
                        {showRemark && <th style={{ ...cellStyle, minWidth: '50px' }}>비고</th>}
                        <th style={{ ...cellStyle, width: '50px' }}>상세</th>
                        <th style={{ ...cellStyle, width: '30px' }}>-</th>
                    </tr>
                </thead>
                <tbody>
                    {items.length === 0 ? (
                        <tr>
                            <td
                                colSpan={currentCols}
                                style={{ ...cellStyle, textAlign: 'center', padding: '20px', color: '#666' }}
                            >
                                품목이 없습니다. '+ 품목 추가' 버튼을 눌러주세요.
                            </td>
                        </tr>
                    ) : (
                        items.map((row, index) => {
                            const unitSum = row.baseMat + row.baseLab + row.baseExp;
                            const totalAmount = row.qty * unitSum;
                            const hasDetail = row.type === '건설기계' || row.type === '일위대가';

                            return (
                                <tr key={index}>
                                    {/* 순서 이동 열 (맨 앞) */}
                                    <td style={{ ...cellStyle, textAlign: 'center', whiteSpace: 'nowrap' }}>
                                        <button
                                            type="button"
                                            disabled={index === 0}
                                            onClick={() => handleMoveRow(index, 'up')}
                                            style={{
                                                border: 'none',
                                                background: 'none',
                                                cursor: index === 0 ? 'default' : 'pointer',
                                                color: index === 0 ? '#ccc' : '#333',
                                                fontSize: '10px',
                                                padding: '0 2px',
                                            }}
                                        >
                                            ▲
                                        </button>
                                        <button
                                            type="button"
                                            disabled={index === items.length - 1}
                                            onClick={() => handleMoveRow(index, 'down')}
                                            style={{
                                                border: 'none',
                                                background: 'none',
                                                cursor: index === items.length - 1 ? 'default' : 'pointer',
                                                color: index === items.length - 1 ? '#ccc' : '#333',
                                                fontSize: '10px',
                                                padding: '0 2px',
                                            }}
                                        >
                                            ▼
                                        </button>
                                    </td>

                                    {/* 코드 */}
                                    {showCode && (
                                        <td style={cellStyle}>
                                            <input
                                                type="text"
                                                value={row.code ?? ''}
                                                placeholder="-"
                                                style={inputStyle}
                                                onInput={(e) => handleChange(index, 'code', (e.target as HTMLInputElement).value)}
                                            />
                                        </td>
                                    )}

                                    {/* Type */}
                                    <td style={cellStyle}>
                                        <select
                                            value={row.type}
                                            onChange={(e) => handleTypeChange(index, (e.target as HTMLSelectElement).value as RowType)}
                                            style={{ ...inputStyle, cursor: 'pointer' }}
                                        >
                                            {ROW_TYPES.map((t) => (
                                                <option key={t} value={t}>{t}</option>
                                            ))}
                                        </select>
                                    </td>

                                    {/* 품명 */}
                                    <td style={cellStyle}>
                                        <input
                                            type="text"
                                            value={row.name}
                                            placeholder="품명"
                                            style={inputStyle}
                                            onInput={(e) => handleChange(index, 'name', (e.target as HTMLInputElement).value)}
                                        />
                                    </td>

                                    {/* 규격 */}
                                    <td style={cellStyle}>
                                        <input
                                            type="text"
                                            value={row.spec ?? ''}
                                            placeholder="-"
                                            style={inputStyle}
                                            onInput={(e) => handleChange(index, 'spec', (e.target as HTMLInputElement).value)}
                                        />
                                    </td>

                                    {/* 단위 */}
                                    <td style={cellStyle}>
                                        <input
                                            type="text"
                                            value={row.unit ?? ''}
                                            placeholder="-"
                                            style={{ ...inputStyle, textAlign: 'center' }}
                                            onInput={(e) => handleChange(index, 'unit', (e.target as HTMLInputElement).value)}
                                        />
                                    </td>

                                    {/* 수량 */}
                                    <td style={cellStyle}>
                                        <input
                                            type="number"
                                            min="0"
                                            step="any"
                                            value={row.qty}
                                            style={{ ...inputStyle, textAlign: 'right' }}
                                            onInput={(e) => handleChange(index, 'qty', (e.target as HTMLInputElement).value)}
                                        />
                                    </td>

                                    {/* 재료비 (콤마 적용) */}
                                    <td style={cellStyle}>
                                        <input
                                            type="text"
                                            value={row.baseMat ? row.baseMat.toLocaleString() : ''}
                                            placeholder="0"
                                            style={{ ...inputStyle, textAlign: 'right' }}
                                            onInput={(e) => handleChange(index, 'baseMat', (e.target as HTMLInputElement).value)}
                                        />
                                    </td>

                                    {/* 노무비 (콤마 적용) */}
                                    <td style={cellStyle}>
                                        <input
                                            type="text"
                                            value={row.baseLab ? row.baseLab.toLocaleString() : ''}
                                            placeholder="0"
                                            style={{ ...inputStyle, textAlign: 'right' }}
                                            onInput={(e) => handleChange(index, 'baseLab', (e.target as HTMLInputElement).value)}
                                        />
                                    </td>

                                    {/* 경비 (콤마 적용) */}
                                    <td style={cellStyle}>
                                        <input
                                            type="text"
                                            value={row.baseExp ? row.baseExp.toLocaleString() : ''}
                                            placeholder="0"
                                            style={{ ...inputStyle, textAlign: 'right' }}
                                            onInput={(e) => handleChange(index, 'baseExp', (e.target as HTMLInputElement).value)}
                                        />
                                    </td>

                                    {/* 소계 */}
                                    <td style={{ ...cellStyle, textAlign: 'right', background: '#fafafa' }}>
                                        {unitSum.toLocaleString()}
                                    </td>

                                    {/* 공사비 */}
                                    <td style={{ ...cellStyle, textAlign: 'right', background: '#fafafa', fontWeight: 'bold' }}>
                                        {totalAmount.toLocaleString()}
                                    </td>

                                    {/* 비고 */}
                                    {showRemark && (
                                        <td style={cellStyle}>
                                            <input
                                                type="text"
                                                value={row.remark ?? ''}
                                                placeholder="-"
                                                style={inputStyle}
                                                onInput={(e) => handleChange(index, 'remark', (e.target as HTMLInputElement).value)}
                                            />
                                        </td>
                                    )}

                                    {/* 상세 */}
                                    <td style={{ ...cellStyle, textAlign: 'center' }}>
                                        {hasDetail ? (
                                            <button
                                                type="button"
                                                onClick={() => onOpenDetail?.(row as CostMachine | CostGroup, index)}
                                                style={{
                                                    fontSize: '11px',
                                                    border: '1px solid #333',
                                                    background: '#fff',
                                                    cursor: 'pointer',
                                                    padding: '2px 4px',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                자세히({(row as CostMachine | CostGroup).detail.length})
                                            </button>
                                        ) : (
                                            <span style={{ color: '#ccc' }}>-</span>
                                        )}
                                    </td>

                                    {/* 삭제 */}
                                    <td style={{ ...cellStyle, textAlign: 'center' }}>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteRow(index)}
                                            style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '11px' }}
                                        >
                                            ×
                                        </button>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>

            <div
                style={{
                    marginTop: '6px',
                    border: '1px solid #333',
                    background: '#eee',
                    padding: '6px 12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '12px',
                    flexWrap: 'wrap',
                    gap: '8px',
                }}
            >
                <span>품목 수: {items.length}개</span>
                <span>재료비: {totalMat.toLocaleString()}원</span>
                <span>노무비: {totalLab.toLocaleString()}원</span>
                <span>경비: {totalExp.toLocaleString()}원</span>
                <strong>공종 합계: {grandTotal.toLocaleString()} 원</strong>
            </div>
        </div>
    );
}
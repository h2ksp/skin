import { useState } from 'preact/hooks';
import { CostTable } from './CostTable';
import type { MaterialItem, LaborItem, CostMachine, CostGroup, ItemGroup } from './types';

export type WorkItem = MaterialItem | LaborItem | CostMachine | CostGroup;

export interface GroupCard extends ItemGroup {
    id: string;
    isOpen: boolean;
}

function useGroupDnd(setGroups: (fn: (prev: GroupCard[]) => GroupCard[]) => void) {
    const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
    const [dropIndicator, setDropIndicator] = useState<{ index: number; position: 'top' | 'bottom' } | null>(null);

    const dragHandlers = {
        onDragStart: (e: DragEvent, index: number) => {
            setDraggedIdx(index);
            if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
        },
        onDragOver: (e: DragEvent, index: number) => {
            e.preventDefault();
            if (draggedIdx === null || draggedIdx === index) return setDropIndicator(null);
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            setDropIndicator({ index, position: e.clientY < rect.top + rect.height / 2 ? 'top' : 'bottom' });
        },
        onDragLeave: () => setDropIndicator(null),
        onDrop: (targetIndex: number) => {
            if (draggedIdx === null || draggedIdx === targetIndex || !dropIndicator) return;
            setGroups((prev) => {
                const updated = [...prev];
                const [item] = updated.splice(draggedIdx, 1);
                const insertIdx = dropIndicator.position === 'bottom'
                    ? (draggedIdx < targetIndex ? targetIndex : targetIndex + 1)
                    : (draggedIdx < targetIndex ? targetIndex - 1 : targetIndex);
                updated.splice(insertIdx, 0, item);
                return updated;
            });
            setDraggedIdx(null);
            setDropIndicator(null);
        },
        onDragEnd: () => {
            setDraggedIdx(null);
            setDropIndicator(null);
        },
    };

    return { draggedIdx, dropIndicator, dragHandlers };
}

export function CostGroupList() {
    const [groups, setGroups] = useState<GroupCard[]>([
        { id: '1', name: '철골공사', isOpen: true, items: [] },
        { id: '2', name: '조적공사', isOpen: true, items: [] },
    ]);

    const [isCompact, setIsCompact] = useState<boolean>(false);

    const { draggedIdx, dropIndicator, dragHandlers } = useGroupDnd(setGroups);

    const updateGroup = (id: string, patch: Partial<GroupCard>) => {
        setGroups((prev) => prev.map((g) => (g.id === id ? { ...g, ...patch } : g)));
    };

    const handleDelete = (id: string, index: number, name: string) => {
        const label = name.trim() ? `'${name.trim()}'` : `공종 #${index + 1}`;
        if (confirm(`${label} 내역을 삭제할 거야?`)) {
            setGroups((prev) => prev.filter((g) => g.id !== id));
        }
    };

    return (
        <div style={{ maxWidth: '1600px', width: '98%', margin: '0 auto', padding: '16px 8px', fontFamily: 'monospace, sans-serif' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: '10px', marginBottom: '16px' }}>
                <span style={{ fontSize: '18px', fontWeight: 700 }}>공종별 내역서</span>
                <span style={{ fontSize: '13px', color: '#777' }}>총 {groups.length}개 공종</span>

                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '13px', color: '#555', background: '#f5f5f5', padding: '3px 8px', borderRadius: '4px' }}>
                    <input
                        type="checkbox"
                        checked={isCompact}
                        onChange={(e) => setIsCompact((e.target as HTMLInputElement).checked)}
                    />
                    간단히 보기
                </label>

                <button
                    type="button"
                    onClick={() => setGroups((p) => [...p, { id: crypto.randomUUID(), name: '', isOpen: true, items: [] }])}
                    style={{ marginLeft: 'auto', background: '#111', color: '#fff', border: 'none', padding: '5px 12px', fontSize: '13px', cursor: 'pointer' }}
                >
                    + 공종 추가
                </button>
            </div>

            <div>
                {groups.map((group, index) => {
                    const isDragging = draggedIdx === index;
                    const isTop = dropIndicator?.index === index && dropIndicator?.position === 'top';
                    const isBottom = dropIndicator?.index === index && dropIndicator?.position === 'bottom';

                    return (
                        <div
                            key={group.id}
                            draggable
                            onDragStart={(e) => dragHandlers.onDragStart(e, index)}
                            onDragOver={(e) => dragHandlers.onDragOver(e, index)}
                            onDragLeave={dragHandlers.onDragLeave}
                            onDrop={() => dragHandlers.onDrop(index)}
                            onDragEnd={dragHandlers.onDragEnd}
                            style={{
                                opacity: isDragging ? 0.25 : 1,
                                borderTop: isTop ? '2px solid #0055ff' : 'none',
                                borderBottom: isBottom ? '2px solid #0055ff' : 'none',
                                background: '#fff',
                                marginBottom: group.isOpen ? '20px' : '4px',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '3px 0' }}>
                                <span style={{ cursor: 'grab', userSelect: 'none', color: '#aaa', fontSize: '14px' }}>⋮⋮</span>
                                <button
                                    type="button"
                                    onClick={() => updateGroup(group.id, { isOpen: !group.isOpen })}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: '9px',
                                        padding: '0 2px',
                                        color: '#555',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    {group.isOpen ? '▼' : '▶'}
                                </button>

                                <span style={{ fontSize: '12px', background: '#f0f0f0', padding: '1px 5px', fontWeight: 'bold' }}>
                                    {String(index + 1).padStart(2, '0')}
                                </span>
                                <input
                                    type="text"
                                    value={group.name}
                                    placeholder="공종명 입력"
                                    onInput={(e) => updateGroup(group.id, { name: (e.target as HTMLInputElement).value })}
                                    style={{
                                        border: 'none',
                                        background: 'transparent',
                                        padding: '1px 4px',
                                        fontSize: '15px',
                                        fontWeight: 600,
                                        width: '240px',
                                        outline: 'none',
                                    }}
                                />
                                <span style={{ fontSize: '13px', color: '#888' }}>({group.items.length}개)</span>
                                <button
                                    type="button"
                                    onClick={() => handleDelete(group.id, index, group.name)}
                                    style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '12px' }}
                                >
                                    삭제
                                </button>
                            </div>

                            {group.isOpen && (
                                <div style={{ overflowX: 'auto', marginTop: '4px' }}>
                                    <CostTable
                                        items={group.items}
                                        onChange={(items) => updateGroup(group.id, { items })}
                                        showCode={!isCompact}
                                        showRemark={!isCompact}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
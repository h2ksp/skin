export interface TabItem {
  id: string;
  label: string;
}

interface TabMenuProps {
  tabs: TabItem[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
}

export function TabMenu({ tabs, activeTabId, onSelectTab }: TabMenuProps) {
  return (
    <div
      style={{
        display: 'flex',
        borderBottom: '2px solid #333',
        gap: '4px',
        padding: '0 8px',
        fontFamily: 'monospace, sans-serif',
      }}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelectTab(tab.id)}
            style={{
              padding: '6px 14px',
              fontSize: '13px',
              cursor: 'pointer',
              borderTop: isActive ? '2px solid #333' : '1px solid #bbb',
              borderLeft: isActive ? '2px solid #333' : '1px solid #bbb',
              borderRight: isActive ? '2px solid #333' : '1px solid #bbb',
              borderBottom: isActive ? '2px solid #fff' : 'none',
              backgroundColor: isActive ? '#fff' : '#e5e5e5',
              fontWeight: isActive ? 'bold' : 'normal',
              color: isActive ? '#000' : '#555',
              marginBottom: '-2px', // 아래 테두리와 자연스럽게 연결
              outline: 'none',
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
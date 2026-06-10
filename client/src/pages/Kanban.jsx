import { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { getRequests, updateStage } from '../api';

const STAGES = ['new', 'in_progress', 'repaired', 'scrap'];

const STAGE_LABELS = {
  new: 'New',
  in_progress: 'In Progress',
  repaired: 'Repaired',
  scrap: 'Scrap',
};

const STAGE_COLORS = {
  new: '#2b6cb0',
  in_progress: '#975a16',
  repaired: '#276749',
  scrap: '#c53030',
};

const STAGE_BG = {
  new: '#ebf8ff',
  in_progress: '#fffff0',
  repaired: '#f0fff4',
  scrap: '#fff5f5',
};

export default function Kanban() {
  const [columns, setColumns] = useState({
    new: [],
    in_progress: [],
    repaired: [],
    scrap: [],
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    try {
      const { data } = await getRequests();
      // Group requests by stage
      const grouped = { new: [], in_progress: [], repaired: [], scrap: [] };
      data.forEach(r => {
        if (grouped[r.stage]) grouped[r.stage].push(r);
      });
      setColumns(grouped);
    } catch (err) {
      setError('Failed to load requests');
    }
  }

  async function handleDragEnd(result) {
    const { source, destination, draggableId } = result;

    // Dropped outside a column
    if (!destination) return;
    // Dropped in same place
    if (source.droppableId === destination.droppableId &&
        source.index === destination.index) return;

    const sourceStage = source.droppableId;
    const destStage = destination.droppableId;
    const requestId = parseInt(draggableId);

    // Optimistic UI update — move card immediately without waiting for API
    const sourceItems = [...columns[sourceStage]];
    const destItems = sourceStage === destStage
      ? sourceItems
      : [...columns[destStage]];

    const [moved] = sourceItems.splice(source.index, 1);
    moved.stage = destStage;
    destItems.splice(destination.index, 0, moved);

    setColumns({
      ...columns,
      [sourceStage]: sourceItems,
      [destStage]: destItems,
    });

    // Persist to DB
    try {
      await updateStage(requestId, destStage);
    } catch (err) {
      setError('Failed to update stage');
      fetchRequests(); // revert on failure
    }
  }

  function isOverdue(request) {
    if (!request.scheduled_date) return false;
    if (request.stage === 'repaired' || request.stage === 'scrap') return false;
    return new Date(request.scheduled_date) < new Date();
  }

  return (
    <div>
      <h2 style={styles.heading}>Kanban Board</h2>
      {error && <p style={styles.error}>{error}</p>}

      <DragDropContext onDragEnd={handleDragEnd}>
        <div style={styles.board}>
          {STAGES.map(stage => (
            <div key={stage} style={styles.column}>

              {/* Column Header */}
              <div style={{
                ...styles.columnHeader,
                borderTop: `4px solid ${STAGE_COLORS[stage]}`,
              }}>
                <span style={{ fontWeight: '700', color: STAGE_COLORS[stage] }}>
                  {STAGE_LABELS[stage]}
                </span>
                <span style={styles.count}>{columns[stage].length}</span>
              </div>

              {/* Droppable area */}
              <Droppable droppableId={stage}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{
                      ...styles.droppable,
                      background: snapshot.isDraggingOver
                        ? '#e2e8f0'
                        : STAGE_BG[stage],
                    }}>

                    {columns[stage].map((request, index) => (
                      <Draggable
                        key={request.id}
                        draggableId={String(request.id)}
                        index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...styles.card,
                              ...provided.draggableProps.style,
                              boxShadow: snapshot.isDragging
                                ? '0 8px 20px rgba(0,0,0,0.15)'
                                : '0 1px 3px rgba(0,0,0,0.08)',
                              border: isOverdue(request)
                                ? '2px solid #e53e3e'
                                : '1px solid #e2e8f0',
                            }}>

                            {/* Overdue banner */}
                            {isOverdue(request) && (
                              <div style={styles.overdueBanner}>
                                ⚠ OVERDUE
                              </div>
                            )}

                            {/* Card content */}
                            <p style={styles.subject}>{request.subject}</p>

                            <p style={styles.meta}>
                              🔧 {request.equipment_name || '—'}
                            </p>
                            <p style={styles.meta}>
                              👥 {request.team_name || '—'}
                            </p>
                            {request.assigned_to_name && (
                              <p style={styles.meta}>
                                👤 {request.assigned_to_name}
                              </p>
                            )}
                            {request.scheduled_date && (
                              <p style={styles.meta}>
                                📅 {request.scheduled_date.slice(0, 10)}
                              </p>
                            )}

                            {/* Type badge */}
                            <span style={{
                              ...styles.badge,
                              background: request.type === 'corrective'
                                ? '#fed7d7' : '#c6f6d5',
                              color: request.type === 'corrective'
                                ? '#c53030' : '#276749',
                            }}>
                              {request.type}
                            </span>

                          </div>
                        )}
                      </Draggable>
                    ))}

                    {provided.placeholder}

                    {columns[stage].length === 0 && (
                      <p style={styles.empty}>No requests</p>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}

const styles = {
  heading: { marginBottom: '20px', fontSize: '1.5rem' },
  error: { color: 'red', marginBottom: '12px' },
  board: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    alignItems: 'start',
  },
  column: {
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #e2e8f0',
  },
  columnHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    background: 'white',
    borderBottom: '1px solid #e2e8f0',
  },
  count: {
    background: '#edf2f7',
    borderRadius: '999px',
    padding: '2px 10px',
    fontSize: '0.8rem',
    fontWeight: '600',
  },
  droppable: {
    minHeight: '200px',
    padding: '12px',
    transition: 'background 0.2s ease',
  },
  card: {
    background: 'white',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '10px',
    cursor: 'grab',
    transition: 'box-shadow 0.2s ease',
  },
  overdueBanner: {
    background: '#e53e3e',
    color: 'white',
    fontSize: '0.7rem',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '4px',
    marginBottom: '8px',
    display: 'inline-block',
  },
  subject: {
    fontWeight: '600',
    fontSize: '0.95rem',
    marginBottom: '8px',
    margin: '0 0 8px 0',
  },
  meta: {
    fontSize: '0.82rem',
    color: '#718096',
    margin: '3px 0',
  },
  badge: {
    display: 'inline-block',
    marginTop: '8px',
    padding: '2px 10px',
    borderRadius: '999px',
    fontSize: '0.75rem',
    fontWeight: '600',
  },
  empty: {
    textAlign: 'center',
    color: '#a0aec0',
    fontSize: '0.85rem',
    padding: '20px 0',
  },
};
import { useState } from 'react';
import { useMockKit } from '../context';
import { LogItem, MockRule } from '../types';
import '../styles.css';
import { generateId } from '../utils';

export const DevTools = () => {
  const { state, dispatch } = useMockKit();
  const [activeTab, setActiveTab] = useState<'logs' | 'mocks'>('logs');
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [editingRule, setEditingRule] = useState<MockRule | null>(null);

  if (!state.isOpen) {
    return (
      <button className="ramk-fab" onClick={() => dispatch({ type: 'TOGGLE_OPEN' })}>
        MK
      </button>
    );
  }

  const selectedLog = state.logs.find((l) => l.id === selectedLogId);

  const handleCreateMockFromLog = (log: LogItem) => {
    const newRule: MockRule = {
      id: generateId(),
      url: log.url,
      method: log.method.toLowerCase() as any,
      status: log.status || 200,
      response: log.responseData || {},
      delay: 0,
      enabled: true,
    };
    dispatch({ type: 'ADD_RULE', payload: newRule });
    setEditingRule(newRule);
    setActiveTab('mocks');
  };

  const handleSaveRule = (rule: MockRule) => {
    if (state.rules.find((r) => r.id === rule.id)) {
      dispatch({ type: 'UPDATE_RULE', payload: rule });
    } else {
      dispatch({ type: 'ADD_RULE', payload: rule });
    }
    setEditingRule(null);
  };

  return (
    <div className="ramk-container ramk-panel">
      <div className="ramk-header">
        <div className="ramk-tabs">
          <button
            className={`ramk-tab ${activeTab === 'logs' ? 'active' : ''}`}
            onClick={() => setActiveTab('logs')}
          >
            Logs ({state.logs.length})
          </button>
          <button
            className={`ramk-tab ${activeTab === 'mocks' ? 'active' : ''}`}
            onClick={() => setActiveTab('mocks')}
          >
            Mocks ({state.rules.length})
          </button>
        </div>
        <div>
          <button className="ramk-btn" onClick={() => dispatch({ type: 'TOGGLE_OPEN' })}>
            Close
          </button>
        </div>
      </div>

      <div className="ramk-content">
        {activeTab === 'logs' && (
          <>
            <div className="ramk-list">
              {state.logs.map((log) => (
                <div
                  key={log.id}
                  className={`ramk-list-item ${selectedLogId === log.id ? 'active' : ''}`}
                  onClick={() => setSelectedLogId(log.id)}
                >
                  <div>
                    <span className={`ramk-badge method-${log.method.toLowerCase()}`}>
                      {log.method}
                    </span>
                    {log.status}
                  </div>
                  <div style={{ fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {log.url}
                  </div>
                  {log.isMocked && <span style={{ fontSize: '10px', color: 'orange' }}>Mocked</span>}
                </div>
              ))}
            </div>
            <div className="ramk-detail">
              {selectedLog ? (
                <div>
                  <h3>Request Details</h3>
                  <p><strong>URL:</strong> {selectedLog.url}</p>
                  <p><strong>Method:</strong> {selectedLog.method}</p>
                  <p><strong>Status:</strong> {selectedLog.status}</p>
                  <p><strong>Duration:</strong> {selectedLog.duration}ms</p>
                  
                  <h4>Response Data</h4>
                  <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
                    {JSON.stringify(selectedLog.responseData, null, 2)}
                  </pre>

                  <button 
                    className="ramk-btn" 
                    onClick={() => handleCreateMockFromLog(selectedLog)}
                  >
                    Mock This Request
                  </button>
                </div>
              ) : (
                <p>Select a request to view details</p>
              )}
            </div>
          </>
        )}

        {activeTab === 'mocks' && (
          <>
            <div className="ramk-list">
                <button 
                    className="ramk-btn" 
                    style={{ width: '100%', marginBottom: '10px' }}
                    onClick={() => setEditingRule({
                        id: generateId(),
                        url: '',
                        method: 'get',
                        status: 200,
                        response: {},
                        enabled: true,
                        delay: 0
                    })}
                >
                    + New Mock
                </button>
              {state.rules.map((rule) => (
                <div
                  key={rule.id}
                  className={`ramk-list-item ${editingRule?.id === rule.id ? 'active' : ''}`}
                  onClick={() => setEditingRule(rule)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>
                        <span className={`ramk-badge method-${rule.method}`}>
                        {rule.method.toUpperCase()}
                        </span>
                        {rule.status}
                    </span>
                    <input 
                        type="checkbox" 
                        checked={rule.enabled} 
                        onClick={(e) => {
                            e.stopPropagation();
                            dispatch({ type: 'TOGGLE_RULE', payload: rule.id });
                        }}
                        readOnly
                    />
                  </div>
                  <div style={{ fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {rule.url}
                  </div>
                </div>
              ))}
            </div>
            <div className="ramk-detail">
              {editingRule ? (
                <div key={editingRule.id}>
                  <h3>Edit Mock Rule</h3>
                  <div>
                    <label>URL Pattern (contains or regex)</label>
                    <input 
                        className="ramk-input"
                        value={editingRule.url} 
                        onChange={(e) => setEditingRule({ ...editingRule, url: e.target.value })} 
                    />
                    <div style={{ display: 'flex', gap: '15px', marginTop: '5px', marginBottom: '10px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', cursor: 'pointer' }}>
                            <input 
                                type="checkbox"
                                checked={editingRule.exactMatch || false}
                                onChange={(e) => setEditingRule({ ...editingRule, exactMatch: e.target.checked })}
                            />
                            Exact Match (Strict)
                        </label>
                    </div>
                  </div>
                  <div>
                    <label>Method</label>
                    <select 
                        className="ramk-input"
                        value={editingRule.method}
                        onChange={(e) => setEditingRule({ ...editingRule, method: e.target.value as any })}
                    >
                        <option value="get">GET</option>
                        <option value="post">POST</option>
                        <option value="put">PUT</option>
                        <option value="delete">DELETE</option>
                        <option value="patch">PATCH</option>
                        <option value="any">ANY</option>
                    </select>
                  </div>
                  <div>
                    <label>Status Code</label>
                    <input 
                        type="number" 
                        className="ramk-input"
                        value={editingRule.status} 
                        onChange={(e) => setEditingRule({ ...editingRule, status: Number(e.target.value) })} 
                    />
                  </div>
                  <div>
                    <label>Delay (ms)</label>
                    <input 
                        type="number" 
                        className="ramk-input"
                        value={editingRule.delay || 0} 
                        onChange={(e) => setEditingRule({ ...editingRule, delay: Number(e.target.value) })} 
                    />
                  </div>
                  <div>
                    <label>Response Body (JSON)</label>
                    <textarea 
                        className="ramk-textarea"
                        defaultValue={JSON.stringify(editingRule.response, null, 2)}
                        onBlur={(e) => {
                             try {
                                const parsed = JSON.parse(e.target.value);
                                setEditingRule({ ...editingRule, response: parsed });
                             } catch (err) {
                                alert('Invalid JSON');
                             }
                        }}
                    />
                  </div>
                  <div style={{ marginTop: '10px' }}>
                    <button className="ramk-btn" onClick={() => handleSaveRule(editingRule)}>Save</button>
                    <button 
                        className="ramk-btn ramk-btn-danger" 
                        onClick={() => {
                            dispatch({ type: 'DELETE_RULE', payload: editingRule.id });
                            setEditingRule(null);
                        }}
                    >
                        Delete
                    </button>
                  </div>
                </div>
              ) : (
                <p>Select a mock rule to edit or create new</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

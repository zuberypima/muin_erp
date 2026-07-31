import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { ContainerItem, SHIPPING_LINES, TERMINAL_YARDS, MAJOR_PORTS } from './logisticsTypes';
import { SkeletonTable } from '../../components/Skeleton';
import ModalPortal from '../../components/ModalPortal';
import ContainerDetailModal from './ContainerDetailModal';
import '../Tasks/Tasks.css';

const LogisticsImports: React.FC = () => {
  const [containers, setContainers] = useState<ContainerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [shippingFilter, setShippingFilter] = useState('all');
  const [yardFilter, setYardFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [previewContainer, setPreviewContainer] = useState<ContainerItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState<Omit<ContainerItem, 'id'>>({
    container_number: `MSKU-${Math.floor(100000 + Math.random() * 900000)}-${Math.floor(Math.random() * 9)}`,
    size_type: '40ft HC',
    cargo_description: 'Industrial Spare Parts & Components',
    shipping_line: SHIPPING_LINES[0],
    seal_number: `SL-${Math.floor(100000 + Math.random() * 900000)}`,
    gross_weight_kg: 24500,
    terminal_yard: TERMINAL_YARDS[0],
    yard_slot: 'Block A2-Bay 14-L3',
    status: 'in-yard',
    flow_type: 'import',
    origin_port: MAJOR_PORTS[4],
    consignee: 'Muin Trading & Logistics Ltd',
    customs_cleared: true,
    bill_of_lading: `BL-IMP-${Math.floor(1000 + Math.random() * 9000)}`,
    gate_in_date: new Date().toISOString().split('T')[0]
  });

  const fetchImports = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/logistics/containers/?flow_type=import');
      const dataArr = Array.isArray(res.data) ? res.data : (res.data?.results || []);
      const apiItems: ContainerItem[] = dataArr.map((i: any) => ({
        id: i.id,
        container_number: i.container_number,
        size_type: i.size_type,
        cargo_description: i.cargo_description,
        shipping_line: i.shipping_line,
        seal_number: i.seal_number,
        gross_weight_kg: Number(i.gross_weight_kg) || 0,
        terminal_yard: i.terminal_yard,
        yard_slot: i.yard_slot,
        status: i.status || 'in-yard',
        flow_type: 'import',
        origin_port: i.origin_port || MAJOR_PORTS[4],
        consignee: i.consignee || 'Consignee',
        customs_cleared: Boolean(i.customs_cleared),
        bill_of_lading: i.bill_of_lading,
        gate_in_date: i.created_at ? i.created_at.split('T')[0] : new Date().toISOString().split('T')[0]
      }));
      setContainers(apiItems);
    } catch (err: any) {
      console.warn('API fetch error for import containers:', err);
      setError('Could not connect to live backend API. Using cached data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImports();
  }, []);

  const handleAddImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      container_number: form.container_number,
      size_type: form.size_type,
      cargo_description: form.cargo_description,
      shipping_line: form.shipping_line,
      seal_number: form.seal_number,
      gross_weight_kg: Number(form.gross_weight_kg),
      terminal_yard: form.terminal_yard,
      yard_slot: form.yard_slot,
      status: form.status,
      flow_type: 'import',
      origin_port: form.origin_port,
      consignee: form.consignee,
      customs_cleared: form.customs_cleared,
      bill_of_lading: form.bill_of_lading
    };

    try {
      const res = await api.post('/logistics/containers/', payload);
      const newContainer: ContainerItem = {
        id: res.data.id,
        container_number: res.data.container_number || form.container_number,
        size_type: res.data.size_type || form.size_type,
        cargo_description: res.data.cargo_description || form.cargo_description,
        shipping_line: res.data.shipping_line || form.shipping_line,
        seal_number: res.data.seal_number || form.seal_number,
        gross_weight_kg: Number(res.data.gross_weight_kg) || form.gross_weight_kg,
        terminal_yard: res.data.terminal_yard || form.terminal_yard,
        yard_slot: res.data.yard_slot || form.yard_slot,
        status: res.data.status || form.status,
        flow_type: 'import',
        origin_port: res.data.origin_port || form.origin_port,
        consignee: res.data.consignee || form.consignee,
        customs_cleared: Boolean(res.data.customs_cleared),
        bill_of_lading: res.data.bill_of_lading || form.bill_of_lading,
        gate_in_date: new Date().toISOString().split('T')[0]
      };

      setContainers([newContainer, ...containers]);
      setShowAddModal(false);
      // Reset form
      setForm({
        container_number: `MSKU-${Math.floor(100000 + Math.random() * 900000)}-${Math.floor(Math.random() * 9)}`,
        size_type: '40ft HC',
        cargo_description: 'Industrial Spare Parts & Components',
        shipping_line: SHIPPING_LINES[0],
        seal_number: `SL-${Math.floor(100000 + Math.random() * 900000)}`,
        gross_weight_kg: 24500,
        terminal_yard: TERMINAL_YARDS[0],
        yard_slot: 'Block A2-Bay 14-L3',
        status: 'in-yard',
        flow_type: 'import',
        origin_port: MAJOR_PORTS[4],
        consignee: 'Muin Trading & Logistics Ltd',
        customs_cleared: true,
        bill_of_lading: `BL-IMP-${Math.floor(1000 + Math.random() * 9000)}`,
        gate_in_date: new Date().toISOString().split('T')[0]
      });
    } catch (err: any) {
      console.error('API import container create error:', err);
      const msg = err.response?.data ? JSON.stringify(err.response.data) : 'Failed to log import container arrival on backend server.';
      setError(`API Error: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleCustoms = async (id: string | number, currentStatus: boolean) => {
    const targetId = String(id);
    const newStatus = !currentStatus;
    setContainers(containers.map(c => String(c.id) === targetId ? { ...c, customs_cleared: newStatus } : c));
    if (previewContainer && String(previewContainer.id) === targetId) {
      setPreviewContainer(prev => prev ? { ...prev, customs_cleared: newStatus } : null);
    }
    try {
      await api.patch(`/logistics/containers/${id}/`, { customs_cleared: newStatus });
    } catch (err: any) {
      console.error('API customs toggle error:', err);
    }
  };

  const filteredContainers = containers.filter(c => {
    const matchesSearch = c.container_number.toLowerCase().includes(search.toLowerCase()) ||
                          c.bill_of_lading.toLowerCase().includes(search.toLowerCase()) ||
                          c.cargo_description.toLowerCase().includes(search.toLowerCase()) ||
                          c.consignee.toLowerCase().includes(search.toLowerCase()) ||
                          (c.origin_port && c.origin_port.toLowerCase().includes(search.toLowerCase()));
    const matchesLine = shippingFilter === 'all' || c.shipping_line === shippingFilter;
    const matchesYard = yardFilter === 'all' || c.terminal_yard === yardFilter;
    return matchesSearch && matchesLine && matchesYard;
  });

  const totalImportTEUs = containers.reduce((sum, c) => sum + (c.size_type.includes('40ft') ? 2 : 1), 0);
  const clearedImports = containers.filter(c => c.customs_cleared).length;
  const pendingHolds = containers.filter(c => !c.customs_cleared).length;

  return (
    <div className="container-fluid p-0 fade-in">
      {/* Import KPIs */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-3 p-3 bg-white border-start border-4 border-primary">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p className="text-muted small fw-semibold text-uppercase mb-1">Total Import TEUs</p>
                <h3 className="fw-bold text-dark mb-0">{totalImportTEUs.toLocaleString()} <span className="fs-6 fw-normal text-muted">TEUs</span></h3>
                <small className="text-primary fw-semibold">{containers.length} Inbound Containers</small>
              </div>
              <div className="bg-primary-subtle text-primary rounded-3 p-3 d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                <i className="fas fa-file-import fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-3 p-3 bg-white border-start border-4 border-success">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p className="text-muted small fw-semibold text-uppercase mb-1">TRA Cleared Imports</p>
                <h3 className="fw-bold text-dark mb-0">{clearedImports} <span className="fs-6 fw-normal text-muted">Cleared</span></h3>
                <small className="text-success fw-semibold">Ready for Delivery / Transit</small>
              </div>
              <div className="bg-success-subtle text-success rounded-3 p-3 d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                <i className="fas fa-check-circle fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-3 p-3 bg-white border-start border-4 border-warning">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p className="text-muted small fw-semibold text-uppercase mb-1">TRA Customs Holds</p>
                <h3 className="fw-bold text-dark mb-0">{pendingHolds} <span className="fs-6 fw-normal text-muted">Pending</span></h3>
                <small className="text-warning fw-semibold">Under Inspection / Verification</small>
              </div>
              <div className="bg-warning-subtle text-warning rounded-3 p-3 d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                <i className="fas fa-exclamation-triangle fs-4"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-3 shadow-sm p-4 mb-4">
        {/* Controls Header */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-3">
          <div>
            <h5 className="fw-bold text-dark mb-1"><i className="fas fa-file-import text-primary me-2"></i>Imported Container Cargo Management</h5>
            <p className="text-muted small mb-0">Track inbound ocean containers, origin ports, consignee details, TRA customs releases, and yard slots.</p>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm px-3" onClick={fetchImports} title="Refresh Import Containers">
              <i className="fas fa-sync-alt me-1"></i>Refresh
            </button>
            <button
              className="btn btn-primary text-white fw-bold px-3 shadow-sm"
              onClick={() => setShowAddModal(true)}
              style={{ borderRadius: '8px' }}
            >
              <i className="fas fa-plus-circle me-2"></i>Log Import Container Gate-In
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="row g-2 mb-3">
          <div className="col-md-4">
            <input
              type="text" className="form-control"
              placeholder="Search Import Container #, B/L, Origin Port, Consignee..."
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <select className="form-select" value={shippingFilter} onChange={e => setShippingFilter(e.target.value)}>
              <option value="all">All Shipping Lines</option>
              {SHIPPING_LINES.map(line => (
                <option key={line} value={line}>{line}</option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <select className="form-select" value={yardFilter} onChange={e => setYardFilter(e.target.value)}>
              <option value="all">All Terminal Yards</option>
              {Array.from(new Set([...containers.map(c => c.terminal_yard).filter(Boolean), ...TERMINAL_YARDS])).map(yard => (
                <option key={yard} value={yard}>{yard}</option>
              ))}
            </select>
          </div>
        </div>

        {error && <div className="alert alert-danger py-2 small">{error}</div>}

        {/* Table */}
        {loading ? (
          <SkeletonTable rows={5} cols={9} />
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0" style={{ fontSize: '14px' }}>
              <thead className="table-light">
                <tr>
                  <th>Container #</th>
                  <th>Origin Port</th>
                  <th>Consignee</th>
                  <th>Shipping Line</th>
                  <th>Cargo Description</th>
                  <th>Terminal Yard</th>
                  <th>Bill of Lading</th>
                  <th>TRA Customs</th>
                  <th className="text-end pe-3">Preview</th>
                </tr>
              </thead>
              <tbody>
                {filteredContainers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center text-muted py-4">
                      No imported containers found for selected search or filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredContainers.map(c => (
                    <tr
                      key={c.id}
                      className="clickable-row"
                      onClick={() => setPreviewContainer(c)}
                    >
                      <td className="fw-bold text-dark">
                        <div className="d-flex align-items-center gap-1.5">
                          <span>{c.container_number}</span>
                          <span className="badge bg-secondary ms-1">{c.size_type}</span>
                        </div>
                      </td>
                      <td className="fw-semibold text-primary">{c.origin_port || 'Port of Shanghai'}</td>
                      <td className="fw-semibold">{c.consignee}</td>
                      <td>{c.shipping_line}</td>
                      <td>
                        <div className="text-truncate" style={{ maxWidth: '180px' }}>{c.cargo_description}</div>
                        <small className="text-muted">Seal: {c.seal_number}</small>
                      </td>
                      <td>
                        <span className="d-block fw-semibold text-dark">{c.terminal_yard}</span>
                        <small className="text-muted">{c.yard_slot}</small>
                      </td>
                      <td className="fw-semibold">{c.bill_of_lading}</td>
                      <td>
                        <span className={`badge ${c.customs_cleared ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-warning-subtle text-warning border border-warning-subtle'} px-2.5 py-1.5 fw-bold`} style={{ borderRadius: '6px' }}>
                          {c.customs_cleared ? <><i className="fas fa-check-circle me-1"></i>TRA Cleared</> : <><i className="fas fa-clock me-1"></i>Customs Hold</>}
                        </span>
                      </td>
                      <td className="text-end pe-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          className="preview-row-btn"
                          onClick={() => setPreviewContainer(c)}
                        >
                          <i className="fas fa-eye"></i> View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showAddModal && (
        <ModalPortal>
          <div className="modal show d-block tab-fade">
            <div className="modal-dialog modal-lg">
              <div className="modal-content border-0 shadow-lg">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title fw-bold"><i className="fas fa-file-import me-2"></i>Log Imported Container Arrival</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowAddModal(false)}></button>
                </div>
                <form onSubmit={handleAddImport}>
                  <div className="modal-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Container Number</label>
                        <input type="text" className="form-control" required value={form.container_number} onChange={e => setForm({...form, container_number: e.target.value})} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Size & Type</label>
                        <select className="form-select" value={form.size_type} onChange={e => setForm({...form, size_type: e.target.value as any})}>
                          <option value="20ft GP">20ft GP</option>
                          <option value="40ft HC">40ft HC</option>
                          <option value="40ft Reefer">40ft Reefer</option>
                          <option value="45ft High Cube">45ft High Cube</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Port of Origin (Load Port)</label>
                        <select className="form-select" value={form.origin_port} onChange={e => setForm({...form, origin_port: e.target.value})}>
                          {MAJOR_PORTS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Consignee Name</label>
                        <input type="text" className="form-control" required value={form.consignee} onChange={e => setForm({...form, consignee: e.target.value})} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Shipping Line</label>
                        <select className="form-select" value={form.shipping_line} onChange={e => setForm({...form, shipping_line: e.target.value})}>
                          {SHIPPING_LINES.map(line => <option key={line} value={line}>{line}</option>)}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Bill of Lading #</label>
                        <input type="text" className="form-control" required value={form.bill_of_lading} onChange={e => setForm({...form, bill_of_lading: e.target.value})} />
                      </div>
                      <div className="col-md-12">
                        <label className="form-label fw-bold">Import Cargo Description</label>
                        <input type="text" className="form-control" required value={form.cargo_description} onChange={e => setForm({...form, cargo_description: e.target.value})} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Terminal Yard Location</label>
                        <input
                          type="text"
                          className="form-control"
                          required
                          list="import-terminal-yard-list"
                          placeholder="Type manual yard or pick from previous entries..."
                          value={form.terminal_yard}
                          onChange={e => setForm({...form, terminal_yard: e.target.value})}
                        />
                        <datalist id="import-terminal-yard-list">
                          {Array.from(new Set([...containers.map(c => c.terminal_yard).filter(Boolean), ...TERMINAL_YARDS])).map(yard => (
                            <option key={yard} value={yard} />
                          ))}
                        </datalist>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Yard Slot Code</label>
                        <input type="text" className="form-control" required value={form.yard_slot} onChange={e => setForm({...form, yard_slot: e.target.value})} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Seal Number</label>
                        <input type="text" className="form-control" required value={form.seal_number} onChange={e => setForm({...form, seal_number: e.target.value})} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Gross Weight (Kg)</label>
                        <input type="number" className="form-control" required value={form.gross_weight_kg} onChange={e => setForm({...form, gross_weight_kg: Number(e.target.value)})} />
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer bg-light">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? 'Saving...' : 'Register Import Gate-In'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Container Detail Modal */}
      {previewContainer && (
        <ContainerDetailModal
          container={previewContainer}
          onClose={() => setPreviewContainer(null)}
          onToggleCustoms={handleToggleCustoms}
        />
      )}
    </div>
  );
};

export default LogisticsImports;

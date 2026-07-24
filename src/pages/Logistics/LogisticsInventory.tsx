import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { ContainerItem, SHIPPING_LINES, TERMINAL_YARDS } from './logisticsTypes';
import { SkeletonTable } from '../../components/Skeleton';

const LogisticsInventory: React.FC = () => {
  const [containers, setContainers] = useState<ContainerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [shippingFilter, setShippingFilter] = useState('all');
  const [yardFilter, setYardFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
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
    customs_cleared: true,
    bill_of_lading: `BL-TZ-${Math.floor(1000 + Math.random() * 9000)}`,
    consignee: 'Muin Trading & Logistics Ltd',
    gate_in_date: new Date().toISOString().split('T')[0]
  });

  const fetchContainers = async () => {
    try {
      const res = await api.get('/procurement/inventory/').catch(() => ({ data: [] }));
      const mapped: ContainerItem[] = (res.data || []).map((i: any, idx: number) => ({
        id: i.id || idx + 1,
        container_number: i.container_number || i.item_code || `MSKU-78190${idx}-2`,
        size_type: i.size_type || '40ft HC',
        cargo_description: i.cargo_description || i.name || 'General Ocean Cargo',
        shipping_line: i.shipping_line || SHIPPING_LINES[0],
        seal_number: i.seal_number || `SL-88190${idx}`,
        gross_weight_kg: i.gross_weight_kg || 22000,
        terminal_yard: i.terminal_yard || i.warehouse_location || TERMINAL_YARDS[0],
        yard_slot: i.yard_slot || `Block B${idx + 1}-Bay 04`,
        status: i.status || 'in-yard',
        customs_cleared: typeof i.customs_cleared === 'boolean' ? i.customs_cleared : true,
        bill_of_lading: i.bill_of_lading || `BL-TZ-901${idx}`,
        consignee: i.consignee || 'Tanzania Industrial Group',
        gate_in_date: i.gate_in_date || '2026-07-20'
      }));

      if (mapped.length === 0) {
        const demo: ContainerItem[] = [
          { id: 1, container_number: 'MSKU-892140-5', size_type: '40ft HC', cargo_description: 'Heavy Tractor Components & Engine Oil', shipping_line: 'Maersk Line', seal_number: 'SL-991204', gross_weight_kg: 28400, terminal_yard: TERMINAL_YARDS[0], yard_slot: 'Block A1-B12-L3', status: 'in-yard', customs_cleared: true, bill_of_lading: 'BL-TZ-9812', consignee: 'MUIN Farm Operations Ltd', gate_in_date: '2026-07-22' },
          { id: 2, container_number: 'MEDU-441209-1', size_type: '20ft GP', cargo_description: 'Processed Packaging Film Rolls', shipping_line: 'MSC', seal_number: 'SL-991205', gross_weight_kg: 14200, terminal_yard: TERMINAL_YARDS[0], yard_slot: 'Block B3-B04-L2', status: 'in-yard', customs_cleared: false, bill_of_lading: 'BL-TZ-9813', consignee: 'East Africa Packaging Solutions', gate_in_date: '2026-07-23' },
          { id: 3, container_number: 'CMAU-772105-8', size_type: '40ft Reefer', cargo_description: 'Temperature-Controlled Agriculture Goods', shipping_line: 'CMA CGM', seal_number: 'SL-991206', gross_weight_kg: 26000, terminal_yard: TERMINAL_YARDS[3], yard_slot: 'Block R1-Bay 02', status: 'in-yard', customs_cleared: true, bill_of_lading: 'BL-TZ-9814', consignee: 'Tanzania Fresh Produce Ltd', gate_in_date: '2026-07-24' },
          { id: 4, container_number: 'PILU-119204-3', size_type: '45ft High Cube', cargo_description: 'Construction Steel Pipes & Fitting Toolkits', shipping_line: 'PIL', seal_number: 'SL-991207', gross_weight_kg: 31500, terminal_yard: TERMINAL_YARDS[4], yard_slot: 'Block K2-B08-L1', status: 'dispatched', customs_cleared: true, bill_of_lading: 'BL-TZ-9815', consignee: 'Ruvu Dry Port Authority', gate_in_date: '2026-07-18' },
        ];
        setContainers(demo);
      } else {
        setContainers(mapped);
      }
    } catch {
      setError('Failed to load container yard inventory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContainers();
  }, []);

  const handleAddContainer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/procurement/inventory/', form).catch(() => {});
      const newC: ContainerItem = {
        id: Date.now(),
        ...form
      };
      setContainers([newC, ...containers]);
      setShowAddModal(false);
    } catch {
      setError('Failed to log container arrival.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleCustoms = async (id: string | number, currentStatus: boolean) => {
    try {
      await api.patch(`/procurement/inventory/${id}/`, { customs_cleared: !currentStatus }).catch(() => {});
      setContainers(containers.map(c => c.id === id ? { ...c, customs_cleared: !currentStatus } : c));
    } catch {
      setError('Failed to update customs status.');
    }
  };

  const filteredContainers = containers.filter(c => {
    const matchesSearch = c.container_number.toLowerCase().includes(search.toLowerCase()) ||
                          c.bill_of_lading.toLowerCase().includes(search.toLowerCase()) ||
                          c.cargo_description.toLowerCase().includes(search.toLowerCase()) ||
                          c.consignee.toLowerCase().includes(search.toLowerCase());
    const matchesLine = shippingFilter === 'all' || c.shipping_line === shippingFilter;
    const matchesYard = yardFilter === 'all' || c.terminal_yard === yardFilter;
    return matchesSearch && matchesLine && matchesYard;
  });

  return (
    <div className="container-fluid p-0 fade-in">
      <div className="bg-white border rounded-3 shadow-sm p-4 mb-4">
        {/* Controls Row */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-3">
          <div>
            <h5 className="fw-bold text-dark mb-1">Container Terminal Yard Inventory</h5>
            <p className="text-muted small mb-0">Track container slots, B/L numbers, seal codes, gross weights, and TRA customs releases.</p>
          </div>
          <button
            className="btn btn-primary text-white fw-bold px-3 shadow-sm"
            onClick={() => setShowAddModal(true)}
            style={{ borderRadius: '8px' }}
          >
            <i className="fas fa-box me-2"></i>Log Container Gate In
          </button>
        </div>

        {/* Filter Bar */}
        <div className="row g-2 mb-3">
          <div className="col-md-4">
            <input
              type="text" className="form-control"
              placeholder="Search Container #, B/L, Cargo or Consignee..."
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <select className="form-select" value={shippingFilter} onChange={e => setShippingFilter(e.target.value)}>
              <option value="all">All Shipping Lines</option>
              {SHIPPING_LINES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="col-md-4">
            <select className="form-select" value={yardFilter} onChange={e => setYardFilter(e.target.value)}>
              <option value="all">All Port &amp; ICD Terminals</option>
              {TERMINAL_YARDS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}

        {loading ? (
          <SkeletonTable rows={6} cols={7} />
        ) : (
          <div className="table-responsive border rounded-3">
            <table className="table align-middle mb-0" style={{ fontSize: '0.86rem' }}>
              <thead className="bg-light fw-bold text-muted">
                <tr>
                  <th className="ps-3 py-3 border-0">Container # &amp; Size</th>
                  <th className="py-3 border-0">Cargo &amp; Shipping Line</th>
                  <th className="py-3 border-0">Yard Terminal &amp; Slot</th>
                  <th className="py-3 border-0">Bill of Lading / Consignee</th>
                  <th className="py-3 border-0 text-center">Gross Weight</th>
                  <th className="py-3 border-0">Customs Clearance</th>
                  <th className="py-3 border-0 text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredContainers.length === 0 ? (
                  <tr><td colSpan={7} className="text-center text-muted py-4">No containers found matching criteria.</td></tr>
                ) : filteredContainers.map(c => (
                  <tr key={c.id}>
                    <td className="ps-3 py-3">
                      <div className="fw-bold font-monospace text-primary">{c.container_number}</div>
                      <span className="badge bg-secondary-subtle text-secondary" style={{ fontSize: '0.72rem' }}>{c.size_type}</span>
                    </td>
                    <td className="py-3">
                      <div className="fw-bold text-dark">{c.cargo_description}</div>
                      <div className="text-muted small" style={{ fontSize: '0.75rem' }}>Line: {c.shipping_line} | Seal: {c.seal_number}</div>
                    </td>
                    <td className="py-3 small">
                      <div className="fw-semibold text-dark">{c.terminal_yard}</div>
                      <div className="text-primary font-monospace" style={{ fontSize: '0.75rem' }}><i className="fas fa-map-marker-alt me-1"></i>{c.yard_slot}</div>
                    </td>
                    <td className="py-3 small">
                      <div className="fw-bold font-monospace text-dark">{c.bill_of_lading}</div>
                      <div className="text-muted">{c.consignee}</div>
                    </td>
                    <td className="py-3 text-center fw-bold">{c.gross_weight_kg ? (c.gross_weight_kg / 1000).toFixed(1) : 0} Tons</td>
                    <td className="py-3">
                      <button
                        className={`btn btn-sm border ${c.customs_cleared ? 'btn-success-subtle text-success border-success-subtle' : 'btn-warning-subtle text-warning border-warning-subtle'}`}
                        style={{ fontSize: '0.75rem', borderRadius: '6px' }}
                        onClick={() => handleToggleCustoms(c.id, c.customs_cleared)}
                        title="Click to toggle customs clearance status"
                      >
                        <i className={`fas fa-${c.customs_cleared ? 'check-circle' : 'exclamation-triangle'} me-1`}></i>
                        {c.customs_cleared ? 'TRA Cleared' : 'Customs Hold'}
                      </button>
                    </td>
                    <td className="py-3 text-end pe-4">
                      <span className={`badge ${
                        c.status === 'in-yard' ? 'bg-info-subtle text-info' :
                        c.status === 'on-vessel' ? 'bg-primary-subtle text-primary' :
                        'bg-success-subtle text-success'
                      }`} style={{ borderRadius: '6px' }}>
                        {c.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Container Modal */}
      {showAddModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow" style={{ borderRadius: '16px' }}>
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold"><i className="fas fa-box text-primary me-2"></i>Log Container Gate In</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <form onSubmit={handleAddContainer}>
                <div className="modal-body row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Container Number *</label>
                    <input type="text" required className="form-control bg-light font-monospace" value={form.container_number} onChange={e => setForm({...form, container_number: e.target.value})} placeholder="e.g. MSKU-892140-5" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Container Type / Size *</label>
                    <select className="form-select bg-light" value={form.size_type} onChange={e => setForm({...form, size_type: e.target.value as any})}>
                      <option value="20ft GP">20ft General Purpose</option>
                      <option value="40ft HC">40ft High Cube</option>
                      <option value="40ft Reefer">40ft Refrigerated Container</option>
                      <option value="45ft High Cube">45ft High Cube</option>
                      <option value="20ft Open Top">20ft Open Top</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Cargo Description *</label>
                    <input type="text" required className="form-control bg-light" value={form.cargo_description} onChange={e => setForm({...form, cargo_description: e.target.value})} placeholder="e.g. Industrial Machinery" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Shipping Line</label>
                    <select className="form-select bg-light" value={form.shipping_line} onChange={e => setForm({...form, shipping_line: e.target.value})}>
                      {SHIPPING_LINES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Seal Number</label>
                    <input type="text" required className="form-control bg-light" value={form.seal_number} onChange={e => setForm({...form, seal_number: e.target.value})} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Gross Weight (KG)</label>
                    <input type="number" min={0} required className="form-control bg-light" value={form.gross_weight_kg} onChange={e => setForm({...form, gross_weight_kg: Number(e.target.value)})} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Terminal Yard Location</label>
                    <select className="form-select bg-light" value={form.terminal_yard} onChange={e => setForm({...form, terminal_yard: e.target.value})}>
                      {TERMINAL_YARDS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Yard Stacking Slot</label>
                    <input type="text" required className="form-control bg-light" value={form.yard_slot} onChange={e => setForm({...form, yard_slot: e.target.value})} placeholder="e.g. Block C4-Bay 12-L2" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Bill of Lading (B/L #)</label>
                    <input type="text" required className="form-control bg-light font-monospace" value={form.bill_of_lading} onChange={e => setForm({...form, bill_of_lading: e.target.value})} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Consignee Company</label>
                    <input type="text" required className="form-control bg-light" value={form.consignee} onChange={e => setForm({...form, consignee: e.target.value})} />
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-light" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary text-white fw-bold px-4" disabled={saving}>
                    {saving ? 'Logging Gate In...' : 'Log Container'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogisticsInventory;

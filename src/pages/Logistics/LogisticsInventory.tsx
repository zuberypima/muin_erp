import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { ContainerItem, SHIPPING_LINES, TERMINAL_YARDS } from './logisticsTypes';
import { SkeletonTable } from '../../components/Skeleton';
import ModalPortal from '../../components/ModalPortal';

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
      const res = await api.get('/logistics/containers/').catch(() => ({ data: [] }));
      const dataArr = Array.isArray(res.data) ? res.data : (res.data?.results || []);
      const mapped: ContainerItem[] = dataArr.map((i: any) => ({
        id: i.id,
        container_number: i.container_number,
        size_type: i.size_type || '40ft HC',
        cargo_description: i.cargo_description || 'General Ocean Cargo',
        shipping_line: i.shipping_line || SHIPPING_LINES[0],
        seal_number: i.seal_number || 'SL-000000',
        gross_weight_kg: Number(i.gross_weight_kg) || 22000,
        terminal_yard: i.terminal_yard || TERMINAL_YARDS[0],
        yard_slot: i.yard_slot || 'Block A1',
        status: i.status || 'in-yard',
        customs_cleared: Boolean(i.customs_cleared),
        bill_of_lading: i.bill_of_lading || 'BL-TZ-0000',
        consignee: i.consignee || 'Consignee',
        gate_in_date: i.created_at ? i.created_at.split('T')[0] : '2026-07-24'
      }));

      if (mapped.length === 0) {
        const demo: ContainerItem[] = [
          { id: 1, container_number: 'MSKU-892140-5', size_type: '40ft HC', cargo_description: 'Heavy Tractor Components & Engine Oil', shipping_line: 'Maersk Line', seal_number: 'SL-991204', gross_weight_kg: 28400, terminal_yard: TERMINAL_YARDS[0], yard_slot: 'Block A1-B12-L3', status: 'in-yard', customs_cleared: true, bill_of_lading: 'BL-TZ-9812', consignee: 'MUIN Farm Operations Ltd', gate_in_date: '2026-07-22' },
          { id: 2, container_number: 'MEDU-441209-1', size_type: '20ft GP', cargo_description: 'Processed Packaging Film Rolls', shipping_line: 'MSC (Mediterranean Shipping Co)', seal_number: 'SL-991205', gross_weight_kg: 14200, terminal_yard: TERMINAL_YARDS[0], yard_slot: 'Block B3-B04-L2', status: 'in-yard', customs_cleared: false, bill_of_lading: 'BL-TZ-9813', consignee: 'East Africa Packaging Solutions', gate_in_date: '2026-07-23' },
          { id: 3, container_number: 'CMAU-772105-8', size_type: '40ft Reefer', cargo_description: 'Temperature-Controlled Agriculture Goods', shipping_line: 'CMA CGM', seal_number: 'SL-991206', gross_weight_kg: 26000, terminal_yard: TERMINAL_YARDS[3], yard_slot: 'Block R1-Bay 02', status: 'in-yard', customs_cleared: true, bill_of_lading: 'BL-TZ-9814', consignee: 'Tanzania Fresh Produce Ltd', gate_in_date: '2026-07-24' },
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
      const res = await api.post('/logistics/containers/', form);
      const newC: ContainerItem = {
        id: res.data.id || Date.now(),
        ...form
      };
      setContainers([newC, ...containers]);
      setShowAddModal(false);
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
        customs_cleared: true,
        bill_of_lading: `BL-TZ-${Math.floor(1000 + Math.random() * 9000)}`,
        consignee: 'Muin Trading & Logistics Ltd',
        gate_in_date: new Date().toISOString().split('T')[0]
      });
    } catch {
      setError('Failed to log container arrival.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleCustoms = async (id: string | number, currentStatus: boolean) => {
    try {
      await api.patch(`/logistics/containers/${id}/`, { customs_cleared: !currentStatus }).catch(() => {});
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
              {SHIPPING_LINES.map(line => (
                <option key={line} value={line}>{line}</option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <select className="form-select" value={yardFilter} onChange={e => setYardFilter(e.target.value)}>
              <option value="all">All Terminal Yards</option>
              {TERMINAL_YARDS.map(yard => (
                <option key={yard} value={yard}>{yard}</option>
              ))}
            </select>
          </div>
        </div>

        {error && <div className="alert alert-danger py-2">{error}</div>}

        {/* Table */}
        {loading ? (
          <SkeletonTable rows={5} cols={8} />
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0" style={{ fontSize: '14px' }}>
              <thead className="table-light">
                <tr>
                  <th>Container #</th>
                  <th>Type & Size</th>
                  <th>Shipping Line</th>
                  <th>Cargo Description</th>
                  <th>Yard Location</th>
                  <th>Bill of Lading</th>
                  <th>Consignee</th>
                  <th>Customs Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredContainers.map(c => (
                  <tr key={c.id}>
                    <td className="fw-bold text-dark">{c.container_number}</td>
                    <td><span className="badge bg-secondary">{c.size_type}</span></td>
                    <td>{c.shipping_line}</td>
                    <td>
                      <div className="text-truncate" style={{ maxWidth: '180px' }}>{c.cargo_description}</div>
                      <small className="text-muted">Seal: {c.seal_number}</small>
                    </td>
                    <td>
                      <span className="d-block fw-semibold text-primary">{c.terminal_yard}</span>
                      <small className="text-muted">{c.yard_slot}</small>
                    </td>
                    <td className="fw-semibold">{c.bill_of_lading}</td>
                    <td>{c.consignee}</td>
                    <td>
                      <button
                        className={`btn btn-sm text-white fw-bold border-0 ${c.customs_cleared ? 'bg-success' : 'bg-warning'}`}
                        onClick={() => handleToggleCustoms(c.id, c.customs_cleared)}
                        style={{ borderRadius: '6px' }}
                      >
                        {c.customs_cleared ? <><i className="fas fa-check-circle me-1"></i>TRA Cleared</> : <><i className="fas fa-clock me-1"></i>Hold / Pending</>}
                      </button>
                    </td>
                  </tr>
                ))}
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
                  <h5 className="modal-title fw-bold">Log Container Gate-In Arrival</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowAddModal(false)}></button>
                </div>
                <form onSubmit={handleAddContainer}>
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
                        <label className="form-label fw-bold">Cargo Description</label>
                        <input type="text" className="form-control" required value={form.cargo_description} onChange={e => setForm({...form, cargo_description: e.target.value})} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Terminal Yard Location</label>
                        <select className="form-select" value={form.terminal_yard} onChange={e => setForm({...form, terminal_yard: e.target.value})}>
                          {TERMINAL_YARDS.map(yard => <option key={yard} value={yard}>{yard}</option>)}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Yard Slot Code</label>
                        <input type="text" className="form-control" required value={form.yard_slot} onChange={e => setForm({...form, yard_slot: e.target.value})} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Consignee</label>
                        <input type="text" className="form-control" required value={form.consignee} onChange={e => setForm({...form, consignee: e.target.value})} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Seal Number</label>
                        <input type="text" className="form-control" required value={form.seal_number} onChange={e => setForm({...form, seal_number: e.target.value})} />
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer bg-light">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? 'Saving...' : 'Register Container Arrival'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
};

export default LogisticsInventory;

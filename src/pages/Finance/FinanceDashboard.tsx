import React from 'react';
import { Link } from 'react-router-dom';
import { demoTransactions, demoBudgets, demoLoans, formatCurrency } from './financeTypes';

const FinanceDashboard: React.FC = () => {
  const totalIncome = demoTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpenses = demoTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const netProfit = totalIncome - totalExpenses;
  const activeLoanBalance = demoLoans.filter(l => l.status === 'active' && l.type === 'received').reduce((s, l) => s + l.remainingAmount, 0);
  const recentTxns = demoTransactions.slice(0, 5);

  return (
    <>
      {/* KPI Row */}
      <div className="row g-4 mb-4">
        <div className="col-sm-6 col-xl-3">
          <div className="kpi-card">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div className="kpi-icon green"><i className="fas fa-arrow-down"></i></div>
              <span className="badge-status completed">+8.2%</span>
            </div>
            <div className="kpi-label">Total Income</div>
            <div className="kpi-value">{formatCurrency(totalIncome)}</div>
            <div className="kpi-change positive"><i className="fas fa-trending-up me-1"></i>vs last month</div>
          </div>
        </div>
        <div className="col-sm-6 col-xl-3">
          <div className="kpi-card">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div className="kpi-icon red"><i className="fas fa-arrow-up"></i></div>
              <span className="badge-status overdue">+3.1%</span>
            </div>
            <div className="kpi-label">Total Expenses</div>
            <div className="kpi-value">{formatCurrency(totalExpenses)}</div>
            <div className="kpi-change negative"><i className="fas fa-trending-up me-1"></i>vs last month</div>
          </div>
        </div>
        <div className="col-sm-6 col-xl-3">
          <div className="kpi-card">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div className="kpi-icon blue"><i className="fas fa-chart-line"></i></div>
              <span className="badge-status active">Net</span>
            </div>
            <div className="kpi-label">Net Profit</div>
            <div className="kpi-value" style={{ color: netProfit >= 0 ? 'var(--primary-green)' : '#ef4444' }}>
              {formatCurrency(netProfit)}
            </div>
            <div className="kpi-change positive">Margin: {((netProfit / totalIncome) * 100).toFixed(1)}%</div>
          </div>
        </div>
        <div className="col-sm-6 col-xl-3">
          <div className="kpi-card">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div className="kpi-icon orange"><i className="fas fa-hand-holding-usd"></i></div>
              <span className="badge-status pending">Active</span>
            </div>
            <div className="kpi-label">Loan Balance</div>
            <div className="kpi-value">{formatCurrency(activeLoanBalance)}</div>
            <div className="kpi-change" style={{ color: '#f97316' }}>Outstanding payable</div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Recent Transactions */}
        <div className="col-lg-8">
          <div className="finance-table-card">
            <div className="d-flex justify-content-between align-items-center px-4 pt-4 pb-3">
              <h6 className="fw-bold text-dark mb-0">Recent Transactions</h6>
              <Link to="/finance/transactions" className="btn-finance-outline btn btn-sm">View All</Link>
            </div>
            <div className="table-responsive">
              <table className="table finance-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Type</th>
                    <th className="text-end">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTxns.map(t => (
                    <tr key={t.id}>
                      <td className="fw-medium">{t.description}</td>
                      <td><span className="text-muted small">{t.category}</span></td>
                      <td className="text-muted small">{new Date(t.date).toLocaleDateString('en-GB')}</td>
                      <td>
                        <span className={`badge-status ${t.type === 'income' ? 'received' : 'overdue'}`}>
                          <i className={`fas fa-arrow-${t.type === 'income' ? 'down' : 'up'} me-1`} style={{ fontSize: '9px' }}></i>
                          {t.type}
                        </span>
                      </td>
                      <td className={`text-end fw-bold ${t.type === 'income' ? 'text-success' : 'text-danger'}`}>
                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Budget Snapshot */}
        <div className="col-lg-4">
          <div className="finance-table-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h6 className="fw-bold text-dark mb-0">Budget Usage</h6>
              <Link to="/finance/budgets" className="btn-finance-outline btn btn-sm">Manage</Link>
            </div>
            <div className="d-flex flex-column gap-4">
              {demoBudgets.map(b => {
                const pct = Math.min((b.spentAmount / b.allocatedAmount) * 100, 100);
                const color = pct > 85 ? '#ef4444' : pct > 65 ? '#f97316' : 'var(--primary-green)';
                return (
                  <div key={b.id}>
                    <div className="d-flex justify-content-between mb-1">
                      <span className="fw-medium small">{b.category}</span>
                      <span className="small text-muted">{pct.toFixed(0)}%</span>
                    </div>
                    <div className="budget-bar-bg">
                      <div className="budget-bar-fill" style={{ width: `${pct}%`, background: color }}></div>
                    </div>
                    <div className="d-flex justify-content-between mt-1">
                      <span className="small text-muted">{formatCurrency(b.spentAmount)}</span>
                      <span className="small text-muted">{formatCurrency(b.allocatedAmount)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FinanceDashboard;

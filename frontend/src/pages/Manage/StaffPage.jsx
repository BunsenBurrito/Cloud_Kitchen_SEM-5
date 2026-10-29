import { Chip } from '@mui/material';
import CrudPage from '../../components/common/CrudPage';
import { money, date, label } from '../../utils/format';

const roles = ['manager', 'chef', 'delivery', 'helper', 'cashier'].map((r) => ({ value: r, label: label(r) }));

export default function StaffPage() {
  return (
    <CrudPage title="Staff" endpoint="/staff" addLabel="Add staff"
      defaults={{ firstName: '', lastName: '', email: '', contactNumber: '', role: 'chef', salary: 0, hiringDate: new Date().toISOString().slice(0, 10), isActive: true }}
      columns={[
        { label: 'Name', render: (r) => `${r.firstName} ${r.lastName || ''}` },
        { label: 'Role', render: (r) => label(r.role) },
        { label: 'Contact', key: 'contactNumber' },
        { label: 'Salary', render: (r) => money(r.salary) },
        { label: 'Hired', render: (r) => date(r.hiringDate) },
        { label: 'Status', render: (r) => <Chip size="small" color={r.isActive ? 'success' : 'default'} label={r.isActive ? 'Active' : 'Inactive'} /> },
      ]}
      fields={[
        { key: 'firstName', label: 'First name', required: true, half: true },
        { key: 'lastName', label: 'Last name', half: true },
        { key: 'contactNumber', label: 'Contact number', required: true, half: true },
        { key: 'email', label: 'Email', type: 'email', half: true },
        { key: 'role', label: 'Role', type: 'select', options: roles, required: true, half: true },
        { key: 'salary', label: 'Monthly salary', type: 'number', half: true },
        { key: 'hiringDate', label: 'Hiring date', type: 'date', half: true },
        { key: 'isActive', label: 'Active', type: 'switch' },
      ]} />
  );
}

import CrudPage from '../../components/common/CrudPage';

const address = (r) => [r.flatNo, r.societyName, r.street, r.city].filter(Boolean).join(', ') || '-';

export default function CustomersPage() {
  return (
    <CrudPage title="Customers" endpoint="/users" query={{ role: 'customer' }} addLabel="Add customer"
      defaults={{ name: '', email: '', phone: '', flatNo: '', societyName: '', street: '', city: '', state: '' }}
      toPayload={(f) => ({ ...f, role: 'customer' })}
      columns={[
        { label: 'Name', key: 'name' },
        { label: 'Phone', key: 'phone' },
        { label: 'Email', key: 'email' },
        { label: 'Address', render: address },
      ]}
      fields={[
        { key: 'name', label: 'Name', required: true },
        { key: 'phone', label: 'Phone', half: true },
        { key: 'email', label: 'Email', type: 'email', required: true, half: true },
        { key: 'flatNo', label: 'Flat / house no.', half: true },
        { key: 'societyName', label: 'Society', half: true },
        { key: 'street', label: 'Street / area' },
        { key: 'city', label: 'City', half: true },
        { key: 'state', label: 'State', half: true },
      ]} />
  );
}

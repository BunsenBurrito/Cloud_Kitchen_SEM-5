import CrudPage from '../../components/common/CrudPage';

export default function SuppliersPage() {
  const ids = (list) => (list || []).map((x) => x.id);
  return (
    <CrudPage title="Suppliers" endpoint="/suppliers" addLabel="Add supplier"
      defaults={{ name: '', contactNumber: '', email: '', address: '', ingredientIds: [], inventoryItemIds: [] }}
      toForm={(r) => ({ ...r, ingredientIds: ids(r.ingredients), inventoryItemIds: ids(r.inventoryItems) })}
      columns={[
        { label: 'Name', key: 'name' },
        { label: 'Contact', key: 'contactNumber' },
        { label: 'Email', key: 'email' },
        { label: 'Supplies', render: (r) => [...r.ingredients, ...r.inventoryItems].map((x) => x.name).join(', ') || '-' },
      ]}
      fields={[
        { key: 'name', label: 'Supplier name', required: true },
        { key: 'contactNumber', label: 'Contact number', required: true, half: true },
        { key: 'email', label: 'Email', type: 'email', half: true },
        { key: 'address', label: 'Address', type: 'multiline' },
        { key: 'ingredientIds', label: 'Ingredients supplied', type: 'multi', source: '/ingredients' },
        { key: 'inventoryItemIds', label: 'Inventory items supplied', type: 'multi', source: '/inventory' },
      ]} />
  );
}

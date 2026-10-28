import React, { useState, useEffect } from "react";
import {
  Utensils,
  ShoppingBag,
  Truck,
  FileText,
  Shield,
  RefreshCw,
  Plus,
  Trash2,
  Check,
  Eye,
  Layers,
  Box,
  Users,
  Search,
  CheckCircle,
  Clock,
  TrendingUp,
  AlertTriangle,
  UserCheck,
  User
} from "lucide-react";

const API_BASE_URL = "http://localhost:5000/api";

const INITIAL_USERS = [
  { user_id: 1, first_name: "Aarav", last_name: "Sharma", email: "aarav@example.com", phone: "9822012345", role: "customer", flat_house_no: "Flat 402", soc_name: "Greenwoods Society", street_area: "Kothrud", city: "Pune", state: "Maharashtra" },
  { user_id: 2, first_name: "Priya", last_name: "Patel", email: "priya@example.com", phone: "9822054321", role: "customer", flat_house_no: "B-12", soc_name: "Marvel Annex", street_area: "Viman Nagar", city: "Pune", state: "Maharashtra" }
];

const INITIAL_MENU = [
  { item_id: 1, name: "Paneer Butter Masala", category: "Main Course", price: 280, description: "Cottage cheese cubes in rich tomato gravy", is_veg: 1, is_available: 1 },
  { item_id: 2, name: "Butter Naan", category: "Breads", price: 40, description: "Traditional Indian flatbread with butter", is_veg: 1, is_available: 1 },
  { item_id: 3, name: "Chicken Biryani", category: "Main Course", price: 320, description: "Aromatic basmati rice layered with spiced chicken", is_veg: 0, is_available: 1 },
  { item_id: 4, name: "Gulab Jamun", category: "Dessert", price: 90, description: "Fried milk-solid balls soaked in rose syrup", is_veg: 1, is_available: 1 },
  { item_id: 5, name: "Veg Spring Roll", category: "Starters", price: 180, description: "Crispy rolls filled with seasoned vegetables", is_veg: 1, is_available: 1 },
  { item_id: 6, name: "Mango Lassi", category: "Beverages", price: 80, description: "Creamy yogurt drink blended with sweet mangoes", is_veg: 1, is_available: 1 },
  { item_id: 7, name: "Garlic Naan", category: "Breads", price: 50, description: "Flatbread topped with minced garlic and butter", is_veg: 1, is_available: 1 }
];

const INITIAL_INGREDIENTS = [
  { ingredient_id: 101, name: "Paneer", category: "Dairy", is_veg: 1 },
  { ingredient_id: 102, name: "Butter", category: "Dairy", is_veg: 1 },
  { ingredient_id: 103, name: "Basmati Rice", category: "Grains", is_veg: 1 },
  { ingredient_id: 104, name: "Chicken", category: "Poultry", is_veg: 0 },
  { ingredient_id: 105, name: "Flour (Maida)", category: "Grains", is_veg: 1 }
];

const INITIAL_INVENTORY = [
  { item_id: 201, name: "Paneer Block 5kg", category: "Raw Dairy", quantity: 12, unit: "kg", threshold: 5 },
  { item_id: 202, name: "Amul Butter 500g", category: "Raw Dairy", quantity: 25, unit: "packs", threshold: 10 },
  { item_id: 203, name: "Rice Bag 25kg", category: "Grains", quantity: 4, unit: "bags", threshold: 2 },
  { item_id: 204, name: "Fresh Chicken 10kg", category: "Meat", quantity: 3, unit: "kg", threshold: 5 },
  { item_id: 205, name: "Takeaway Containers 500ml", category: "Packaging", quantity: 450, unit: "pcs", threshold: 100 }
];

const INITIAL_STAFF = [
  { staff_id: 1, first_name: "Ramesh", last_name: "Pawar", role: "Head Chef", salary: 35000, hire_date: "2023-01-15" },
  { staff_id: 2, first_name: "Suresh", last_name: "Kulkarni", role: "Sous Chef", salary: 25000, hire_date: "2023-03-20" },
  { staff_id: 3, first_name: "Vikram", last_name: "Singh", role: "Delivery Partner", salary: 18000, hire_date: "2023-06-01" },
  { staff_id: 4, first_name: "Anil", last_name: "Deshmukh", role: "Kitchen Assistant", salary: 15000, hire_date: "2023-08-10" }
];

const INITIAL_SUPPLIERS = [
  { supplier_id: 1, name: "FreshDairy Co.", contact_person: "Sunil Joshi", phone: "9822012345", city: "Pune" },
  { supplier_id: 2, name: "Metro Grain Wholesalers", contact_person: "Rajesh Jain", phone: "9822054321", city: "Pune" },
  { supplier_id: 3, name: "Poultry Prime", contact_person: "Mohan Lal", phone: "9822099999", city: "Pune" }
];

const INITIAL_ORDERS = [
  {
    order_id: 1001,
    user_id: 1,
    customer_name: "Aarav Sharma",
    order_status: "PREPARING",
    chef_id: 1,
    chef_name: "Ramesh Pawar",
    delivery_partner: 3,
    delivery_name: "Vikram Singh",
    total_amount: 320,
    created_at: new Date(Date.now() - 25 * 60000).toISOString(),
    items: [
      { item_id: 1, name: "Paneer Butter Masala", quantity: 1, price: 280 },
      { item_id: 2, name: "Butter Naan", quantity: 1, price: 40 }
    ]
  },
  {
    order_id: 1002,
    user_id: 2,
    customer_name: "Priya Patel",
    order_status: "OUT_FOR_DELIVERY",
    chef_id: 2,
    chef_name: "Suresh Kulkarni",
    delivery_partner: 3,
    delivery_name: "Vikram Singh",
    total_amount: 720,
    created_at: new Date(Date.now() - 45 * 60000).toISOString(),
    items: [
      { item_id: 3, name: "Chicken Biryani", quantity: 2, price: 320 },
      { item_id: 6, name: "Mango Lassi", quantity: 1, price: 80 }
    ]
  }
];

const INITIAL_PURCHASES = [
  { purchase_id: 501, supplier_id: 1, supplier_name: "FreshDairy Co.", amount: 4500, status: "COMPLETED", purchase_date: "2024-02-10" },
  { purchase_id: 502, supplier_id: 2, supplier_name: "Metro Grain Wholesalers", amount: 12000, status: "PENDING", purchase_date: "2024-02-14" }
];

export default function App() {
  const [useLiveApi, setUseLiveApi] = useState(false);
  const [activeTab, setActiveTab] = useState("menu");
  const [adminTab, setAdminTab] = useState("overview");

  const [currentUser, setCurrentUser] = useState(INITIAL_USERS[0]);
  const [menu, setMenu] = useState(INITIAL_MENU);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [ingredients, setIngredients] = useState(INITIAL_INGREDIENTS);
  const [inventory, setInventory] = useState(INITIAL_INVENTORY);
  const [staff, setStaff] = useState(INITIAL_STAFF);
  const [suppliers] = useState(INITIAL_SUPPLIERS);
  const [purchases, setPurchases] = useState(INITIAL_PURCHASES);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const [newMenuItem, setNewMenuItem] = useState({ name: "", category: "Main Course", price: "", description: "", is_veg: 1 });
  const [newInventoryItem, setNewInventoryItem] = useState({ name: "", category: "Raw Dairy", quantity: "", unit: "kg", threshold: "5" });
  const [newStaff, setNewStaff] = useState({ first_name: "", last_name: "", role: "Sous Chef", salary: "", hire_date: new Date().toISOString().split("T")[0] });
  const [newPurchase, setNewPurchase] = useState({ supplier_id: 1, amount: "" });

  useEffect(() => {
    if (useLiveApi) {
      fetch(`${API_BASE_URL}/menu`)
        .then((res) => res.json())
        .then((data) => { if (Array.isArray(data)) setMenu(data); })
        .catch(() => console.warn("Live backend unavailable, falling back to local memory data."));
    }
  }, [useLiveApi]);

  const categories = ["All", ...new Set(menu.map((i) => i.category))];

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.item_id === item.item_id);
      if (existing) {
        return prev.map((i) => (i.item_id === item.item_id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateCartQty = (itemId, delta) => {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.item_id === itemId) {
            const newQ = i.quantity + delta;
            return newQ > 0 ? { ...i, quantity: newQ } : null;
          }
          return i;
        })
        .filter(Boolean)
    );
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handlePlaceOrder = () => {
    if (cart.length === 0) return;
    const newOrd = {
      order_id: 1000 + orders.length + 1,
      user_id: currentUser.user_id,
      customer_name: `${currentUser.first_name} ${currentUser.last_name}`,
      order_status: "PLACED",
      chef_id: 1,
      chef_name: "Ramesh Pawar",
      delivery_partner: 3,
      delivery_name: "Vikram Singh",
      total_amount: cartTotal + 40,
      created_at: new Date().toISOString(),
      items: cart.map((c) => ({ item_id: c.item_id, name: c.name, quantity: c.quantity, price: c.price }))
    };

    setOrders([newOrd, ...orders]);
    setCart([]);
    setActiveTab("orders");
  };

  const handleUpdateOrderStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.order_id === orderId ? { ...o, order_status: newStatus } : o))
    );
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    alert("User profile & delivery address saved successfully!");
  };

  const handleAddMenuItem = (e) => {
    e.preventDefault();
    if (!newMenuItem.name || !newMenuItem.price) return;
    const item = {
      item_id: menu.length + 1,
      name: newMenuItem.name,
      category: newMenuItem.category,
      price: parseFloat(newMenuItem.price),
      description: newMenuItem.description,
      is_veg: parseInt(newMenuItem.is_veg),
      is_available: 1
    };
    setMenu([...menu, item]);
    setNewMenuItem({ name: "", category: "Main Course", price: "", description: "", is_veg: 1 });
  };

  const handleAddInventory = (e) => {
    e.preventDefault();
    if (!newInventoryItem.name || !newInventoryItem.quantity) return;
    const item = {
      item_id: 200 + inventory.length + 1,
      name: newInventoryItem.name,
      category: newInventoryItem.category,
      quantity: parseFloat(newInventoryItem.quantity),
      unit: newInventoryItem.unit,
      threshold: parseFloat(newInventoryItem.threshold)
    };
    setInventory([...inventory, item]);
    setNewInventoryItem({ name: "", category: "Raw Dairy", quantity: "", unit: "kg", threshold: "5" });
  };

  const handleAddStaff = (e) => {
    e.preventDefault();
    if (!newStaff.first_name || !newStaff.salary) return;
    const member = {
      staff_id: staff.length + 1,
      first_name: newStaff.first_name,
      last_name: newStaff.last_name,
      role: newStaff.role,
      salary: parseFloat(newStaff.salary),
      hire_date: newStaff.hire_date
    };
    setStaff([...staff, member]);
    setNewStaff({ first_name: "", last_name: "", role: "Sous Chef", salary: "", hire_date: new Date().toISOString().split("T")[0] });
  };

  const handleAddPurchase = (e) => {
    e.preventDefault();
    if (!newPurchase.amount) return;
    const sup = suppliers.find((s) => s.supplier_id === parseInt(newPurchase.supplier_id));
    const pur = {
      purchase_id: 500 + purchases.length + 1,
      supplier_id: parseInt(newPurchase.supplier_id),
      supplier_name: sup ? sup.name : "Supplier",
      amount: parseFloat(newPurchase.amount),
      status: "PENDING",
      purchase_date: new Date().toISOString().split("T")[0]
    };
    setPurchases([pur, ...purchases]);
    setNewPurchase({ supplier_id: 1, amount: "" });
  };

  const filteredMenu = menu.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const styles = {
    app: {
      minHeight: "100vh",
      backgroundColor: "#0f172a",
      color: "#f8fafc",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    },
    header: {
      backgroundColor: "#1e293b",
      borderBottom: "1px solid #334155",
      padding: "1rem 2rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 100
    },
    logo: {
      display: "flex",
      alignItems: "center",
      gap: "0.75rem"
    },
    title: {
      fontSize: "1.25rem",
      fontWeight: 700,
      color: "#f97316",
      margin: 0
    },
    subtitle: {
      fontSize: "0.75rem",
      color: "#94a3b8",
      margin: 0
    },
    navPills: {
      display: "flex",
      gap: "0.5rem",
      backgroundColor: "#0f172a",
      padding: "0.25rem",
      borderRadius: "0.5rem",
      border: "1px solid #334155"
    },
    navBtn: (active) => ({
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      padding: "0.5rem 1rem",
      borderRadius: "0.375rem",
      border: "none",
      backgroundColor: active ? "#f97316" : "transparent",
      color: active ? "#ffffff" : "#94a3b8",
      fontSize: "0.875rem",
      fontWeight: 600,
      cursor: "pointer",
      transition: "all 0.2s"
    }),
    toggleBtn: (isLive) => ({
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      padding: "0.5rem 1rem",
      borderRadius: "0.375rem",
      border: isLive ? "1px solid #22c55e" : "1px solid #64748b",
      backgroundColor: isLive ? "rgba(34, 197, 94, 0.1)" : "transparent",
      color: isLive ? "#4ade80" : "#94a3b8",
      fontSize: "0.75rem",
      fontWeight: 600,
      cursor: "pointer"
    }),
    container: {
      maxWidth: "1280px",
      margin: "0 auto",
      padding: "2rem"
    },
    card: {
      backgroundColor: "#1e293b",
      borderRadius: "0.75rem",
      border: "1px solid #334155",
      padding: "1.5rem",
      marginBottom: "1.5rem"
    },
    cardHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "1.25rem"
    },
    cardTitle: {
      fontSize: "1.125rem",
      fontWeight: 600,
      color: "#f8fafc",
      margin: 0,
      display: "flex",
      alignItems: "center",
      gap: "0.5rem"
    },
    grid: (cols) => ({
      display: "grid",
      gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
      gap: "1.25rem"
    }),
    statCard: {
      backgroundColor: "#1e293b",
      borderRadius: "0.75rem",
      border: "1px solid #334155",
      padding: "1.25rem",
      display: "flex",
      alignItems: "center",
      gap: "1rem"
    },
    statIcon: (bg, col) => ({
      width: "3rem",
      height: "3rem",
      borderRadius: "0.5rem",
      backgroundColor: bg,
      color: col,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }),
    statVal: {
      fontSize: "1.5rem",
      fontWeight: 700,
      color: "#f8fafc",
      margin: 0
    },
    statLabel: {
      fontSize: "0.875rem",
      color: "#94a3b8",
      margin: 0
    },
    badge: (veg) => ({
      padding: "0.125rem 0.5rem",
      borderRadius: "0.25rem",
      fontSize: "0.75rem",
      fontWeight: 600,
      backgroundColor: veg ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.15)",
      color: veg ? "#4ade80" : "#f87171",
      border: `1px solid ${veg ? "#22c55e" : "#ef4444"}`
    }),
    statusBadge: (status) => {
      let bg = "rgba(148, 163, 184, 0.15)";
      let col = "#94a3b8";
      if (status === "PLACED") { bg = "rgba(59, 130, 246, 0.15)"; col = "#60a5fa"; }
      if (status === "PREPARING") { bg = "rgba(234, 179, 8, 0.15)"; col = "#facc15"; }
      if (status === "OUT_FOR_DELIVERY") { bg = "rgba(168, 85, 247, 0.15)"; col = "#c084fc"; }
      if (status === "DELIVERED") { bg = "rgba(34, 197, 94, 0.15)"; col = "#4ade80"; }
      return {
        padding: "0.25rem 0.625rem",
        borderRadius: "0.375rem",
        fontSize: "0.75rem",
        fontWeight: 600,
        backgroundColor: bg,
        color: col,
        textTransform: "uppercase"
      };
    },
    button: (variant = "primary") => ({
      padding: "0.625rem 1.25rem",
      borderRadius: "0.375rem",
      border: "none",
      fontWeight: 600,
      fontSize: "0.875rem",
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      gap: "0.5rem",
      backgroundColor: variant === "primary" ? "#f97316" : variant === "secondary" ? "#334155" : "#22c55e",
      color: "#ffffff"
    }),
    input: {
      width: "100%",
      padding: "0.625rem 0.875rem",
      borderRadius: "0.375rem",
      backgroundColor: "#0f172a",
      border: "1px solid #334155",
      color: "#f8fafc",
      fontSize: "0.875rem",
      outline: "none",
      boxSizing: "border-box"
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      textAlign: "left",
      fontSize: "0.875rem"
    },
    th: {
      borderBottom: "1px solid #334155",
      padding: "0.75rem 1rem",
      color: "#94a3b8",
      fontWeight: 600
    },
    td: {
      borderBottom: "1px solid #334155",
      padding: "0.875rem 1rem",
      color: "#e2e8f0"
    }
  };

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div style={styles.logo}>
          <div style={{ padding: "0.5rem", backgroundColor: "rgba(249, 115, 22, 0.15)", borderRadius: "0.5rem" }}>
            <Utensils color="#f97316" size={24} />
          </div>
          <div>
            <h1 style={styles.title}>Cloud Kitchen Hub</h1>
            <p style={styles.subtitle}>DBMS Production Platform</p>
          </div>
        </div>

        <nav style={styles.navPills}>
          <button style={styles.navBtn(activeTab === "menu")} onClick={() => setActiveTab("menu")}>
            <Utensils size={16} /> Menu
          </button>
          <button style={styles.navBtn(activeTab === "cart")} onClick={() => setActiveTab("cart")}>
            <ShoppingBag size={16} /> Bag ({cart.reduce((a, b) => a + b.quantity, 0)})
          </button>
          <button style={styles.navBtn(activeTab === "orders")} onClick={() => setActiveTab("orders")}>
            <Truck size={16} /> Orders
          </button>
          <button style={styles.navBtn(activeTab === "profile")} onClick={() => setActiveTab("profile")}>
            <User size={16} /> Profile
          </button>
          <button style={styles.navBtn(activeTab === "admin")} onClick={() => setActiveTab("admin")}>
            <Shield size={16} /> Admin Ops
          </button>
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button style={styles.toggleBtn(useLiveApi)} onClick={() => setUseLiveApi(!useLiveApi)}>
            <RefreshCw size={14} /> LIVE API: {useLiveApi ? "ON" : "OFF (MOCK)"}
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ width: "2rem", height: "2rem", borderRadius: "50%", backgroundColor: "#f97316", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
              {currentUser.first_name[0]}
            </div>
          </div>
        </div>
      </header>

      <main style={styles.container}>
        {activeTab === "menu" && (
          <div>
            <div style={styles.card}>
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      style={{
                        padding: "0.5rem 1rem",
                        borderRadius: "0.375rem",
                        border: "1px solid #334155",
                        backgroundColor: selectedCategory === cat ? "#f97316" : "#0f172a",
                        color: selectedCategory === cat ? "#fff" : "#94a3b8",
                        cursor: "pointer",
                        fontWeight: 500,
                        fontSize: "0.875rem"
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <div style={{ position: "relative", minWidth: "250px" }}>
                  <Search size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
                  <input
                    type="text"
                    placeholder="Search menu..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ ...styles.input, paddingLeft: "2.25rem" }}
                  />
                </div>
              </div>
            </div>

            <div style={styles.grid(3)}>
              {filteredMenu.map((item) => (
                <div key={item.item_id} style={{ ...styles.card, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                      <h3 style={{ fontSize: "1.125rem", fontWeight: 600, margin: 0, color: "#f8fafc" }}>{item.name}</h3>
                      <span style={styles.badge(item.is_veg)}>{item.is_veg ? "VEG" : "NON-VEG"}</span>
                    </div>
                    <p style={{ fontSize: "0.875rem", color: "#94a3b8", margin: "0 0 1rem 0" }}>{item.description}</p>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "0.75rem", borderTop: "1px solid #334155" }}>
                    <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "#f97316" }}>₹{item.price}</span>
                    <button style={styles.button("primary")} onClick={() => addToCart(item)}>
                      <Plus size={16} /> Add to Bag
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "cart" && (
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <div style={styles.card}>
              <h2 style={{ ...styles.cardTitle, marginBottom: "1.5rem" }}><ShoppingBag size={20} /> Your Order Bag</h2>
              {cart.length === 0 ? (
                <p style={{ color: "#94a3b8", textAlign: "center", padding: "2rem 0" }}>Your order bag is currently empty.</p>
              ) : (
                <div>
                  {cart.map((item) => (
                    <div key={item.item_id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 0", borderBottom: "1px solid #334155" }}>
                      <div>
                        <h4 style={{ margin: 0, color: "#f8fafc", fontSize: "1rem" }}>{item.name}</h4>
                        <p style={{ margin: "0.25rem 0 0 0", color: "#f97316", fontWeight: 600 }}>₹{item.price} each</p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <button style={{ ...styles.button("secondary"), padding: "0.25rem 0.5rem" }} onClick={() => updateCartQty(item.item_id, -1)}>-</button>
                        <span style={{ fontWeight: 600, minWidth: "1.5rem", textAlign: "center" }}>{item.quantity}</span>
                        <button style={{ ...styles.button("secondary"), padding: "0.25rem 0.5rem" }} onClick={() => updateCartQty(item.item_id, 1)}>+</button>
                        <button style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", marginLeft: "0.5rem" }} onClick={() => updateCartQty(item.item_id, -item.quantity)}>
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}

                  <div style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "2px solid #334155" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#94a3b8", marginBottom: "0.5rem" }}>
                      <span>Subtotal</span>
                      <span>₹{cartTotal}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#94a3b8", marginBottom: "0.5rem" }}>
                      <span>Packaging & Delivery</span>
                      <span>₹40</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#f8fafc", fontSize: "1.25rem", fontWeight: 700, marginTop: "1rem" }}>
                      <span>Total Amount</span>
                      <span style={{ color: "#f97316" }}>₹{cartTotal + 40}</span>
                    </div>

                    <button style={{ ...styles.button("primary"), width: "100%", justifyContent: "center", marginTop: "1.5rem", padding: "0.875rem" }} onClick={handlePlaceOrder}>
                      <CheckCircle size={18} /> Confirm & Place Order
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div>
            <div style={styles.card}>
              <h2 style={{ ...styles.cardTitle, marginBottom: "1.5rem" }}><Truck size={20} /> Real-Time Order Tracker</h2>
              <div style={styles.grid(1)}>
                {orders.map((ord) => (
                  <div key={ord.order_id} style={{ backgroundColor: "#0f172a", borderRadius: "0.5rem", border: "1px solid #334155", padding: "1.25rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                      <div>
                        <span style={{ fontSize: "1.125rem", fontWeight: 700, color: "#f8fafc" }}>Order #{ord.order_id}</span>
                        <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.75rem", color: "#94a3b8" }}>{new Date(ord.created_at).toLocaleString()}</p>
                      </div>
                      <span style={styles.statusBadge(ord.order_status)}>{ord.order_status.replace(/_/g, " ")}</span>
                    </div>

                    <div style={{ margin: "1rem 0", padding: "0.75rem 0", borderTop: "1px solid #334155", borderBottom: "1px solid #334155" }}>
                      {ord.items.map((it, idx) => (
                        <div key={idx} style={{ display: "flex", justifyContent: "space-between", color: "#cbd5e1", fontSize: "0.875rem", marginBottom: "0.25rem" }}>
                          <span>{it.quantity}x {it.name}</span>
                          <span>₹{it.price * it.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontSize: "0.875rem", color: "#94a3b8" }}>
                        Chef: <strong style={{ color: "#e2e8f0" }}>{ord.chef_name}</strong> | Delivery: <strong style={{ color: "#e2e8f0" }}>{ord.delivery_name}</strong>
                      </div>
                      <span style={{ fontSize: "1.125rem", fontWeight: 700, color: "#f97316" }}>Total: ₹{ord.total_amount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "profile" && (
          <div style={{ maxWidth: "700px", margin: "0 auto" }}>
            <div style={styles.card}>
              <h2 style={{ ...styles.cardTitle, marginBottom: "1.5rem" }}><User size={20} /> User Profile & Delivery Address</h2>
              <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={styles.grid(2)}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.875rem", color: "#94a3b8", marginBottom: "0.375rem" }}>First Name</label>
                    <input style={styles.input} value={currentUser.first_name} onChange={(e) => setCurrentUser({ ...currentUser, first_name: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.875rem", color: "#94a3b8", marginBottom: "0.375rem" }}>Last Name</label>
                    <input style={styles.input} value={currentUser.last_name} onChange={(e) => setCurrentUser({ ...currentUser, last_name: e.target.value })} />
                  </div>
                </div>

                <div style={styles.grid(2)}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.875rem", color: "#94a3b8", marginBottom: "0.375rem" }}>Email Address</label>
                    <input style={styles.input} value={currentUser.email} onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.875rem", color: "#94a3b8", marginBottom: "0.375rem" }}>Phone Number</label>
                    <input style={styles.input} value={currentUser.phone || ""} onChange={(e) => setCurrentUser({ ...currentUser, phone: e.target.value })} />
                  </div>
                </div>

                <hr style={{ border: "0", borderTop: "1px solid #334155", margin: "1rem 0" }} />

                <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#f8fafc", margin: 0 }}>Delivery Location & Address Schema</h3>
                
                <div style={styles.grid(2)}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.875rem", color: "#94a3b8", marginBottom: "0.375rem" }}>Flat / House No.</label>
                    <input style={styles.input} value={currentUser.flat_house_no || ""} onChange={(e) => setCurrentUser({ ...currentUser, flat_house_no: e.target.value })} placeholder="e.g. Flat 402" />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.875rem", color: "#94a3b8", marginBottom: "0.375rem" }}>Society / Building Name</label>
                    <input style={styles.input} value={currentUser.soc_name || ""} onChange={(e) => setCurrentUser({ ...currentUser, soc_name: e.target.value })} placeholder="e.g. Greenwoods Society" />
                  </div>
                </div>

                <div style={styles.grid(3)}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.875rem", color: "#94a3b8", marginBottom: "0.375rem" }}>Street / Area</label>
                    <input style={styles.input} value={currentUser.street_area || ""} onChange={(e) => setCurrentUser({ ...currentUser, street_area: e.target.value })} placeholder="e.g. Kothrud" />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.875rem", color: "#94a3b8", marginBottom: "0.375rem" }}>City</label>
                    <input style={styles.input} value={currentUser.city || ""} onChange={(e) => setCurrentUser({ ...currentUser, city: e.target.value })} placeholder="e.g. Pune" />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.875rem", color: "#94a3b8", marginBottom: "0.375rem" }}>State</label>
                    <input style={styles.input} value={currentUser.state || ""} onChange={(e) => setCurrentUser({ ...currentUser, state: e.target.value })} placeholder="e.g. Maharashtra" />
                  </div>
                </div>

                <div style={{ marginTop: "1rem" }}>
                  <button type="submit" style={styles.button("primary")}><CheckCircle size={16} /> Save Profile & Address</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === "admin" && (
          <div>
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", overflowX: "auto" }}>
              {[
                { id: "overview", label: "Overview", icon: TrendingUp },
                { id: "kitchen", label: "Kitchen Orders", icon: Utensils },
                { id: "menu", label: "Menu Builder", icon: Layers },
                { id: "inventory", label: "Inventory", icon: Box },
                { id: "procurement", label: "Procurement", icon: ShoppingBag },
                { id: "staff", label: "Staff & Payroll", icon: Users }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button key={tab.id} style={styles.navBtn(adminTab === tab.id)} onClick={() => setAdminTab(tab.id)}>
                    <Icon size={16} /> {tab.label}
                  </button>
                );
              })}
            </div>

            {adminTab === "overview" && (
              <div>
                <div style={{ ...styles.grid(4), marginBottom: "1.5rem" }}>
                  <div style={styles.statCard}>
                    <div style={styles.statIcon("rgba(249, 115, 22, 0.15)", "#f97316")}><TrendingUp size={24} /></div>
                    <div>
                      <p style={styles.statVal}>₹{orders.reduce((a, b) => a + b.total_amount, 0)}</p>
                      <p style={styles.statLabel}>Total Revenue</p>
                    </div>
                  </div>
                  <div style={styles.statCard}>
                    <div style={styles.statIcon("rgba(59, 130, 246, 0.15)", "#60a5fa")}><Truck size={24} /></div>
                    <div>
                      <p style={styles.statVal}>{orders.filter((o) => o.order_status !== "DELIVERED").length}</p>
                      <p style={styles.statLabel}>Active Orders</p>
                    </div>
                  </div>
                  <div style={styles.statCard}>
                    <div style={styles.statIcon("rgba(34, 197, 94, 0.15)", "#4ade80")}><Utensils size={24} /></div>
                    <div>
                      <p style={styles.statVal}>{menu.length}</p>
                      <p style={styles.statLabel}>Active Menu Items</p>
                    </div>
                  </div>
                  <div style={styles.statCard}>
                    <div style={styles.statIcon("rgba(239, 68, 68, 0.15)", "#f87171")}><AlertTriangle size={24} /></div>
                    <div>
                      <p style={styles.statVal}>{inventory.filter((i) => i.quantity <= i.threshold).length}</p>
                      <p style={styles.statLabel}>Low Stock Items</p>
                    </div>
                  </div>
                </div>

                <div style={styles.card}>
                  <h3 style={styles.cardTitle}><Clock size={18} /> Live Operational Feed</h3>
                  <p style={{ color: "#94a3b8", fontSize: "0.875rem" }}>System is running smoothly. All relational user and address tables synced.</p>
                </div>
              </div>
            )}

            {adminTab === "kitchen" && (
              <div style={styles.card}>
                <h3 style={{ ...styles.cardTitle, marginBottom: "1.5rem" }}><Utensils size={20} /> Kitchen Dispatcher Board</h3>
                <div style={styles.grid(2)}>
                  {orders.map((ord) => (
                    <div key={ord.order_id} style={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "0.5rem", padding: "1rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                        <span style={{ fontWeight: 700 }}>Order #{ord.order_id}</span>
                        <span style={styles.statusBadge(ord.order_status)}>{ord.order_status}</span>
                      </div>
                      <p style={{ fontSize: "0.875rem", color: "#94a3b8", margin: "0 0 1rem 0" }}>Customer: {ord.customer_name}</p>
                      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                        {["PLACED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED"].map((st) => (
                          <button
                            key={st}
                            onClick={() => handleUpdateOrderStatus(ord.order_id, st)}
                            style={{
                              padding: "0.25rem 0.5rem",
                              borderRadius: "0.25rem",
                              border: "1px solid #334155",
                              backgroundColor: ord.order_status === st ? "#f97316" : "transparent",
                              color: ord.order_status === st ? "#fff" : "#94a3b8",
                              fontSize: "0.75rem",
                              cursor: "pointer"
                            }}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {adminTab === "menu" && (
              <div>
                <div style={styles.card}>
                  <h3 style={{ ...styles.cardTitle, marginBottom: "1rem" }}><Plus size={18} /> Add New Menu Item</h3>
                  <form onSubmit={handleAddMenuItem} style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                    <input style={{ ...styles.input, flex: 1 }} placeholder="Item Name" value={newMenuItem.name} onChange={(e) => setNewMenuItem({ ...newMenuItem, name: e.target.value })} />
                    <input style={{ ...styles.input, width: "120px" }} type="number" placeholder="Price (₹)" value={newMenuItem.price} onChange={(e) => setNewMenuItem({ ...newMenuItem, price: e.target.value })} />
                    <select style={{ ...styles.input, width: "150px" }} value={newMenuItem.category} onChange={(e) => setNewMenuItem({ ...newMenuItem, category: e.target.value })}>
                      <option value="Main Course">Main Course</option>
                      <option value="Starters">Starters</option>
                      <option value="Breads">Breads</option>
                      <option value="Dessert">Dessert</option>
                      <option value="Beverages">Beverages</option>
                    </select>
                    <button type="submit" style={styles.button("primary")}><Plus size={16} /> Save Item</button>
                  </form>
                </div>

                <div style={styles.card}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>ID</th>
                        <th style={styles.th}>Name</th>
                        <th style={styles.th}>Category</th>
                        <th style={styles.th}>Price</th>
                        <th style={styles.th}>Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {menu.map((m) => (
                        <tr key={m.item_id}>
                          <td style={styles.td}>#{m.item_id}</td>
                          <td style={{ ...styles.td, fontWeight: 600 }}>{m.name}</td>
                          <td style={styles.td}>{m.category}</td>
                          <td style={{ ...styles.td, color: "#f97316", fontWeight: 700 }}>₹{m.price}</td>
                          <td style={styles.td}><span style={styles.badge(m.is_veg)}>{m.is_veg ? "VEG" : "NON-VEG"}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {adminTab === "inventory" && (
              <div>
                <div style={styles.card}>
                  <h3 style={{ ...styles.cardTitle, marginBottom: "1rem" }}><Plus size={18} /> Add Inventory Item</h3>
                  <form onSubmit={handleAddInventory} style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                    <input style={{ ...styles.input, flex: 1 }} placeholder="Item Name" value={newInventoryItem.name} onChange={(e) => setNewInventoryItem({ ...newInventoryItem, name: e.target.value })} />
                    <input style={{ ...styles.input, width: "120px" }} type="number" placeholder="Quantity" value={newInventoryItem.quantity} onChange={(e) => setNewInventoryItem({ ...newInventoryItem, quantity: e.target.value })} />
                    <input style={{ ...styles.input, width: "100px" }} placeholder="Unit" value={newInventoryItem.unit} onChange={(e) => setNewInventoryItem({ ...newInventoryItem, unit: e.target.value })} />
                    <button type="submit" style={styles.button("primary")}><Plus size={16} /> Add Stock</button>
                  </form>
                </div>

                <div style={styles.card}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>ID</th>
                        <th style={styles.th}>Item Name</th>
                        <th style={styles.th}>Category</th>
                        <th style={styles.th}>Stock Level</th>
                        <th style={styles.th}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventory.map((inv) => (
                        <tr key={inv.item_id}>
                          <td style={styles.td}>#{inv.item_id}</td>
                          <td style={{ ...styles.td, fontWeight: 600 }}>{inv.name}</td>
                          <td style={styles.td}>{inv.category}</td>
                          <td style={styles.td}>{inv.quantity} {inv.unit}</td>
                          <td style={styles.td}>
                            {inv.quantity <= inv.threshold ? (
                              <span style={styles.badge(0)}>LOW STOCK</span>
                            ) : (
                              <span style={styles.badge(1)}>HEALTHY</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {adminTab === "procurement" && (
              <div>
                <div style={styles.card}>
                  <h3 style={{ ...styles.cardTitle, marginBottom: "1rem" }}><Plus size={18} /> Record Purchase Order</h3>
                  <form onSubmit={handleAddPurchase} style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                    <select style={{ ...styles.input, flex: 1 }} value={newPurchase.supplier_id} onChange={(e) => setNewPurchase({ ...newPurchase, supplier_id: e.target.value })}>
                      {suppliers.map((s) => (
                        <option key={s.supplier_id} value={s.supplier_id}>{s.name} ({s.contact_person})</option>
                      ))}
                    </select>
                    <input style={{ ...styles.input, width: "150px" }} type="number" placeholder="Amount (₹)" value={newPurchase.amount} onChange={(e) => setNewPurchase({ ...newPurchase, amount: e.target.value })} />
                    <button type="submit" style={styles.button("primary")}><Plus size={16} /> Create PO</button>
                  </form>
                </div>

                <div style={styles.card}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>PO ID</th>
                        <th style={styles.th}>Supplier</th>
                        <th style={styles.th}>Amount</th>
                        <th style={styles.th}>Date</th>
                        <th style={styles.th}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchases.map((p) => (
                        <tr key={p.purchase_id}>
                          <td style={styles.td}>#{p.purchase_id}</td>
                          <td style={{ ...styles.td, fontWeight: 600 }}>{p.supplier_name}</td>
                          <td style={{ ...styles.td, color: "#f97316", fontWeight: 700 }}>₹{p.amount}</td>
                          <td style={styles.td}>{p.purchase_date}</td>
                          <td style={styles.td}><span style={styles.statusBadge(p.status)}>{p.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {adminTab === "staff" && (
              <div>
                <div style={styles.card}>
                  <h3 style={{ ...styles.cardTitle, marginBottom: "1rem" }}><Plus size={18} /> Add Staff Member</h3>
                  <form onSubmit={handleAddStaff} style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                    <input style={{ ...styles.input, flex: 1 }} placeholder="First Name" value={newStaff.first_name} onChange={(e) => setNewStaff({ ...newStaff, first_name: e.target.value })} />
                    <input style={{ ...styles.input, flex: 1 }} placeholder="Last Name" value={newStaff.last_name} onChange={(e) => setNewStaff({ ...newStaff, last_name: e.target.value })} />
                    <input style={{ ...styles.input, width: "150px" }} type="number" placeholder="Salary (₹)" value={newStaff.salary} onChange={(e) => setNewStaff({ ...newStaff, salary: e.target.value })} />
                    <button type="submit" style={styles.button("primary")}><Plus size={16} /> Add Staff</button>
                  </form>
                </div>

                <div style={styles.card}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>ID</th>
                        <th style={styles.th}>Name</th>
                        <th style={styles.th}>Role</th>
                        <th style={styles.th}>Monthly Salary</th>
                        <th style={styles.th}>Hire Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staff.map((s) => (
                        <tr key={s.staff_id}>
                          <td style={styles.td}>#{s.staff_id}</td>
                          <td style={{ ...styles.td, fontWeight: 600 }}>{s.first_name} {s.last_name}</td>
                          <td style={styles.td}>{s.role}</td>
                          <td style={{ ...styles.td, color: "#4ade80", fontWeight: 700 }}>₹{s.salary}</td>
                          <td style={styles.td}>{s.hire_date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
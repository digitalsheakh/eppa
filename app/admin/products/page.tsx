'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Product } from '@/lib/db';
import { Plus, Pencil, Trash2, Loader2, Package, ShoppingBag, Menu, X, Home, Bold, Italic, List, Link2, Eye, Settings, Tag, Users } from 'lucide-react';
import Link from 'next/link';

const EMPTY: Omit<Product, 'id'> = {
  name: '', category: '', price: 0, unit: 'each',
  description: '', image: '', stock: 100, active: true,
};

function AdminSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const links = [
    { href: '/admin/products',   icon: Package,    label: 'Products' },
    { href: '/admin/orders',     icon: ShoppingBag, label: 'Orders' },
    { href: '/admin/customers',  icon: Users,       label: 'Customers' },
    { href: '/admin/settings',   icon: Settings,    label: 'Settings' },
    { href: '/',                 icon: Home,        label: 'View Store' },
  ];
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={onClose} />}
      <aside className={`fixed top-0 left-0 h-full w-60 bg-gray-900 text-white z-40 flex flex-col transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-5 border-b border-gray-800 flex items-center justify-between">
          <span className="font-bold text-base tracking-tight">
            Takeaway<span className="text-accent-400">Bag</span>
          </span>
          <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-5 pt-5 pb-2">Menu</p>
        <nav className="flex flex-col gap-1 px-3 flex-1">
          {links.map(({ href, icon: Icon, label }) => (
            <Link key={href} href={href} onClick={onClose}
              className="admin-link text-gray-300 hover:text-white hover:bg-white/10">
              <Icon className="w-4 h-4" /> {label}
            </Link>
          ))}
        </nav>
        <div className="p-5 border-t border-gray-800">
          <p className="text-xs text-gray-600">Admin Dashboard</p>
        </div>
      </aside>
    </>
  );
}

function RichTextEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value;
    }
  }, []);

  const exec = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    ref.current?.focus();
    if (ref.current) onChange(ref.current.innerHTML);
  };

  const handleInput = () => {
    if (ref.current) onChange(ref.current.innerHTML);
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) exec('createLink', url);
  };

  return (
    <div className="border border-gray-300 rounded-sm overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-200 px-2 py-1.5 flex items-center gap-1 flex-wrap">
        {[
          { icon: Bold,   cmd: 'bold',   title: 'Bold' },
          { icon: Italic, cmd: 'italic', title: 'Italic' },
        ].map(({ icon: Icon, cmd, title }) => (
          <button key={cmd} type="button" title={title}
            onMouseDown={e => { e.preventDefault(); exec(cmd); }}
            className="p-1.5 rounded hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors">
            <Icon className="w-3.5 h-3.5" />
          </button>
        ))}
        <button type="button" title="Bullet List" onMouseDown={e => { e.preventDefault(); exec('insertUnorderedList'); }}
          className="p-1.5 rounded hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors">
          <List className="w-3.5 h-3.5" />
        </button>
        <button type="button" title="Insert Link" onMouseDown={e => { e.preventDefault(); insertLink(); }}
          className="p-1.5 rounded hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors">
          <Link2 className="w-3.5 h-3.5" />
        </button>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <button type="button" onClick={() => setPreview(p => !p)}
          className={`p-1.5 rounded transition-colors flex items-center gap-1 text-xs font-medium ${preview ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-200 text-gray-600'}`}>
          <Eye className="w-3.5 h-3.5" /> {preview ? 'Edit' : 'Preview'}
        </button>
      </div>
      {preview ? (
        <div className="min-h-[100px] p-3 text-sm text-gray-800 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: value }} />
      ) : (
        <div ref={ref} contentEditable suppressContentEditableWarning onInput={handleInput}
          className="min-h-[100px] p-3 text-sm text-gray-900 focus:outline-none" style={{ lineHeight: '1.6' }} />
      )}
    </div>
  );
}

/* Category management modal */
function CategoryModal({ categories, onSave, onClose }: {
  categories: string[];
  onSave: (list: string[]) => Promise<void>;
  onClose: () => void;
}) {
  const [list, setList] = useState<string[]>(categories);
  const [newCat, setNewCat] = useState('');
  const [saving, setSaving] = useState(false);

  const add = () => {
    const trimmed = newCat.trim();
    if (trimmed && !list.includes(trimmed)) {
      setList(l => [...l, trimmed]);
      setNewCat('');
    }
  };

  const remove = (cat: string) => setList(l => l.filter(c => c !== cat));

  const handleSave = async () => {
    setSaving(true);
    await onSave(list);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
      <div className="bg-white rounded-t-xl sm:rounded-sm shadow-2xl w-full sm:max-w-md">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-primary-600" />
            <h2 className="text-sm font-bold text-gray-900">Manage Categories</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {/* Add new */}
          <div className="flex gap-2">
            <input
              className="input flex-1 text-sm"
              placeholder="New category name..."
              value={newCat}
              onChange={e => setNewCat(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
            />
            <button type="button" onClick={add} className="btn-primary py-2 px-4 text-xs shrink-0">
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>

          {/* List */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {list.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No categories yet.</p>
            ) : list.map(cat => (
              <div key={cat} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-sm px-3 py-2">
                <span className="text-sm text-gray-800 font-medium">{cat}</span>
                <button type="button" onClick={() => remove(cat)}
                  className="text-gray-400 hover:text-red-500 transition-colors p-1">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-outline flex-1 justify-center py-2.5 text-sm">
              Cancel
            </button>
            <button type="button" onClick={handleSave} disabled={saving} className="btn-primary flex-1 justify-center py-2.5 text-sm">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Categories'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const loadCategories = useCallback(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setCategories(data); });
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    fetch('/api/products')
      .then(r => r.json())
      .then(data => { setProducts(Array.isArray(data) ? data : []); setLoading(false); });
  }, []);

  useEffect(() => { load(); loadCategories(); }, [load, loadCategories]);

  const openNew = () => {
    setEditing(null);
    setForm({ ...EMPTY, category: categories[0] ?? '' });
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ name: p.name, category: p.category, price: p.price, unit: p.unit, description: p.description, image: p.image, stock: p.stock, active: p.active });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editing ? `/api/products/${editing.id}` : '/api/products';
      const method = editing ? 'PATCH' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error('Save failed');
      setMsg(editing ? 'Product updated!' : 'Product added!');
      setShowForm(false);
      load();
    } catch { setMsg('Error saving product'); }
    finally { setSaving(false); setTimeout(() => setMsg(''), 3000); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    load();
  };

  const saveCategories = async (list: string[]) => {
    await fetch('/api/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(list) });
    setCategories(list);
    setMsg('Categories saved!');
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 md:ml-60 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 h-14 flex items-center px-4 sm:px-6 gap-3 sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden p-1.5 hover:bg-gray-100 rounded">
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="font-bold text-gray-900">Products</h1>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => setShowCatModal(true)}
              className="btn-outline py-2 px-3 text-xs flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" /> Categories
            </button>
            <button onClick={openNew} className="btn-primary py-2 px-4 text-xs">
              <Plus className="w-3.5 h-3.5" /> Add Product
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          {msg && (
            <div className="mb-4 bg-primary-50 border border-primary-200 text-primary-700 rounded-sm px-4 py-3 text-sm font-medium">
              {msg}
            </div>
          )}

          <div className="mb-4">
            <p className="text-sm text-gray-500">{products.length} products in catalogue</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block bg-white border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {products.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.image || `https://placehold.co/40x40/f3f4f6/9ca3af?text=Bag`}
                              alt=""
                              className="w-10 h-10 object-cover bg-gray-50 border border-gray-100 shrink-0"
                              onError={e => { (e.target as HTMLImageElement).src = `https://placehold.co/40x40/f3f4f6/9ca3af?text=Bag`; }}
                            />
                            <div>
                              <p className="font-medium text-gray-900">{p.name}</p>
                              <p className="text-xs text-gray-400">per {p.unit}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-xs">{p.category}</td>
                        <td className="px-4 py-3 font-bold text-gray-900">£{p.price.toFixed(2)}</td>
                        <td className="px-4 py-3 text-gray-600">{p.stock}</td>
                        <td className="px-4 py-3">
                          <span className={`badge ${p.active ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500'}`}>
                            {p.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button onClick={() => openEdit(p)} className="p-2 hover:bg-primary-50 text-primary-600 transition-colors rounded">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(p.id)} className="p-2 hover:bg-red-50 text-red-400 transition-colors rounded">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {products.length === 0 && (
                  <div className="text-center py-16 text-gray-400">
                    <Package className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                    <p className="text-sm">No products yet. Add your first bag!</p>
                  </div>
                )}
              </div>

              {/* Mobile cards */}
              <div className="sm:hidden space-y-3">
                {products.length === 0 ? (
                  <div className="text-center py-16 text-gray-400 bg-white border border-gray-200">
                    <Package className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                    <p className="text-sm">No products yet.</p>
                  </div>
                ) : products.map(p => (
                  <div key={p.id} className="bg-white border border-gray-200 p-4 flex gap-3">
                    <img
                      src={p.image || `https://placehold.co/48x48/f3f4f6/9ca3af?text=Bag`}
                      alt=""
                      className="w-12 h-12 object-cover bg-gray-50 border border-gray-100 shrink-0"
                      onError={e => { (e.target as HTMLImageElement).src = `https://placehold.co/48x48/f3f4f6/9ca3af?text=Bag`; }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.category}</p>
                      <p className="text-primary-600 font-bold text-sm">£{p.price.toFixed(2)}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`badge text-[10px] ${p.active ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500'}`}>
                          {p.active ? 'Active' : 'Inactive'}
                        </span>
                        <span className="text-xs text-gray-400">Stock: {p.stock}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <button onClick={() => openEdit(p)} className="p-2 hover:bg-primary-50 text-primary-600 rounded"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-2 hover:bg-red-50 text-red-400 rounded"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </main>
      </div>

      {/* Product form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className="bg-white rounded-t-xl sm:rounded-sm shadow-2xl w-full sm:max-w-lg max-h-[92vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-900">{editing ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Product Name *</label>
                <input required className="input" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="e.g. Brown Paper Carrier Bags" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Category
                    <button type="button" onClick={() => setShowCatModal(true)}
                      className="ml-2 text-accent-500 hover:underline font-normal">manage</button>
                  </label>
                  <select className="input" value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))}>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    {!categories.includes(form.category) && form.category && (
                      <option value={form.category}>{form.category}</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Unit *</label>
                  <input required className="input" value={form.unit} onChange={e => setForm(f => ({...f, unit: e.target.value}))} placeholder="pack of 100, each..." />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Price (£) *</label>
                  <input required type="number" step="0.01" min="0" className="input" value={form.price || ''} onChange={e => setForm(f => ({...f, price: parseFloat(e.target.value) || 0}))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Stock *</label>
                  <input required type="number" min="0" className="input" value={form.stock || ''} onChange={e => setForm(f => ({...f, stock: parseInt(e.target.value) || 0}))} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Image URL</label>
                <div className="flex gap-2">
                  <input type="url" className="input" value={form.image} onChange={e => setForm(f => ({...f, image: e.target.value}))} placeholder="https://example.com/image.jpg" />
                  {form.image && (
                    <img src={form.image} alt="preview" className="w-12 h-12 object-cover border border-gray-200 shrink-0"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Description <span className="text-gray-400 font-normal">(supports HTML formatting)</span></label>
                <RichTextEditor value={form.description} onChange={html => setForm(f => ({...f, description: html}))} />
              </div>

              <div className="flex items-center gap-3">
                <input type="checkbox" id="active" checked={form.active} onChange={e => setForm(f => ({...f, active: e.target.checked}))} className="w-4 h-4 accent-primary-600" />
                <label htmlFor="active" className="text-sm text-gray-700">Active (visible in store)</label>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline flex-1 justify-center py-2.5 text-sm">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center py-2.5 text-sm">
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : (editing ? 'Update Product' : 'Add Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category management modal */}
      {showCatModal && (
        <CategoryModal
          categories={categories}
          onSave={saveCategories}
          onClose={() => setShowCatModal(false)}
        />
      )}
    </div>
  );
}

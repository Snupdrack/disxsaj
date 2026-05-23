'use client'

import { useEffect, useState, useCallback, useRef } from 'react'

/* ─── Types ─── */
interface MenuConfig {
  id: string
  logoImg: string
  diablitoImg: string
  gloriasImg: string
  botanasImg: string
  precioClasico: number
  precioGlorias: number
  precioDiablito: number
  precioBotana: number
  precioExtra: number
  diablitoDesc: string
  gloriasDesc: string
  updatedAt: string
}

interface Sabor {
  id: string
  nombre: string
  emoji: string
  color: string
  bg: string
  desc: string
  img: string
  orden: number
}

interface ExtraItem {
  id: string
  nombre: string
  orden: number
}

interface MenuData {
  config: MenuConfig
  sabores: Sabor[]
  extrasClasico: ExtraItem[]
  extrasDiablito: ExtraItem[]
  extrasGloria: ExtraItem[]
  basesDiablito: ExtraItem[]
  botanas: ExtraItem[]
}

interface OrderItem {
  type: 'diablito' | 'glorias' | 'clasico' | 'botana'
  name: string
  price: number
  qty: number
  extras: string[]
  base?: string
  saborId?: string
}

const CHK_SVG = (
  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const WA_SVG = (
  <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

const MAPS_SVG = (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
)

const WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER || '5219512645961'

export default function Home() {
  /* ─── State ─── */
  const [menuData, setMenuData] = useState<MenuData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminToken, setAdminToken] = useState('')
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState(false)
  const [adminTab, setAdminTab] = useState(0)

  // Diablito state
  const [diablitoQty, setDiablitoQty] = useState(0)
  const [diablitoBase, setDiablitoBase] = useState('')
  const [diablitoExtras, setDiablitoExtras] = useState<string[]>([])

  // Glorias state
  const [gloriasQty, setGloriasQty] = useState(0)
  const [gloriasExtras, setGloriasExtras] = useState<string[]>([])

  // Sabores state
  const [saborQty, setSaborQty] = useState<Record<string, number>>({})
  const [clasicoExtras, setClasicoExtras] = useState<string[]>([])

  // Botanas state
  const [selectedBotanas, setSelectedBotanas] = useState<string[]>([])

  // Delivery state
  const [tipoEntrega, setTipoEntrega] = useState<'recoger' | 'domicilio'>('recoger')
  const [direccion, setDireccion] = useState('')
  const [referencias, setReferencias] = useState('')

  // Change state
  const [pagoCon, setPagoCon] = useState('')

  // Order
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])

  // Admin edit state
  const [editPrices, setEditPrices] = useState({
    precioClasico: 25,
    precioGlorias: 27,
    precioDiablito: 27,
    precioBotana: 12,
    precioExtra: 2,
  })
  const [editDiablitoDesc, setEditDiablitoDesc] = useState('')
  const [editGloriasDesc, setEditGloriasDesc] = useState('')
  const [newExtraNombre, setNewExtraNombre] = useState<Record<string, string>>({})
  const [newSaborNombre, setNewSaborNombre] = useState('')
  const [saving, setSaving] = useState(false)

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  /* ─── Fetch menu data ─── */
  const fetchMenu = useCallback(async () => {
    try {
      const res = await fetch('/api/menu')
      const data = await res.json()
      setMenuData(data)
      if (data.config) {
        setEditPrices({
          precioClasico: data.config.precioClasico,
          precioGlorias: data.config.precioGlorias,
          precioDiablito: data.config.precioDiablito,
          precioBotana: data.config.precioBotana,
          precioExtra: data.config.precioExtra,
        })
        setEditDiablitoDesc(data.config.diablitoDesc)
        setEditGloriasDesc(data.config.gloriasDesc)
      }
    } catch (err) {
      console.error('Error fetching menu:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMenu()
    // Check admin session
    const token = localStorage.getItem('didxsaj_admin_token')
    if (token) {
      setIsAdmin(true)
      setAdminToken(token)
    }
  }, [fetchMenu])

  /* ─── Admin auth header ─── */
  const authHeader = useCallback(() => ({
    Authorization: `Bearer ${adminToken}`,
  }), [adminToken])

  /* ─── Admin login ─── */
  const handleLogin = async () => {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: loginPassword }),
      })
      const data = await res.json()
      if (data.success) {
        setIsAdmin(true)
        setAdminToken(data.token)
        localStorage.setItem('didxsaj_admin_token', data.token)
        setShowLoginModal(false)
        setLoginError(false)
        setLoginPassword('')
      } else {
        setLoginError(true)
      }
    } catch {
      setLoginError(true)
    }
  }

  const handleLogout = () => {
    setIsAdmin(false)
    setAdminToken('')
    localStorage.removeItem('didxsaj_admin_token')
  }

  /* ─── Admin save prices ─── */
  const handleSavePrices = async () => {
    setSaving(true)
    try {
      await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({
          ...editPrices,
          diablitoDesc: editDiablitoDesc,
          gloriasDesc: editGloriasDesc,
        }),
      })
      await fetchMenu()
    } catch (err) {
      console.error('Error saving prices:', err)
    }
    setSaving(false)
  }

  /* ─── Admin sabor actions ─── */
  const handleAddSabor = async () => {
    if (!newSaborNombre.trim()) return
    setSaving(true)
    try {
      await fetch('/api/admin/sabor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ action: 'create', nombre: newSaborNombre.trim(), emoji: '🍧', color: '#e74c3c' }),
      })
      setNewSaborNombre('')
      await fetchMenu()
    } catch (err) {
      console.error('Error adding sabor:', err)
    }
    setSaving(false)
  }

  const handleUpdateSabor = async (id: string, field: string, value: string) => {
    try {
      await fetch('/api/admin/sabor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ action: 'update', id, [field]: value }),
      })
      await fetchMenu()
    } catch (err) {
      console.error('Error updating sabor:', err)
    }
  }

  const handleDeleteSabor = async (id: string) => {
    setSaving(true)
    try {
      await fetch('/api/admin/sabor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ action: 'delete', id }),
      })
      await fetchMenu()
    } catch (err) {
      console.error('Error deleting sabor:', err)
    }
    setSaving(false)
  }

  /* ─── Admin extra actions ─── */
  const handleAddExtra = async (section: string) => {
    const nombre = newExtraNombre[section]?.trim()
    if (!nombre) return
    setSaving(true)
    try {
      await fetch('/api/admin/extra', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ section, action: 'create', nombre }),
      })
      setNewExtraNombre(prev => ({ ...prev, [section]: '' }))
      await fetchMenu()
    } catch (err) {
      console.error('Error adding extra:', err)
    }
    setSaving(false)
  }

  const handleDeleteExtra = async (section: string, id: string) => {
    setSaving(true)
    try {
      await fetch('/api/admin/extra', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ section, action: 'delete', id }),
      })
      await fetchMenu()
    } catch (err) {
      console.error('Error deleting extra:', err)
    }
    setSaving(false)
  }

  /* ─── Admin base actions ─── */
  const handleAddBase = async () => {
    const nombre = newExtraNombre['base']?.trim()
    if (!nombre) return
    setSaving(true)
    try {
      await fetch('/api/admin/base', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ action: 'create', nombre }),
      })
      setNewExtraNombre(prev => ({ ...prev, base: '' }))
      await fetchMenu()
    } catch (err) {
      console.error('Error adding base:', err)
    }
    setSaving(false)
  }

  const handleDeleteBase = async (id: string) => {
    setSaving(true)
    try {
      await fetch('/api/admin/base', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ action: 'delete', id }),
      })
      await fetchMenu()
    } catch (err) {
      console.error('Error deleting base:', err)
    }
    setSaving(false)
  }

  /* ─── Admin botana actions ─── */
  const handleAddBotana = async () => {
    const nombre = newExtraNombre['botana']?.trim()
    if (!nombre) return
    setSaving(true)
    try {
      await fetch('/api/admin/botana', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ action: 'create', nombre }),
      })
      setNewExtraNombre(prev => ({ ...prev, botana: '' }))
      await fetchMenu()
    } catch (err) {
      console.error('Error adding botana:', err)
    }
    setSaving(false)
  }

  const handleDeleteBotana = async (id: string) => {
    setSaving(true)
    try {
      await fetch('/api/admin/botana', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ action: 'delete', id }),
      })
      await fetchMenu()
    } catch (err) {
      console.error('Error deleting botana:', err)
    }
    setSaving(false)
  }

  /* ─── Image upload ─── */
  const handleImageUpload = async (key: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('key', key)
    try {
      await fetch('/api/admin/upload', {
        method: 'POST',
        headers: authHeader(),
        body: formData,
      })
      await fetchMenu()
    } catch (err) {
      console.error('Error uploading image:', err)
    }
  }

  /* ─── Toggle helpers ─── */
  const toggleExtra = (list: string[], setList: (v: string[]) => void, name: string) => {
    if (list.includes(name)) {
      setList(list.filter(e => e !== name))
    } else {
      setList([...list, name])
    }
  }

  const toggleBotana = (name: string) => {
    if (selectedBotanas.includes(name)) {
      setSelectedBotanas(selectedBotanas.filter(b => b !== name))
    } else {
      setSelectedBotanas([...selectedBotanas, name])
    }
  }

  /* ─── Add to order ─── */
  const addToOrder = (type: OrderItem['type'], name: string, price: number, qty: number, extras: string[], base?: string, saborId?: string) => {
    if (qty <= 0) return
    setOrderItems(prev => [...prev, { type, name, price, qty, extras: [...extras], base, saborId }])
  }

  const removeFromOrder = (index: number) => {
    setOrderItems(prev => prev.filter((_, i) => i !== index))
  }

  /* ─── Calculate total ─── */
  const calculateTotal = () => {
    return orderItems.reduce((total, item) => {
      const itemTotal = item.price * item.qty + item.extras.length * (menuData?.config.precioExtra || 2) * item.qty
      return total + itemTotal
    }, 0)
  }

  /* ─── WhatsApp message ─── */
  const buildWhatsAppMessage = () => {
    let msg = '🍧 *Pedido Raspados Didxsaj*\n\n'

    orderItems.forEach((item, i) => {
      msg += `${i + 1}. ${item.name} x${item.qty} - $${(item.price * item.qty + item.extras.length * (menuData?.config.precioExtra || 2) * item.qty)}\n`
      if (item.base) msg += `   Base: ${item.base}\n`
      if (item.extras.length > 0) msg += `   Extras: ${item.extras.join(', ')}\n`
    })

    msg += `\n💵 *Total: $${calculateTotal()}*`

    if (tipoEntrega === 'domicilio') {
      msg += `\n\n🛵 *Entrega a domicilio*`
      msg += `\n📍 Dirección: ${direccion}`
      if (referencias) msg += `\n🔍 Referencias: ${referencias}`
    } else {
      msg += `\n\n🏪 *Pasar a recoger*`
    }

    if (pagoCon) {
      msg += `\n💵 Pago con: ${pagoCon}`
    }

    return encodeURIComponent(msg)
  }

  const sendWhatsApp = () => {
    if (orderItems.length === 0) return
    const msg = buildWhatsAppMessage()
    window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, '_blank')
  }

  /* ─── Loading ─── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--gris-fondo)' }}>
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">🍧</div>
          <p style={{ fontFamily: 'var(--font-fredoka)', color: 'var(--rojo)', fontSize: '20px' }}>Cargando menú...</p>
        </div>
      </div>
    )
  }

  if (!menuData || !menuData.config) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--gris-fondo)' }}>
        <p style={{ fontFamily: 'var(--font-fredoka)', color: 'var(--rojo)' }}>Error al cargar el menú</p>
      </div>
    )
  }

  const C = menuData.config

  return (
    <div className="min-h-screen flex flex-col" style={{ maxWidth: '480px', margin: '0 auto', backgroundColor: 'var(--gris-fondo)' }}>

      {/* ═══ HEADER ═══ */}
      <header className="relative w-full overflow-hidden" style={{ background: 'linear-gradient(135deg, #d63031 0%, #e74c3c 40%, #ffa502 100%)' }}>
        <div className="absolute rounded-full" style={{ top: '-60px', left: '-40px', width: '200px', height: '200px', background: 'rgba(255,255,255,0.12)', filter: 'blur(60px)' }} />
        <div className="absolute rounded-full" style={{ bottom: '-50px', right: '-40px', width: '180px', height: '180px', background: 'rgba(241,196,15,0.2)', filter: 'blur(60px)' }} />
        <div className="absolute rounded-full" style={{ top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '260px', height: '260px', background: 'rgba(255,255,255,0.06)', filter: 'blur(60px)' }} />

        <div className="relative z-10 flex flex-col items-center justify-center" style={{ padding: '40px 20px 32px', gap: '16px' }}>
          <div className="rounded-full overflow-hidden relative" style={{ width: '180px', height: '180px', border: '5px solid rgba(255,255,255,0.9)', background: 'white', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            {C.logoImg ? (
              <img src={C.logoImg} alt="Raspados Didxsaj" className="w-full h-full object-cover block"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; ((e.target as HTMLImageElement).nextElementSibling as HTMLDivElement).style.display = 'flex'; }} />
            ) : null}
            <div className="flex flex-col items-center justify-center w-full h-full" style={{ fontFamily: 'var(--font-fredoka)', textAlign: 'center', display: C.logoImg ? 'none' : 'flex' }}>
              <div style={{ fontSize: '44px' }}>🧊</div>
              <div style={{ fontSize: '12px', color: 'var(--rojo)', lineHeight: 1.25, marginTop: '4px' }}>RASPADOS<br/>DIDXSAJ</div>
            </div>
          </div>
          <h1 style={{ fontFamily: 'var(--font-fredoka)', fontSize: '32px', color: 'white', textAlign: 'center', textShadow: '0 2px 8px rgba(0,0,0,0.2)', lineHeight: 1.1 }}>
            Raspados Didxsaj
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)', textAlign: 'center', maxWidth: '280px', lineHeight: 1.4 }}>
            Raspados artesanales con los sabores más frescos de San Pablo Villa de Mitla, Oaxaca
          </p>
          <div className="flex items-center" style={{ marginTop: '4px', padding: '10px 22px', borderRadius: 'var(--radius-pill)', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.35)', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', gap: '8px', animation: 'pulse 2.5s ease-in-out infinite' }}>
            <span style={{ fontFamily: 'var(--font-fredoka)', fontWeight: 700, fontSize: '13px', color: 'white' }}>🛵</span>
            <span style={{ fontFamily: 'var(--font-fredoka)', fontWeight: 700, fontSize: '13px', color: 'white' }}>¡Servicio a domicilio disponible!</span>
            <span style={{ fontFamily: 'var(--font-fredoka)', fontWeight: 700, fontSize: '13px', color: 'white' }}>🛵</span>
          </div>
        </div>
      </header>

      {/* ═══ MAIN ═══ */}
      <main className="flex-1 w-full" style={{ maxWidth: '480px', margin: '0 auto', padding: '24px 16px' }}>

        {/* ═══ ADMIN PANEL ═══ */}
        {isAdmin && (
          <section style={{ marginBottom: '24px' }}>
            <div style={{ background: 'var(--rojo-light)', border: '2px solid var(--rojo)', borderRadius: 'var(--radius-card)', padding: '18px' }}>
              <h3 style={{ fontFamily: 'var(--font-fredoka)', fontSize: '17px', color: 'var(--rojo)', marginBottom: '12px' }}>⚙️ Modo Administrador</h3>

              {/* Admin Tabs */}
              <div className="flex" style={{ gap: '4px', marginBottom: '14px' }}>
                {['💰 Precios', '🍧 Sabores', '🖼️ Imágenes', '➕ Extras'].map((tab, i) => (
                  <button key={i}
                    className="flex-1 text-center cursor-pointer"
                    style={{
                      padding: '8px 4px',
                      border: '1.5px solid var(--rojo)',
                      borderRadius: '8px',
                      background: adminTab === i ? 'var(--rojo)' : 'white',
                      color: adminTab === i ? 'white' : 'var(--rojo)',
                      fontFamily: 'var(--font-poppins)',
                      fontSize: '11px',
                      fontWeight: 700,
                      transition: '0.18s',
                    }}
                    onClick={() => setAdminTab(i)}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab 0: Precios */}
              {adminTab === 0 && (
                <div>
                  {[
                    { label: 'Clásico', key: 'precioClasico' as const },
                    { label: 'Glorias', key: 'precioGlorias' as const },
                    { label: 'Diablito', key: 'precioDiablito' as const },
                    { label: 'Botana', key: 'precioBotana' as const },
                    { label: 'Extra', key: 'precioExtra' as const },
                  ].map(p => (
                    <div key={p.key} className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
                      <label style={{ fontFamily: 'var(--font-poppins)', fontSize: '13px', fontWeight: 700, color: 'var(--texto)' }}>${p.label}</label>
                      <input type="number" value={editPrices[p.key]}
                        onChange={e => setEditPrices(prev => ({ ...prev, [p.key]: parseInt(e.target.value) || 0 }))}
                        style={{ width: '80px', padding: '7px 10px', border: '1.5px solid var(--rojo)', borderRadius: '8px', fontFamily: 'var(--font-poppins)', fontSize: '14px', fontWeight: 700, color: 'var(--rojo)', textAlign: 'center', background: 'white' }} />
                    </div>
                  ))}
                  <div style={{ marginTop: '12px' }}>
                    <label style={{ fontFamily: 'var(--font-poppins)', fontSize: '13px', fontWeight: 700, color: 'var(--texto)', display: 'block', marginBottom: '5px' }}>Descripción Diablito</label>
                    <textarea value={editDiablitoDesc} onChange={e => setEditDiablitoDesc(e.target.value)} rows={2}
                      style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #ddd', borderRadius: '8px', fontFamily: 'var(--font-inter)', fontSize: '13px', color: 'var(--texto)', resize: 'none' }} />
                  </div>
                  <div style={{ marginTop: '8px' }}>
                    <label style={{ fontFamily: 'var(--font-poppins)', fontSize: '13px', fontWeight: 700, color: 'var(--texto)', display: 'block', marginBottom: '5px' }}>Descripción Glorias</label>
                    <textarea value={editGloriasDesc} onChange={e => setEditGloriasDesc(e.target.value)} rows={2}
                      style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #ddd', borderRadius: '8px', fontFamily: 'var(--font-inter)', fontSize: '13px', color: 'var(--texto)', resize: 'none' }} />
                  </div>
                  <button onClick={handleSavePrices} disabled={saving}
                    style={{ width: '100%', padding: '12px', border: 'none', borderRadius: 'var(--radius-card-sm)', background: 'var(--rojo)', color: 'white', fontFamily: 'var(--font-fredoka)', fontSize: '14px', cursor: saving ? 'wait' : 'pointer', marginTop: '6px', transition: '0.18s', opacity: saving ? 0.7 : 1 }}>
                    {saving ? 'Guardando...' : '💾 Guardar Precios'}
                  </button>
                  <button onClick={handleLogout}
                    style={{ width: '100%', padding: '10px', border: '1.5px solid var(--rojo)', borderRadius: 'var(--radius-card-sm)', background: 'white', color: 'var(--rojo)', fontFamily: 'var(--font-poppins)', fontWeight: 700, fontSize: '13px', cursor: 'pointer', marginTop: '8px', transition: '0.18s' }}>
                    Cerrar Sesión
                  </button>
                </div>
              )}

              {/* Tab 1: Sabores */}
              {adminTab === 1 && (
                <div>
                  {menuData.sabores.map(s => (
                    <div key={s.id} style={{ background: 'white', borderRadius: '10px', padding: '10px 12px', marginBottom: '8px', border: '1.5px solid #e8e8e8' }}>
                      <div className="flex items-center" style={{ gap: '6px', marginBottom: '6px' }}>
                        <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--texto-muted)', minWidth: '55px' }}>Nombre</label>
                        <input value={s.nombre} onChange={e => handleUpdateSabor(s.id, 'nombre', e.target.value)}
                          style={{ flex: 1, padding: '6px 8px', border: '1.5px solid #ddd', borderRadius: '6px', fontFamily: 'var(--font-inter)', fontSize: '13px', color: 'var(--texto)' }} />
                      </div>
                      <div className="flex items-center" style={{ gap: '6px', marginBottom: '6px' }}>
                        <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--texto-muted)', minWidth: '55px' }}>Emoji</label>
                        <input value={s.emoji} onChange={e => handleUpdateSabor(s.id, 'emoji', e.target.value)}
                          style={{ width: '40px', padding: '6px 8px', border: '1.5px solid #ddd', borderRadius: '6px', fontFamily: 'var(--font-inter)', fontSize: '13px', color: 'var(--texto)', textAlign: 'center' }} />
                        <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--texto-muted)', marginLeft: '8px' }}>Color</label>
                        <input type="color" value={s.color} onChange={e => handleUpdateSabor(s.id, 'color', e.target.value)}
                          style={{ width: '36px', height: '30px', padding: '2px', cursor: 'pointer', border: '1.5px solid #ddd', borderRadius: '6px' }} />
                      </div>
                      <div className="flex items-center" style={{ gap: '6px' }}>
                        <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--texto-muted)', minWidth: '55px' }}>Desc</label>
                        <input value={s.desc} onChange={e => handleUpdateSabor(s.id, 'desc', e.target.value)}
                          style={{ flex: 1, padding: '6px 8px', border: '1.5px solid #ddd', borderRadius: '6px', fontFamily: 'var(--font-inter)', fontSize: '13px', color: 'var(--texto)' }} />
                        <button onClick={() => handleDeleteSabor(s.id)}
                          style={{ padding: '4px 10px', border: 'none', borderRadius: '6px', background: '#ff6b6b', color: 'white', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-poppins)' }}>
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center" style={{ gap: '6px', marginTop: '4px' }}>
                    <input value={newSaborNombre} onChange={e => setNewSaborNombre(e.target.value)} placeholder="Nuevo sabor..."
                      onKeyDown={e => e.key === 'Enter' && handleAddSabor()}
                      style={{ flex: 1, padding: '10px', border: '2px dashed var(--rojo)', borderRadius: '10px', fontFamily: 'var(--font-poppins)', fontSize: '13px', fontWeight: 700, color: 'var(--rojo)', textAlign: 'center', background: 'transparent' }} />
                    <button onClick={handleAddSabor} style={{ padding: '10px 14px', border: 'none', borderRadius: '10px', background: 'var(--rojo)', color: 'white', fontFamily: 'var(--font-fredoka)', fontSize: '13px', cursor: 'pointer' }}>+</button>
                  </div>
                </div>
              )}

              {/* Tab 2: Imágenes */}
              {adminTab === 2 && (
                <div>
                  {[
                    { key: 'logo', label: '🖼️ Logo', img: C.logoImg },
                    { key: 'diablito', label: '😈 Diablito', img: C.diablitoImg },
                    { key: 'glorias', label: '🌟 Glorias', img: C.gloriasImg },
                    { key: 'botanas', label: '🍿 Botanas', img: C.botanasImg },
                    ...menuData.sabores.map(s => ({ key: `sabor_${s.id}`, label: `${s.emoji} ${s.nombre}`, img: s.img })),
                  ].map(item => (
                    <div key={item.key} style={{ background: 'white', borderRadius: '10px', padding: '10px 12px', marginBottom: '8px', border: '1.5px solid #e8e8e8' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--texto)', marginBottom: '6px' }}>{item.label}</div>
                      <div style={{ width: '100%', height: '80px', borderRadius: '8px', background: 'var(--gris-fondo)', overflow: 'hidden', marginBottom: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {item.img ? (
                          <img src={item.img} alt={item.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span style={{ fontSize: '11px', color: 'var(--texto-muted)' }}>Sin imagen</span>
                        )}
                      </div>
                      <div className="flex items-center" style={{ gap: '8px' }}>
                        <button onClick={() => fileInputRefs.current[item.key]?.click()}
                          style={{ padding: '6px 14px', border: '1.5px solid var(--rojo)', borderRadius: '8px', background: 'white', color: 'var(--rojo)', fontFamily: 'var(--font-poppins)', fontSize: '11px', fontWeight: 700, cursor: 'pointer', transition: '0.18s' }}>
                          📁 Cambiar
                        </button>
                        <span style={{ fontSize: '10px', color: 'var(--texto-muted)' }}>Sube una imagen</span>
                      </div>
                      <input ref={el => { fileInputRefs.current[item.key] = el }} type="file" accept="image/*" style={{ display: 'none' }}
                        onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(item.key, f) }} />
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 3: Extras */}
              {adminTab === 3 && (
                <div>
                  {/* Extras Clásico */}
                  <div style={{ marginBottom: '16px' }}>
                    <h4 style={{ fontFamily: 'var(--font-fredoka)', fontSize: '14px', color: 'var(--rojo)', marginBottom: '8px' }}>🍧 Extras Clásico</h4>
                    {menuData.extrasClasico.map(e => (
                      <div key={e.id} className="flex items-center" style={{ gap: '6px', marginBottom: '6px', background: 'white', borderRadius: '8px', padding: '6px 10px', border: '1.5px solid #e8e8e8' }}>
                        <span style={{ flex: 1, fontFamily: 'var(--font-inter)', fontSize: '13px', color: 'var(--texto)' }}>{e.nombre}</span>
                        <button onClick={() => handleDeleteExtra('clasico', e.id)}
                          style={{ padding: '4px 8px', border: 'none', borderRadius: '6px', background: '#ff6b6b', color: 'white', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>✕</button>
                      </div>
                    ))}
                    <div className="flex items-center" style={{ gap: '6px', marginTop: '4px' }}>
                      <input value={newExtraNombre['clasico'] || ''} onChange={e => setNewExtraNombre(prev => ({ ...prev, clasico: e.target.value }))} placeholder="Nuevo extra..."
                        onKeyDown={e => e.key === 'Enter' && handleAddExtra('clasico')}
                        style={{ flex: 1, padding: '6px 8px', border: '1.5px solid #ddd', borderRadius: '6px', fontFamily: 'var(--font-inter)', fontSize: '13px', color: 'var(--texto)' }} />
                      <button onClick={() => handleAddExtra('clasico')} style={{ padding: '6px 10px', border: 'none', borderRadius: '6px', background: 'var(--rojo)', color: 'white', fontSize: '12px', cursor: 'pointer' }}>+</button>
                    </div>
                  </div>

                  {/* Extras Diablito */}
                  <div style={{ marginBottom: '16px' }}>
                    <h4 style={{ fontFamily: 'var(--font-fredoka)', fontSize: '14px', color: 'var(--rojo)', marginBottom: '8px' }}>😈 Extras Diablito</h4>
                    {menuData.extrasDiablito.map(e => (
                      <div key={e.id} className="flex items-center" style={{ gap: '6px', marginBottom: '6px', background: 'white', borderRadius: '8px', padding: '6px 10px', border: '1.5px solid #e8e8e8' }}>
                        <span style={{ flex: 1, fontFamily: 'var(--font-inter)', fontSize: '13px', color: 'var(--texto)' }}>{e.nombre}</span>
                        <button onClick={() => handleDeleteExtra('diablito', e.id)}
                          style={{ padding: '4px 8px', border: 'none', borderRadius: '6px', background: '#ff6b6b', color: 'white', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>✕</button>
                      </div>
                    ))}
                    <div className="flex items-center" style={{ gap: '6px', marginTop: '4px' }}>
                      <input value={newExtraNombre['diablito'] || ''} onChange={e => setNewExtraNombre(prev => ({ ...prev, diablito: e.target.value }))} placeholder="Nuevo extra..."
                        onKeyDown={e => e.key === 'Enter' && handleAddExtra('diablito')}
                        style={{ flex: 1, padding: '6px 8px', border: '1.5px solid #ddd', borderRadius: '6px', fontFamily: 'var(--font-inter)', fontSize: '13px', color: 'var(--texto)' }} />
                      <button onClick={() => handleAddExtra('diablito')} style={{ padding: '6px 10px', border: 'none', borderRadius: '6px', background: 'var(--rojo)', color: 'white', fontSize: '12px', cursor: 'pointer' }}>+</button>
                    </div>
                  </div>

                  {/* Extras Glorias */}
                  <div style={{ marginBottom: '16px' }}>
                    <h4 style={{ fontFamily: 'var(--font-fredoka)', fontSize: '14px', color: 'var(--rojo)', marginBottom: '8px' }}>🌟 Extras Glorias</h4>
                    {menuData.extrasGloria.map(e => (
                      <div key={e.id} className="flex items-center" style={{ gap: '6px', marginBottom: '6px', background: 'white', borderRadius: '8px', padding: '6px 10px', border: '1.5px solid #e8e8e8' }}>
                        <span style={{ flex: 1, fontFamily: 'var(--font-inter)', fontSize: '13px', color: 'var(--texto)' }}>{e.nombre}</span>
                        <button onClick={() => handleDeleteExtra('gloria', e.id)}
                          style={{ padding: '4px 8px', border: 'none', borderRadius: '6px', background: '#ff6b6b', color: 'white', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>✕</button>
                      </div>
                    ))}
                    <div className="flex items-center" style={{ gap: '6px', marginTop: '4px' }}>
                      <input value={newExtraNombre['gloria'] || ''} onChange={e => setNewExtraNombre(prev => ({ ...prev, gloria: e.target.value }))} placeholder="Nuevo extra..."
                        onKeyDown={e => e.key === 'Enter' && handleAddExtra('gloria')}
                        style={{ flex: 1, padding: '6px 8px', border: '1.5px solid #ddd', borderRadius: '6px', fontFamily: 'var(--font-inter)', fontSize: '13px', color: 'var(--texto)' }} />
                      <button onClick={() => handleAddExtra('gloria')} style={{ padding: '6px 10px', border: 'none', borderRadius: '6px', background: 'var(--rojo)', color: 'white', fontSize: '12px', cursor: 'pointer' }}>+</button>
                    </div>
                  </div>

                  {/* Bases Diablito */}
                  <div style={{ marginBottom: '16px' }}>
                    <h4 style={{ fontFamily: 'var(--font-fredoka)', fontSize: '14px', color: 'var(--rojo)', marginBottom: '8px' }}>🫙 Bases Diablito</h4>
                    {menuData.basesDiablito.map(b => (
                      <div key={b.id} className="flex items-center" style={{ gap: '6px', marginBottom: '6px', background: 'white', borderRadius: '8px', padding: '6px 10px', border: '1.5px solid #e8e8e8' }}>
                        <span style={{ flex: 1, fontFamily: 'var(--font-inter)', fontSize: '13px', color: 'var(--texto)' }}>{b.nombre}</span>
                        <button onClick={() => handleDeleteBase(b.id)}
                          style={{ padding: '4px 8px', border: 'none', borderRadius: '6px', background: '#ff6b6b', color: 'white', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>✕</button>
                      </div>
                    ))}
                    <div className="flex items-center" style={{ gap: '6px', marginTop: '4px' }}>
                      <input value={newExtraNombre['base'] || ''} onChange={e => setNewExtraNombre(prev => ({ ...prev, base: e.target.value }))} placeholder="Nueva base..."
                        onKeyDown={e => e.key === 'Enter' && handleAddBase()}
                        style={{ flex: 1, padding: '6px 8px', border: '1.5px solid #ddd', borderRadius: '6px', fontFamily: 'var(--font-inter)', fontSize: '13px', color: 'var(--texto)' }} />
                      <button onClick={handleAddBase} style={{ padding: '6px 10px', border: 'none', borderRadius: '6px', background: 'var(--rojo)', color: 'white', fontSize: '12px', cursor: 'pointer' }}>+</button>
                    </div>
                  </div>

                  {/* Botanas */}
                  <div>
                    <h4 style={{ fontFamily: 'var(--font-fredoka)', fontSize: '14px', color: 'var(--rojo)', marginBottom: '8px' }}>🍿 Botanas</h4>
                    {menuData.botanas.map(b => (
                      <div key={b.id} className="flex items-center" style={{ gap: '6px', marginBottom: '6px', background: 'white', borderRadius: '8px', padding: '6px 10px', border: '1.5px solid #e8e8e8' }}>
                        <span style={{ flex: 1, fontFamily: 'var(--font-inter)', fontSize: '13px', color: 'var(--texto)' }}>{b.nombre}</span>
                        <button onClick={() => handleDeleteBotana(b.id)}
                          style={{ padding: '4px 8px', border: 'none', borderRadius: '6px', background: '#ff6b6b', color: 'white', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>✕</button>
                      </div>
                    ))}
                    <div className="flex items-center" style={{ gap: '6px', marginTop: '4px' }}>
                      <input value={newExtraNombre['botana'] || ''} onChange={e => setNewExtraNombre(prev => ({ ...prev, botana: e.target.value }))} placeholder="Nueva botana..."
                        onKeyDown={e => e.key === 'Enter' && handleAddBotana()}
                        style={{ flex: 1, padding: '6px 8px', border: '1.5px solid #ddd', borderRadius: '6px', fontFamily: 'var(--font-inter)', fontSize: '13px', color: 'var(--texto)' }} />
                      <button onClick={handleAddBotana} style={{ padding: '6px 10px', border: 'none', borderRadius: '6px', background: 'var(--rojo)', color: 'white', fontSize: '12px', cursor: 'pointer' }}>+</button>
                    </div>
                  </div>

                  <button onClick={handleLogout}
                    style={{ width: '100%', padding: '10px', border: '1.5px solid var(--rojo)', borderRadius: 'var(--radius-card-sm)', background: 'white', color: 'var(--rojo)', fontFamily: 'var(--font-poppins)', fontWeight: 700, fontSize: '13px', cursor: 'pointer', marginTop: '16px', transition: '0.18s' }}>
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ═══ ESPECIALES ═══ */}
        <section style={{ marginTop: '0' }}>
          <h2 style={{ fontFamily: 'var(--font-fredoka)', fontSize: '20px', fontWeight: 700, padding: '0 4px', marginBottom: '16px', color: 'var(--rojo)' }}>⭐ Especiales</h2>

          {/* EL DIABLITO */}
          <div style={{ borderRadius: 'var(--radius-card)', background: 'white', boxShadow: 'var(--sombra)', overflow: 'hidden', border: '2.5px solid #e8e8e8', transition: '0.2s' }}>
            <div className="relative w-full overflow-hidden" style={{ height: '210px', background: 'white' }}>
              {C.diablitoImg ? (
                <img src={C.diablitoImg} alt="El Diablito" className="w-full h-full object-cover block"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; ((e.target as HTMLImageElement).nextElementSibling as HTMLDivElement).style.display = 'flex'; }} />
              ) : null}
              <div className="w-full h-full flex flex-col items-center justify-center" style={{ display: C.diablitoImg ? 'none' : 'flex', background: 'linear-gradient(135deg,#ffeaea,#fff8e1)', fontSize: '48px', gap: '6px' }}>
                <div>😈🌶️</div>
                <p style={{ fontFamily: 'var(--font-poppins)', fontSize: '12px', color: 'var(--texto-muted)', fontWeight: 600 }}>El Diablito</p>
              </div>
              <div className="absolute" style={{ top: '12px', right: '12px', padding: '6px 16px', borderRadius: 'var(--radius-pill)', fontFamily: 'var(--font-fredoka)', fontWeight: 700, fontSize: '20px', color: 'white', boxShadow: '0 4px 14px rgba(0,0,0,0.2)', background: 'var(--rojo)' }}>
                ${C.precioDiablito}
              </div>
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ marginBottom: '12px' }}>
                <h3 style={{ fontFamily: 'var(--font-fredoka)', fontSize: '20px', fontWeight: 700, color: 'var(--rojo)' }}>🌶️ El Diablito</h3>
                <p style={{ fontSize: '14px', color: 'var(--texto-muted)', lineHeight: 1.5, marginTop: '4px' }}>{C.diablitoDesc}</p>
              </div>
              {menuData.basesDiablito.length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontFamily: 'var(--font-fredoka)', fontSize: '14px', color: 'var(--texto)', marginBottom: '8px' }}>🫙 Elige tu base:</div>
                  <div className="grid grid-cols-3 gap-2" style={{ marginBottom: '12px' }}>
                    {menuData.basesDiablito.map(b => (
                      <button key={b.id}
                        className="cursor-pointer text-center"
                        style={{
                          padding: '12px 6px',
                          border: `2px solid ${diablitoBase === b.nombre ? 'var(--rojo)' : '#e8e8e8'}`,
                          borderRadius: 'var(--radius-card-sm)',
                          background: diablitoBase === b.nombre ? 'var(--rojo-light)' : 'white',
                          fontFamily: 'var(--font-fredoka)',
                          fontSize: '13px',
                          color: diablitoBase === b.nombre ? 'var(--rojo)' : 'var(--texto-muted)',
                          transition: '0.18s',
                          lineHeight: 1.3,
                        }}
                        onClick={() => setDiablitoBase(diablitoBase === b.nombre ? '' : b.nombre)}
                      >
                        {b.nombre}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {menuData.extrasDiablito.length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '13px', color: 'var(--texto-muted)', marginBottom: '8px' }}>🔥 Extras (+${C.precioExtra} c/u):</div>
                  <div className="flex flex-wrap gap-2" style={{ marginBottom: '12px' }}>
                    {menuData.extrasDiablito.map(e => (
                      <div key={e.id}
                        className="flex items-center cursor-pointer select-none"
                        style={{
                          gap: '5px',
                          padding: '8px 12px',
                          border: `2px solid ${diablitoExtras.includes(e.nombre) ? 'var(--rojo)' : '#e8e8e8'}`,
                          borderRadius: 'var(--radius-pill)',
                          background: diablitoExtras.includes(e.nombre) ? 'var(--rojo-light)' : 'white',
                          fontFamily: 'var(--font-poppins)',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: diablitoExtras.includes(e.nombre) ? 'var(--rojo)' : 'var(--texto)',
                          transition: '0.18s',
                          userSelect: 'none',
                        }}
                        onClick={() => toggleExtra(diablitoExtras, setDiablitoExtras, e.nombre)}
                      >
                        <div className="flex items-center justify-center flex-shrink-0" style={{
                          width: '16px', height: '16px', borderRadius: '50%',
                          border: `2px solid ${diablitoExtras.includes(e.nombre) ? 'var(--rojo)' : '#ccc'}`,
                          background: diablitoExtras.includes(e.nombre) ? 'var(--rojo)' : 'white',
                          transition: '0.18s',
                        }}>
                          {diablitoExtras.includes(e.nombre) && CHK_SVG}
                        </div>
                        {e.nombre}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span style={{ fontFamily: 'var(--font-fredoka)', fontSize: '16px', color: 'var(--texto)' }}>Cantidad</span>
                <div className="flex items-center" style={{ gap: '12px' }}>
                  <button className="flex items-center justify-center cursor-pointer" onClick={() => setDiablitoQty(Math.max(0, diablitoQty - 1))}
                    style={{ width: '34px', height: '34px', borderRadius: '50%', border: '2px solid #e8e8e8', background: 'white', fontSize: '20px', fontWeight: 700, color: 'var(--texto-muted)', transition: '0.15s' }}>−</button>
                  <span style={{ fontFamily: 'var(--font-fredoka)', fontSize: '20px', color: 'var(--texto)', minWidth: '24px', textAlign: 'center' }}>{diablitoQty}</span>
                  <button className="flex items-center justify-center cursor-pointer" onClick={() => setDiablitoQty(diablitoQty + 1)}
                    style={{ width: '34px', height: '34px', borderRadius: '50%', border: '2px solid #e8e8e8', background: 'white', fontSize: '20px', fontWeight: 700, color: 'var(--texto-muted)', transition: '0.15s' }}>+</button>
                </div>
                <button className="cursor-pointer" onClick={() => { addToOrder('diablito', '🌶️ El Diablito', C.precioDiablito, diablitoQty, diablitoExtras, diablitoBase || undefined); setDiablitoQty(0); setDiablitoExtras([]); setDiablitoBase(''); }}
                  style={{ padding: '10px 22px', border: 'none', borderRadius: 'var(--radius-pill)', fontFamily: 'var(--font-fredoka)', fontSize: '14px', fontWeight: 700, color: 'white', background: 'var(--rojo)', boxShadow: '0 4px 14px rgba(214,48,49,0.3)', transition: '0.18s' }}>
                  Agregar
                </button>
              </div>
            </div>
          </div>

          {/* LAS GLORIAS */}
          <div style={{ borderRadius: 'var(--radius-card)', background: 'white', boxShadow: 'var(--sombra)', overflow: 'hidden', border: '2.5px solid #e8e8e8', marginTop: '20px', transition: '0.2s' }}>
            <div className="relative w-full overflow-hidden" style={{ height: '210px', background: 'white' }}>
              {C.gloriasImg ? (
                <img src={C.gloriasImg} alt="Las Glorias" className="w-full h-full object-cover block"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; ((e.target as HTMLImageElement).nextElementSibling as HTMLDivElement).style.display = 'flex'; }} />
              ) : null}
              <div className="w-full h-full flex flex-col items-center justify-center" style={{ display: C.gloriasImg ? 'none' : 'flex', background: 'linear-gradient(135deg,#fff8e1,#ffeaea)', fontSize: '48px', gap: '6px' }}>
                <div>🍌✨🥛</div>
                <p style={{ fontFamily: 'var(--font-poppins)', fontSize: '12px', color: 'var(--texto-muted)', fontWeight: 600 }}>Las Glorias</p>
              </div>
              <div className="absolute" style={{ top: '12px', right: '12px', padding: '6px 16px', borderRadius: 'var(--radius-pill)', fontFamily: 'var(--font-fredoka)', fontWeight: 700, fontSize: '20px', color: 'white', boxShadow: '0 4px 14px rgba(0,0,0,0.2)', background: 'var(--naranja)' }}>
                ${C.precioGlorias}
              </div>
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ marginBottom: '12px' }}>
                <h3 style={{ fontFamily: 'var(--font-fredoka)', fontSize: '20px', fontWeight: 700, color: 'var(--naranja)' }}>🌟 Las Glorias</h3>
                <p style={{ fontSize: '14px', color: 'var(--texto-muted)', lineHeight: 1.5, marginTop: '4px' }}>{C.gloriasDesc}</p>
              </div>
              {menuData.extrasGloria.length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '13px', color: 'var(--texto-muted)', marginBottom: '8px' }}>✨ Extras (+${C.precioExtra} c/u):</div>
                  <div className="flex flex-wrap gap-2" style={{ marginBottom: '12px' }}>
                    {menuData.extrasGloria.map(e => (
                      <div key={e.id}
                        className="flex items-center cursor-pointer select-none"
                        style={{
                          gap: '5px',
                          padding: '8px 12px',
                          border: `2px solid ${gloriasExtras.includes(e.nombre) ? 'var(--rojo)' : '#e8e8e8'}`,
                          borderRadius: 'var(--radius-pill)',
                          background: gloriasExtras.includes(e.nombre) ? 'var(--rojo-light)' : 'white',
                          fontFamily: 'var(--font-poppins)',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: gloriasExtras.includes(e.nombre) ? 'var(--rojo)' : 'var(--texto)',
                          transition: '0.18s',
                        }}
                        onClick={() => toggleExtra(gloriasExtras, setGloriasExtras, e.nombre)}
                      >
                        <div className="flex items-center justify-center flex-shrink-0" style={{
                          width: '16px', height: '16px', borderRadius: '50%',
                          border: `2px solid ${gloriasExtras.includes(e.nombre) ? 'var(--rojo)' : '#ccc'}`,
                          background: gloriasExtras.includes(e.nombre) ? 'var(--rojo)' : 'white',
                          transition: '0.18s',
                        }}>
                          {gloriasExtras.includes(e.nombre) && CHK_SVG}
                        </div>
                        {e.nombre}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span style={{ fontFamily: 'var(--font-fredoka)', fontSize: '16px', color: 'var(--texto)' }}>Cantidad</span>
                <div className="flex items-center" style={{ gap: '12px' }}>
                  <button className="flex items-center justify-center cursor-pointer" onClick={() => setGloriasQty(Math.max(0, gloriasQty - 1))}
                    style={{ width: '34px', height: '34px', borderRadius: '50%', border: '2px solid #e8e8e8', background: 'white', fontSize: '20px', fontWeight: 700, color: 'var(--texto-muted)', transition: '0.15s' }}>−</button>
                  <span style={{ fontFamily: 'var(--font-fredoka)', fontSize: '20px', color: 'var(--texto)', minWidth: '24px', textAlign: 'center' }}>{gloriasQty}</span>
                  <button className="flex items-center justify-center cursor-pointer" onClick={() => setGloriasQty(gloriasQty + 1)}
                    style={{ width: '34px', height: '34px', borderRadius: '50%', border: '2px solid #e8e8e8', background: 'white', fontSize: '20px', fontWeight: 700, color: 'var(--texto-muted)', transition: '0.15s' }}>+</button>
                </div>
                <button className="cursor-pointer" onClick={() => { addToOrder('glorias', '🌟 Las Glorias', C.precioGlorias, gloriasQty, gloriasExtras); setGloriasQty(0); setGloriasExtras([]); }}
                  style={{ padding: '10px 22px', border: 'none', borderRadius: 'var(--radius-pill)', fontFamily: 'var(--font-fredoka)', fontSize: '14px', fontWeight: 700, color: 'white', background: 'var(--naranja)', boxShadow: '0 4px 14px rgba(255,165,2,0.3)', transition: '0.18s' }}>
                  Agregar
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ NUESTROS SABORES ═══ */}
        <section style={{ marginTop: '24px' }}>
          <h2 style={{ fontFamily: 'var(--font-fredoka)', fontSize: '20px', fontWeight: 700, padding: '0 4px', marginBottom: '16px', color: 'var(--rojo)' }}>🍧 Nuestros Sabores</h2>
          {menuData.sabores.map(s => {
            const qty = saborQty[s.id] || 0
            return (
              <div key={s.id} className="flex" style={{ borderRadius: 'var(--radius-card)', background: 'white', boxShadow: 'var(--sombra-sm)', overflow: 'hidden', border: '2px solid #e8e8e8', marginTop: '12px', transition: '0.2s' }}>
                <div className="flex-shrink-0 overflow-hidden relative" style={{ width: '112px', height: '112px' }}>
                  {s.img ? (
                    <img src={s.img} alt={s.nombre} className="w-full h-full object-cover" style={{ borderRadius: '14px 0 0 0' }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; ((e.target as HTMLImageElement).nextElementSibling as HTMLDivElement).style.display = 'flex'; }} />
                  ) : null}
                  <div className="w-full h-full flex items-center justify-center" style={{ display: s.img ? 'none' : 'flex', background: s.bg || 'linear-gradient(135deg,#ffeaea,#fff8e1)', fontSize: '44px', borderRadius: '14px 0 0 0' }}>
                    {s.emoji}
                  </div>
                </div>
                <div className="flex flex-col justify-between flex-1 min-w-0" style={{ padding: '12px' }}>
                  <div>
                    <h3 className="truncate" style={{ fontFamily: 'var(--font-fredoka)', fontSize: '15px', fontWeight: 700, color: s.color }}>{s.emoji} {s.nombre}</h3>
                    <p className="line-clamp-2" style={{ fontSize: '12px', color: 'var(--texto-muted)', marginTop: '2px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{s.desc}</p>
                  </div>
                  <div className="flex items-center justify-between" style={{ marginTop: '8px' }}>
                    <span style={{ fontFamily: 'var(--font-fredoka)', fontSize: '18px', fontWeight: 700, color: s.color }}>${C.precioClasico}</span>
                    <div className="flex items-center" style={{ gap: '8px' }}>
                      <button className="flex items-center justify-center cursor-pointer" onClick={() => setSaborQty(prev => ({ ...prev, [s.id]: Math.max(0, (prev[s.id] || 0) - 1) }))}
                        style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid #e8e8e8', background: 'white', fontSize: '16px', fontWeight: 700, color: 'var(--texto-muted)', transition: '0.15s' }}>−</button>
                      <span style={{ fontFamily: 'var(--font-fredoka)', fontSize: '16px', color: 'var(--texto)', minWidth: '24px', textAlign: 'center' }}>{qty}</span>
                      <button className="flex items-center justify-center cursor-pointer" onClick={() => setSaborQty(prev => ({ ...prev, [s.id]: (prev[s.id] || 0) + 1 }))}
                        style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid #e8e8e8', background: 'white', fontSize: '16px', fontWeight: 700, color: 'var(--texto-muted)', transition: '0.15s' }}>+</button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Extras para clásicos */}
          {menuData.extrasClasico.length > 0 && (
            <div style={{ marginTop: '12px' }}>
              <div style={{ fontSize: '13px', color: 'var(--texto-muted)', marginBottom: '8px' }}>✨ Extras para sabores (+${C.precioExtra} c/u):</div>
              <div className="flex flex-wrap gap-2">
                {menuData.extrasClasico.map(e => (
                  <div key={e.id}
                    className="flex items-center cursor-pointer select-none"
                    style={{
                      gap: '5px',
                      padding: '8px 12px',
                      border: `2px solid ${clasicoExtras.includes(e.nombre) ? 'var(--rojo)' : '#e8e8e8'}`,
                      borderRadius: 'var(--radius-pill)',
                      background: clasicoExtras.includes(e.nombre) ? 'var(--rojo-light)' : 'white',
                      fontFamily: 'var(--font-poppins)',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: clasicoExtras.includes(e.nombre) ? 'var(--rojo)' : 'var(--texto)',
                      transition: '0.18s',
                    }}
                    onClick={() => toggleExtra(clasicoExtras, setClasicoExtras, e.nombre)}
                  >
                    <div className="flex items-center justify-center flex-shrink-0" style={{
                      width: '16px', height: '16px', borderRadius: '50%',
                      border: `2px solid ${clasicoExtras.includes(e.nombre) ? 'var(--rojo)' : '#ccc'}`,
                      background: clasicoExtras.includes(e.nombre) ? 'var(--rojo)' : 'white',
                      transition: '0.18s',
                    }}>
                      {clasicoExtras.includes(e.nombre) && CHK_SVG}
                    </div>
                    {e.nombre}
                  </div>
                ))}
              </div>
              <button className="cursor-pointer" onClick={() => {
                menuData.sabores.forEach(s => {
                  const qty = saborQty[s.id] || 0
                  if (qty > 0) {
                    addToOrder('clasico', `${s.emoji} ${s.nombre}`, C.precioClasico, qty, clasicoExtras, undefined, s.id)
                  }
                })
                setSaborQty({})
                setClasicoExtras([])
              }}
                style={{ width: '100%', padding: '12px', border: 'none', borderRadius: 'var(--radius-pill)', fontFamily: 'var(--font-fredoka)', fontSize: '14px', fontWeight: 700, color: 'white', background: 'var(--rojo)', boxShadow: '0 4px 14px rgba(214,48,49,0.3)', marginTop: '12px', transition: '0.18s', cursor: 'pointer' }}>
                Agregar Sabores
              </button>
            </div>
          )}
        </section>

        {/* ═══ BOTANAS Y ANTOJOS ═══ */}
        <section style={{ marginTop: '24px' }}>
          <h2 style={{ fontFamily: 'var(--font-fredoka)', fontSize: '20px', fontWeight: 700, padding: '0 4px', marginBottom: '16px', color: 'var(--naranja)' }}>🍿 Botanas y Antojos</h2>
          <div style={{ borderRadius: 'var(--radius-card)', background: 'white', boxShadow: 'var(--sombra)', overflow: 'hidden', border: '2px solid var(--naranja)' }}>
            <div className="relative w-full overflow-hidden" style={{ height: '160px', background: 'white' }}>
              {C.botanasImg ? (
                <img src={C.botanasImg} alt="Botanas" className="w-full h-full object-cover block"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; ((e.target as HTMLImageElement).nextElementSibling as HTMLDivElement).style.display = 'flex'; }} />
              ) : null}
              <div className="w-full h-full flex flex-col items-center justify-center" style={{ display: C.botanasImg ? 'none' : 'flex', background: 'linear-gradient(135deg,#fff8e1,#ffeaea)', fontSize: '48px', gap: '6px' }}>
                <div>🍿🥔</div>
                <p style={{ fontFamily: 'var(--font-poppins)', fontSize: '12px', color: 'var(--texto-muted)', fontWeight: 600 }}>Botanas</p>
              </div>
              <div className="absolute" style={{ top: '10px', right: '10px', padding: '4px 12px', borderRadius: 'var(--radius-pill)', background: 'var(--naranja)', color: 'white', fontFamily: 'var(--font-fredoka)', fontSize: '16px', fontWeight: 700, boxShadow: '0 4px 12px rgba(255,165,2,0.3)' }}>
                ${C.precioBotana}
              </div>
            </div>
            <div style={{ padding: '20px' }}>
              <p style={{ fontSize: '14px', color: 'var(--texto-muted)', marginBottom: '12px' }}>Para acompañar tu raspado</p>
              <div className="grid grid-cols-2 gap-2">
                {menuData.botanas.map(b => (
                  <button key={b.id} className="cursor-pointer text-center"
                    style={{
                      padding: '12px',
                      border: `2px solid ${selectedBotanas.includes(b.nombre) ? 'var(--naranja)' : '#e8e8e8'}`,
                      borderRadius: 'var(--radius-card-sm)',
                      background: selectedBotanas.includes(b.nombre) ? 'var(--naranja-light)' : 'white',
                      fontFamily: 'var(--font-poppins)',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: selectedBotanas.includes(b.nombre) ? 'var(--naranja-dark)' : 'var(--texto)',
                      transition: '0.18s',
                    }}
                    onClick={() => toggleBotana(b.nombre)}
                  >
                    {b.nombre}
                  </button>
                ))}
              </div>
              {selectedBotanas.length > 0 && (
                <button className="cursor-pointer" onClick={() => {
                  selectedBotanas.forEach(b => addToOrder('botana', b, C.precioBotana, 1, []))
                  setSelectedBotanas([])
                }}
                  style={{ width: '100%', padding: '12px', border: 'none', borderRadius: 'var(--radius-pill)', fontFamily: 'var(--font-fredoka)', fontSize: '14px', fontWeight: 700, color: 'white', background: 'var(--naranja)', boxShadow: '0 4px 14px rgba(255,165,2,0.3)', marginTop: '12px', transition: '0.18s', cursor: 'pointer' }}>
                  Agregar Botanas
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ═══ ENTREGA ═══ */}
        <section style={{ marginTop: '24px' }}>
          <h2 style={{ fontFamily: 'var(--font-fredoka)', fontSize: '20px', fontWeight: 700, padding: '0 4px', marginBottom: '16px', color: 'var(--rojo)' }}>🚚 Entrega</h2>
          <div style={{ borderRadius: 'var(--radius-card)', background: 'white', boxShadow: 'var(--sombra)', overflow: 'hidden', border: '2px solid var(--rojo)' }}>
            <div style={{ padding: '20px' }}>
              <div className="flex items-center justify-between" style={{ gap: '12px', padding: '14px', background: 'rgba(214,48,49,0.04)', borderRadius: '14px', border: '1px solid rgba(214,48,49,0.12)' }}>
                <div className="flex-1 cursor-pointer text-center" onClick={() => setTipoEntrega('recoger')}
                  style={{ padding: '8px', borderRadius: '10px', transition: '0.18s', background: tipoEntrega === 'recoger' ? 'var(--rojo-light)' : 'transparent', border: tipoEntrega === 'recoger' ? '2px solid var(--rojo)' : '2px solid transparent' }}>
                  <div style={{ fontSize: '22px' }}>🏪</div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--texto)' }}>Pasar a recoger</div>
                  <div style={{ fontSize: '12px', color: 'var(--texto-muted)' }}>Recoge tu pedido</div>
                </div>
                <div className="flex-1 cursor-pointer text-center" onClick={() => setTipoEntrega('domicilio')}
                  style={{ padding: '8px', borderRadius: '10px', transition: '0.18s', background: tipoEntrega === 'domicilio' ? 'var(--rojo-light)' : 'transparent', border: tipoEntrega === 'domicilio' ? '2px solid var(--rojo)' : '2px solid transparent' }}>
                  <div style={{ fontSize: '22px' }}>🛵</div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--texto)' }}>A domicilio</div>
                  <div style={{ fontSize: '12px', color: 'var(--texto-muted)' }}>Te lo llevamos</div>
                </div>
              </div>
              {tipoEntrega === 'domicilio' && (
                <div style={{ marginTop: '12px' }}>
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ fontWeight: 700, fontSize: '13px', color: 'var(--texto)', marginBottom: '5px', display: 'block' }}>📍 Dirección completa (calle, número, colonia)</label>
                    <input type="text" value={direccion} onChange={e => setDireccion(e.target.value)} placeholder="Ej: Calle Juárez 45, Col. Centro"
                      style={{ width: '100%', padding: '11px 13px', border: '1.5px solid #ddd', borderRadius: 'var(--radius-card-sm)', fontFamily: 'var(--font-inter)', fontSize: '14px', color: 'var(--texto)', background: 'var(--gris-fondo)', outline: 'none', transition: 'border-color 0.18s' }}
                      onFocus={e => { e.target.style.borderColor = 'var(--rojo)'; e.target.style.background = 'white' }}
                      onBlur={e => { e.target.style.borderColor = '#ddd'; e.target.style.background = 'var(--gris-fondo)' }} />
                  </div>
                  <div>
                    <label style={{ fontWeight: 700, fontSize: '13px', color: 'var(--texto)', marginBottom: '5px', display: 'block' }}>🔍 Referencias para el repartidor</label>
                    <textarea value={referencias} onChange={e => setReferencias(e.target.value)} rows={2} placeholder="Ej: Casa azul, junto al OXXO"
                      style={{ width: '100%', padding: '11px 13px', border: '1.5px solid #ddd', borderRadius: 'var(--radius-card-sm)', fontFamily: 'var(--font-inter)', fontSize: '14px', color: 'var(--texto)', background: 'var(--gris-fondo)', outline: 'none', resize: 'none', transition: 'border-color 0.18s' }}
                      onFocus={e => { e.target.style.borderColor = 'var(--rojo)'; e.target.style.background = 'white' }}
                      onBlur={e => { e.target.style.borderColor = '#ddd'; e.target.style.background = 'var(--gris-fondo)' }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ═══ CAMBIO ═══ */}
        <div style={{ marginTop: '24px', borderRadius: 'var(--radius-card)', background: 'white', boxShadow: 'var(--sombra)', overflow: 'hidden', border: '2px solid var(--naranja)' }}>
          <div style={{ padding: '20px' }}>
            <div style={{ fontFamily: 'var(--font-fredoka)', fontSize: '20px', color: 'var(--naranja)' }}>💵 Control de Cambio</div>
            <p style={{ fontSize: '14px', color: 'var(--texto-muted)', marginTop: '10px' }}>Indica con cuánto vas a pagar para que llevemos el cambio exacto</p>
            <div style={{ marginTop: '10px' }}>
              <label style={{ fontWeight: 700, fontSize: '13px', color: 'var(--texto)', marginBottom: '5px', display: 'block' }}>Pago con...</label>
              <input type="text" value={pagoCon} onChange={e => setPagoCon(e.target.value)} placeholder="Ej: Billete de $200, $500, etc."
                style={{ width: '100%', padding: '11px 13px', border: '1.5px solid #ddd', borderRadius: 'var(--radius-card-sm)', fontFamily: 'var(--font-inter)', fontSize: '14px', color: 'var(--texto)', background: 'var(--gris-fondo)', outline: 'none', transition: 'border-color 0.18s' }}
                onFocus={e => { e.target.style.borderColor = 'var(--naranja)'; e.target.style.background = 'white' }}
                onBlur={e => { e.target.style.borderColor = '#ddd'; e.target.style.background = 'var(--gris-fondo)' }} />
            </div>
          </div>
        </div>

        {/* ═══ UBICACIÓN ═══ */}
        <div style={{ marginTop: '24px', borderRadius: 'var(--radius-card)', background: 'white', boxShadow: 'var(--sombra)', overflow: 'hidden', border: '2px solid var(--rojo)' }}>
          <div style={{ padding: '20px' }}>
            <div style={{ fontFamily: 'var(--font-fredoka)', fontSize: '20px', color: 'var(--rojo)' }}>📍 Ubicación</div>
            <div style={{ marginTop: '14px', padding: '14px', background: 'rgba(214,48,49,0.04)', borderRadius: '14px', border: '1px solid rgba(214,48,49,0.1)' }}>
              <p style={{ fontWeight: 600, fontSize: '13px', color: 'var(--texto)' }}>Nos ubicamos en:</p>
              <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--rojo)', fontFamily: 'var(--font-fredoka)', marginTop: '4px' }}>⚽ Calle Primera Cerrada de Las Salinas #7, San Pablo Villa de Mitla, Oaxaca</p>
            </div>
            <a className="flex items-center justify-center"
              href="https://www.google.com/maps/search/Calle+Primera+Cerrada+de+Las+Salinas+7+San+Pablo+Villa+de+Mitla+Oaxaca"
              target="_blank" rel="noopener"
              style={{ width: '100%', padding: '14px 20px', background: 'var(--rojo)', color: 'white', fontFamily: 'var(--font-poppins)', fontWeight: 700, fontSize: '14px', border: 'none', borderRadius: '14px', cursor: 'pointer', textDecoration: 'none', boxShadow: '0 4px 14px rgba(214,48,49,0.3)', transition: '0.18s', marginTop: '14px', gap: '8px' }}>
              {MAPS_SVG}
              Ver en Google Maps
            </a>
          </div>
        </div>

        {/* ═══ RESUMEN DEL PEDIDO ═══ */}
        <div style={{ marginTop: '24px', borderRadius: 'var(--radius-card)', background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(241,242,246,0.95))', boxShadow: 'var(--sombra)', border: '2px solid var(--rojo)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
          <div style={{ padding: '20px' }}>
            <div style={{ fontFamily: 'var(--font-fredoka)', fontSize: '22px', color: 'var(--rojo)', textAlign: 'center' }}>🧾 Resumen del Pedido</div>
            <div style={{ marginTop: '14px' }}>
              {orderItems.length === 0 ? (
                <div className="flex justify-between items-center" style={{ padding: '5px 0', fontSize: '13px' }}>
                  <span style={{ color: '#bbb', fontStyle: 'italic' }}>Aún no has elegido nada...</span>
                </div>
              ) : (
                orderItems.map((item, i) => (
                  <div key={i} className="flex justify-between items-center" style={{ padding: '5px 0', fontSize: '13px' }}>
                    <span style={{ color: 'var(--texto-muted)' }}>
                      {item.name} x{item.qty}
                      {item.base ? ` (${item.base})` : ''}
                      {item.extras.length > 0 ? ` +${item.extras.length} extra${item.extras.length > 1 ? 's' : ''}` : ''}
                    </span>
                    <div className="flex items-center gap-2">
                      <span style={{ fontWeight: 700, color: 'var(--texto)' }}>${item.price * item.qty + item.extras.length * C.precioExtra * item.qty}</span>
                      <button onClick={() => removeFromOrder(i)} className="cursor-pointer" style={{ background: 'none', border: 'none', color: '#ff6b6b', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>✕</button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div style={{ height: '1px', background: 'rgba(214,48,49,0.15)', marginTop: '14px' }} />
            <div className="flex justify-between items-center" style={{ marginTop: '14px' }}>
              <span style={{ fontFamily: 'var(--font-fredoka)', fontSize: '18px', fontWeight: 800, color: 'var(--texto)' }}>Total</span>
              <span style={{ fontFamily: 'var(--font-fredoka)', fontSize: '24px', fontWeight: 800, color: 'var(--rojo)' }}>${calculateTotal()}</span>
            </div>
            <div style={{ fontSize: '12px', padding: '10px', color: 'var(--texto-muted)', background: 'var(--naranja-light)', borderRadius: '10px', marginTop: '14px' }}>
              {tipoEntrega === 'recoger' ? '🏪 Pasar a recoger al local' : `🛵 A domicilio - ${direccion || 'Sin dirección'}`}
            </div>
            <button onClick={sendWhatsApp} disabled={orderItems.length === 0}
              className="flex items-center justify-center"
              style={{ width: '100%', padding: '18px 20px', background: 'var(--verde-wa)', color: 'white', fontFamily: 'var(--font-fredoka)', fontSize: '18px', fontWeight: 700, border: 'none', borderRadius: '16px', cursor: orderItems.length === 0 ? 'not-allowed' : 'pointer', boxShadow: '0 6px 24px rgba(37,211,102,0.4)', transition: '0.18s', marginTop: '14px', gap: '10px', opacity: orderItems.length === 0 ? 0.5 : 1 }}>
              {WA_SVG}
              Pedir por WhatsApp
            </button>
          </div>
        </div>
      </main>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ background: 'linear-gradient(135deg, #d63031, #e74c3c 40%, #ffa502)', padding: '28px 20px', textAlign: 'center', color: 'white', marginTop: 'auto' }}>
        <p style={{ fontFamily: 'var(--font-fredoka)', fontSize: '20px', fontWeight: 700 }}>Raspados Didxsaj</p>
        <p style={{ fontSize: '14px', marginTop: '6px', color: 'rgba(255,255,255,0.8)' }}>⚽ Nos ubicamos cerca del campo de fútbol, San Pablo Villa de Mitla, Oaxaca</p>
        <p style={{ fontSize: '11px', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)' }}>Hecho con ❤️ para Raspados Didxsaj</p>
      </footer>

      {/* ═══ ADMIN FLOAT BUTTON ═══ */}
      <button
        className="fixed cursor-pointer flex items-center justify-center"
        onClick={() => { if (isAdmin) handleLogout(); else setShowLoginModal(true); }}
        style={{
          bottom: '18px', right: '18px', zIndex: 100,
          width: '46px', height: '46px', borderRadius: '50%',
          background: isAdmin ? 'var(--verde-wa)' : 'var(--rojo-dark)',
          color: 'white', border: 'none',
          fontSize: '20px', cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          transition: '0.18s',
        }}
      >
        {isAdmin ? '🚪' : '⚙️'}
      </button>

      {/* ═══ ADMIN LOGIN MODAL ═══ */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', borderRadius: 'var(--radius-card)', padding: '28px 22px', width: '90%', maxWidth: '380px', boxShadow: '0 12px 40px rgba(0,0,0,0.3)', textAlign: 'center' }}>
            <h2 style={{ fontFamily: 'var(--font-fredoka)', fontSize: '22px', color: 'var(--rojo)', marginBottom: '5px' }}>🔒 Modo Admin</h2>
            <p style={{ fontSize: '13px', color: 'var(--texto-muted)', marginBottom: '18px' }}>Ingresa la contraseña de administrador</p>
            {loginError && (
              <div style={{ color: 'var(--rojo)', fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>❌ Contraseña incorrecta</div>
            )}
            <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="••••••"
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={{ width: '100%', padding: '11px 13px', border: '1.5px solid #ddd', borderRadius: 'var(--radius-card-sm)', fontFamily: 'var(--font-inter)', fontSize: '16px', color: 'var(--texto)', background: 'var(--gris-fondo)', outline: 'none', textAlign: 'center', letterSpacing: '4px', marginBottom: '12px' }} />
            <button onClick={handleLogin}
              style={{ width: '100%', padding: '13px', border: 'none', borderRadius: 'var(--radius-card-sm)', background: 'var(--rojo)', color: 'white', fontFamily: 'var(--font-fredoka)', fontSize: '15px', cursor: 'pointer', transition: '0.18s' }}>
              Entrar
            </button>
            <button onClick={() => { setShowLoginModal(false); setLoginError(false); setLoginPassword(''); }}
              style={{ marginTop: '10px', background: 'none', border: 'none', color: 'var(--texto-muted)', fontSize: '13px', cursor: 'pointer', fontFamily: 'var(--font-poppins)', fontWeight: 600 }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
      `}</style>
    </div>
  )
}

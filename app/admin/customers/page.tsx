'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Customer {
    line_user_id: string
    display_name: string | null
    picture_url: string | null
    total_scans: number
    has_purchased: boolean
    purchase_note: string | null
    created_at: string
    first_taxi?: { taxi_code: string; plate_number: string } | null
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'purchased' | 'not_purchased'>('all')
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
    const [purchaseNote, setPurchaseNote] = useState('')
    const router = useRouter()

    useEffect(() => {
        checkAuth()
        fetchCustomers()
    }, [])

    const checkAuth = async () => {
        const res = await fetch('/api/auth')
        if (!res.ok) router.push('/admin')
    }

    const fetchCustomers = async () => {
        try {
            const res = await fetch('/api/customers')
            const data = await res.json()
            setCustomers(data.customers || [])
        } catch (error) {
            console.error('Failed to fetch customers:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleMarkPurchased = async (customer: Customer, hasPurchased: boolean) => {
        try {
            await fetch(`/api/customers/${customer.line_user_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    has_purchased: hasPurchased,
                    purchase_note: purchaseNote || customer.purchase_note
                })
            })
            setEditingCustomer(null)
            setPurchaseNote('')
            fetchCustomers()
        } catch (error) {
            console.error('Failed to update customer:', error)
        }
    }

    const filteredCustomers = customers.filter(c => {
        if (filter === 'purchased') return c.has_purchased
        if (filter === 'not_purchased') return !c.has_purchased
        return true
    })

    const styles = {
        container: { minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', fontFamily: 'system-ui, sans-serif', color: 'white' },
        header: { padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' },
        main: { padding: '40px', maxWidth: '1200px', margin: '0 auto' },
        card: { background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.1)' },
        btn: { padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600' as const, fontSize: '13px' },
        btnPrimary: { background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white' },
        btnSecondary: { background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' },
        filterBtn: { padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: 'white', cursor: 'pointer', fontSize: '14px' },
        filterActive: { background: 'rgba(102, 126, 234, 0.3)', borderColor: '#667eea' },
        grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' },
        customerCard: { background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '20px', border: '1px solid rgba(255,255,255,0.1)' },
        avatar: { width: '50px', height: '50px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' },
        badge: { padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' as const },
        modal: { position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
        modalContent: { background: '#1a1a2e', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '400px', border: '1px solid rgba(255,255,255,0.1)' }
    }

    if (loading) return <div style={{ ...styles.container, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p>กำลังโหลด...</p></div>

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Link href="/admin/dashboard" style={{ color: 'white', textDecoration: 'none', fontSize: '20px' }}>←</Link>
                    <h1 style={{ fontSize: '24px', fontWeight: '700' }}>👥 รายชื่อลูกค้า</h1>
                    <span style={{ opacity: 0.6 }}>({filteredCustomers.length} คน)</span>
                </div>
            </header>

            <main style={styles.main}>
                {/* Filters */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                    <button
                        onClick={() => setFilter('all')}
                        style={{ ...styles.filterBtn, ...(filter === 'all' ? styles.filterActive : {}) }}
                    >
                        ทั้งหมด
                    </button>
                    <button
                        onClick={() => setFilter('purchased')}
                        style={{ ...styles.filterBtn, ...(filter === 'purchased' ? styles.filterActive : {}) }}
                    >
                        💰 ซื้อแล้ว
                    </button>
                    <button
                        onClick={() => setFilter('not_purchased')}
                        style={{ ...styles.filterBtn, ...(filter === 'not_purchased' ? styles.filterActive : {}) }}
                    >
                        ⏳ ยังไม่ซื้อ
                    </button>
                </div>

                {/* Customer Grid */}
                <div style={styles.grid}>
                    {filteredCustomers.map(customer => (
                        <div key={customer.line_user_id} style={styles.customerCard}>
                            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                                {customer.picture_url ? (
                                    <img src={customer.picture_url} alt="" style={{ ...styles.avatar, objectFit: 'cover' }} />
                                ) : (
                                    <div style={styles.avatar}>👤</div>
                                )}
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: '16px', marginBottom: '4px' }}>{customer.display_name || 'ไม่ทราบชื่อ'}</h3>
                                    <span style={{
                                        ...styles.badge,
                                        background: customer.has_purchased ? 'rgba(16, 185, 129, 0.2)' : 'rgba(251, 191, 36, 0.2)',
                                        color: customer.has_purchased ? '#10b981' : '#fbbf24'
                                    }}>
                                        {customer.has_purchased ? '💰 ซื้อแล้ว' : '⏳ ยังไม่ซื้อ'}
                                    </span>
                                </div>
                            </div>

                            <div style={{ fontSize: '13px', opacity: 0.7, marginBottom: '12px' }}>
                                <p>📱 แสกน: {customer.total_scans} ครั้ง</p>
                                {customer.first_taxi && (
                                    <p>🚕 จากรถ: {customer.first_taxi.taxi_code}</p>
                                )}
                                <p>📅 {new Date(customer.created_at).toLocaleDateString('th-TH')}</p>
                                {customer.purchase_note && (
                                    <p>📝 {customer.purchase_note}</p>
                                )}
                            </div>

                            <button
                                onClick={() => {
                                    setEditingCustomer(customer)
                                    setPurchaseNote(customer.purchase_note || '')
                                }}
                                style={{ ...styles.btn, ...styles.btnSecondary, width: '100%' }}
                            >
                                {customer.has_purchased ? '✏️ แก้ไข' : '💰 Mark ว่าซื้อแล้ว'}
                            </button>
                        </div>
                    ))}
                    {filteredCustomers.length === 0 && (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', opacity: 0.6 }}>
                            ไม่พบลูกค้า
                        </div>
                    )}
                </div>
            </main>

            {/* Edit Modal */}
            {editingCustomer && (
                <div style={styles.modal} onClick={() => setEditingCustomer(null)}>
                    <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <h2 style={{ marginBottom: '20px' }}>📝 Mark การซื้อ</h2>
                        <p style={{ marginBottom: '16px', opacity: 0.8 }}>
                            ลูกค้า: <strong>{editingCustomer.display_name || 'ไม่ทราบชื่อ'}</strong>
                        </p>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px' }}>หมายเหตุ (เช่น สินค้าที่ซื้อ, ยอด)</label>
                        <textarea
                            value={purchaseNote}
                            onChange={e => setPurchaseNote(e.target.value)}
                            placeholder="เช่น ซื้อครีม 2 ชิ้น 500 บาท"
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid rgba(255,255,255,0.2)',
                                background: 'rgba(255,255,255,0.1)',
                                color: 'white',
                                fontSize: '14px',
                                minHeight: '80px',
                                resize: 'vertical',
                                marginBottom: '20px',
                                boxSizing: 'border-box'
                            }}
                        />
                        <div style={{ display: 'flex', gap: '12px' }}>
                            {editingCustomer.has_purchased ? (
                                <>
                                    <button
                                        onClick={() => handleMarkPurchased(editingCustomer, false)}
                                        style={{ ...styles.btn, background: 'rgba(239, 68, 68, 0.3)', color: '#ef4444', flex: 1 }}
                                    >
                                        ❌ ยกเลิก Mark
                                    </button>
                                    <button
                                        onClick={() => handleMarkPurchased(editingCustomer, true)}
                                        style={{ ...styles.btn, ...styles.btnPrimary, flex: 1 }}
                                    >
                                        💾 บันทึก
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setEditingCustomer(null)}
                                        style={{ ...styles.btn, ...styles.btnSecondary, flex: 1 }}
                                    >
                                        ยกเลิก
                                    </button>
                                    <button
                                        onClick={() => handleMarkPurchased(editingCustomer, true)}
                                        style={{ ...styles.btn, ...styles.btnPrimary, flex: 1 }}
                                    >
                                        💰 Mark ซื้อแล้ว
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

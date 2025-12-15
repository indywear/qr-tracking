'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import QRCode from 'qrcode'

interface Taxi {
    id: string
    taxi_code: string
    plate_number: string | null
    driver_name: string | null
    notes: string | null
    is_active: boolean
    created_at: string
}

export default function TaxisPage() {
    const [taxis, setTaxis] = useState<Taxi[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingTaxi, setEditingTaxi] = useState<Taxi | null>(null)
    const [form, setForm] = useState({ taxi_code: '', plate_number: '', driver_name: '', notes: '' })
    const router = useRouter()

    useEffect(() => {
        checkAuth()
        fetchTaxis()
    }, [])

    const checkAuth = async () => {
        const res = await fetch('/api/auth')
        if (!res.ok) router.push('/admin')
    }

    const fetchTaxis = async () => {
        try {
            const res = await fetch('/api/taxis')
            const data = await res.json()
            setTaxis(data.taxis || [])
        } catch (error) {
            console.error('Failed to fetch taxis:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (editingTaxi) {
                await fetch(`/api/taxis/${editingTaxi.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(form)
                })
            } else {
                await fetch('/api/taxis', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(form)
                })
            }
            setShowModal(false)
            setEditingTaxi(null)
            setForm({ taxi_code: '', plate_number: '', driver_name: '', notes: '' })
            fetchTaxis()
        } catch (error) {
            console.error('Failed to save taxi:', error)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('ยืนยันการลบ?')) return
        try {
            await fetch(`/api/taxis/${id}`, { method: 'DELETE' })
            fetchTaxis()
        } catch (error) {
            console.error('Failed to delete taxi:', error)
        }
    }

    const handleToggleActive = async (taxi: Taxi) => {
        try {
            await fetch(`/api/taxis/${taxi.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_active: !taxi.is_active })
            })
            fetchTaxis()
        } catch (error) {
            console.error('Failed to toggle taxi:', error)
        }
    }

    const downloadQR = async (taxiCode: string) => {
        const baseUrl = window.location.origin
        const qrUrl = `${baseUrl}/t/${taxiCode}`

        try {
            const dataUrl = await QRCode.toDataURL(qrUrl, {
                width: 400,
                margin: 2,
                color: { dark: '#000000', light: '#ffffff' }
            })

            const link = document.createElement('a')
            link.download = `QR-${taxiCode}.png`
            link.href = dataUrl
            link.click()
        } catch (error) {
            console.error('Failed to generate QR:', error)
        }
    }

    const openEdit = (taxi: Taxi) => {
        setEditingTaxi(taxi)
        setForm({
            taxi_code: taxi.taxi_code,
            plate_number: taxi.plate_number || '',
            driver_name: taxi.driver_name || '',
            notes: taxi.notes || ''
        })
        setShowModal(true)
    }

    const openNew = () => {
        setEditingTaxi(null)
        setForm({ taxi_code: '', plate_number: '', driver_name: '', notes: '' })
        setShowModal(true)
    }

    const styles = {
        container: { minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', fontFamily: 'system-ui, sans-serif', color: 'white' },
        header: { padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' },
        main: { padding: '40px', maxWidth: '1200px', margin: '0 auto' },
        card: { background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.1)' },
        btn: { padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600' as const },
        btnPrimary: { background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white' },
        btnSecondary: { background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' },
        table: { width: '100%', borderCollapse: 'collapse' as const },
        th: { textAlign: 'left' as const, padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', opacity: 0.7, fontSize: '14px' },
        td: { padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)' },
        modal: { position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
        modalContent: { background: '#1a1a2e', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '450px', border: '1px solid rgba(255,255,255,0.1)' },
        input: { width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: '14px', marginBottom: '16px', boxSizing: 'border-box' as const },
        badge: { padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' as const }
    }

    if (loading) return <div style={{ ...styles.container, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p>กำลังโหลด...</p></div>

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Link href="/admin/dashboard" style={{ color: 'white', textDecoration: 'none', fontSize: '20px' }}>←</Link>
                    <h1 style={{ fontSize: '24px', fontWeight: '700' }}>🚕 จัดการรถ</h1>
                </div>
                <button onClick={openNew} style={{ ...styles.btn, ...styles.btnPrimary }}>+ เพิ่มรถใหม่</button>
            </header>

            <main style={styles.main}>
                <div style={styles.card}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>รหัสรถ</th>
                                <th style={styles.th}>ทะเบียน</th>
                                <th style={styles.th}>ชื่อคนขับ</th>
                                <th style={styles.th}>สถานะ</th>
                                <th style={styles.th}>จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {taxis.map(taxi => (
                                <tr key={taxi.id}>
                                    <td style={styles.td}><strong>{taxi.taxi_code}</strong></td>
                                    <td style={styles.td}>{taxi.plate_number || '-'}</td>
                                    <td style={styles.td}>{taxi.driver_name || '-'}</td>
                                    <td style={styles.td}>
                                        <span style={{
                                            ...styles.badge,
                                            background: taxi.is_active ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                            color: taxi.is_active ? '#10b981' : '#ef4444'
                                        }}>
                                            {taxi.is_active ? 'ใช้งาน' : 'ปิดใช้งาน'}
                                        </span>
                                    </td>
                                    <td style={styles.td}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => downloadQR(taxi.taxi_code)} style={{ ...styles.btn, ...styles.btnSecondary, padding: '6px 12px', fontSize: '13px' }}>📥 QR</button>
                                            <button onClick={() => openEdit(taxi)} style={{ ...styles.btn, ...styles.btnSecondary, padding: '6px 12px', fontSize: '13px' }}>✏️</button>
                                            <button onClick={() => handleToggleActive(taxi)} style={{ ...styles.btn, ...styles.btnSecondary, padding: '6px 12px', fontSize: '13px' }}>{taxi.is_active ? '🚫' : '✅'}</button>
                                            <button onClick={() => handleDelete(taxi.id)} style={{ ...styles.btn, ...styles.btnSecondary, padding: '6px 12px', fontSize: '13px', color: '#ef4444' }}>🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {taxis.length === 0 && (
                                <tr><td colSpan={5} style={{ ...styles.td, textAlign: 'center', padding: '40px', opacity: 0.6 }}>ยังไม่มีรถในระบบ</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>

            {showModal && (
                <div style={styles.modal} onClick={() => setShowModal(false)}>
                    <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <h2 style={{ marginBottom: '24px' }}>{editingTaxi ? '✏️ แก้ไขรถ' : '➕ เพิ่มรถใหม่'}</h2>
                        <form onSubmit={handleSubmit}>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', opacity: 0.8 }}>รหัสรถ *</label>
                            <input
                                value={form.taxi_code}
                                onChange={e => setForm({ ...form, taxi_code: e.target.value })}
                                placeholder="เช่น TAXI001"
                                required
                                disabled={!!editingTaxi}
                                style={{ ...styles.input, opacity: editingTaxi ? 0.5 : 1 }}
                            />
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', opacity: 0.8 }}>ทะเบียนรถ</label>
                            <input
                                value={form.plate_number}
                                onChange={e => setForm({ ...form, plate_number: e.target.value })}
                                placeholder="เช่น กข 1234"
                                style={styles.input}
                            />
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', opacity: 0.8 }}>ชื่อคนขับ</label>
                            <input
                                value={form.driver_name}
                                onChange={e => setForm({ ...form, driver_name: e.target.value })}
                                placeholder="ชื่อ นามสกุล"
                                style={styles.input}
                            />
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', opacity: 0.8 }}>หมายเหตุ</label>
                            <input
                                value={form.notes}
                                onChange={e => setForm({ ...form, notes: e.target.value })}
                                placeholder="หมายเหตุเพิ่มเติม"
                                style={styles.input}
                            />
                            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                <button type="button" onClick={() => setShowModal(false)} style={{ ...styles.btn, ...styles.btnSecondary, flex: 1 }}>ยกเลิก</button>
                                <button type="submit" style={{ ...styles.btn, ...styles.btnPrimary, flex: 1 }}>บันทึก</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

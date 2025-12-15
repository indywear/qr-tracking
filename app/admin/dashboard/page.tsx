'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Stats {
    totalTaxis: number
    totalCustomers: number
    totalScans: number
    purchasedCustomers: number
    todayScans: number
    conversionRate: string
}

interface TopTaxi {
    code: string
    plate: string
    count: number
}

export default function Dashboard() {
    const [stats, setStats] = useState<Stats | null>(null)
    const [topTaxis, setTopTaxis] = useState<TopTaxi[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        checkAuth()
        fetchStats()
    }, [])

    const checkAuth = async () => {
        const res = await fetch('/api/auth')
        if (!res.ok) {
            router.push('/admin')
        }
    }

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/stats')
            const data = await res.json()
            setStats(data.stats)
            setTopTaxis(data.topTaxis || [])
        } catch (error) {
            console.error('Failed to fetch stats:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        await fetch('/api/auth', { method: 'DELETE' })
        router.push('/admin')
    }

    const StatCard = ({ title, value, icon, color }: { title: string, value: string | number, icon: string, color: string }) => (
        <div style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid rgba(255,255,255,0.1)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginBottom: '8px' }}>{title}</p>
                    <p style={{ color: 'white', fontSize: '32px', fontWeight: '700' }}>{value}</p>
                </div>
                <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px'
                }}>
                    {icon}
                </div>
            </div>
        </div>
    )

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                color: 'white'
            }}>
                <p>กำลังโหลด...</p>
            </div>
        )
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            fontFamily: 'system-ui, sans-serif',
            color: 'white'
        }}>
            {/* Header */}
            <header style={{
                padding: '20px 40px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}>
                <h1 style={{ fontSize: '24px', fontWeight: '700' }}>🚕 QR Tracking Dashboard</h1>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <Link href="/admin/taxis" style={{ color: 'white', textDecoration: 'none', opacity: 0.8 }}>จัดการรถ</Link>
                    <Link href="/admin/customers" style={{ color: 'white', textDecoration: 'none', opacity: 0.8 }}>ลูกค้า</Link>
                    <button onClick={handleLogout} style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: 'transparent',
                        color: 'white',
                        cursor: 'pointer'
                    }}>
                        ออกจากระบบ
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
                {/* Stats Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '20px',
                    marginBottom: '40px'
                }}>
                    <StatCard title="แสกนวันนี้" value={stats?.todayScans || 0} icon="📱" color="linear-gradient(135deg, #667eea, #764ba2)" />
                    <StatCard title="แสกนทั้งหมด" value={stats?.totalScans || 0} icon="📊" color="linear-gradient(135deg, #11998e, #38ef7d)" />
                    <StatCard title="ลูกค้าทั้งหมด" value={stats?.totalCustomers || 0} icon="👥" color="linear-gradient(135deg, #fc4a1a, #f7b733)" />
                    <StatCard title="ซื้อแล้ว" value={stats?.purchasedCustomers || 0} icon="💰" color="linear-gradient(135deg, #ee0979, #ff6a00)" />
                    <StatCard title="รถที่ใช้งาน" value={stats?.totalTaxis || 0} icon="🚕" color="linear-gradient(135deg, #4facfe, #00f2fe)" />
                    <StatCard title="Conversion Rate" value={`${stats?.conversionRate || 0}%`} icon="📈" color="linear-gradient(135deg, #a18cd1, #fbc2eb)" />
                </div>

                {/* Top Taxis */}
                <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>🏆 Top 10 รถที่มีคนแสกนมากที่สุด</h2>
                    {topTaxis.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {topTaxis.map((taxi, index) => (
                                <div key={taxi.code} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    padding: '12px 16px',
                                    background: 'rgba(255,255,255,0.05)',
                                    borderRadius: '8px'
                                }}>
                                    <span style={{
                                        width: '28px',
                                        height: '28px',
                                        borderRadius: '50%',
                                        background: index < 3 ? 'linear-gradient(135deg, #ffd700, #ff8c00)' : 'rgba(255,255,255,0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '14px',
                                        fontWeight: '600'
                                    }}>
                                        {index + 1}
                                    </span>
                                    <span style={{ flex: 1 }}>{taxi.code}</span>
                                    <span style={{ opacity: 0.6 }}>{taxi.plate}</span>
                                    <span style={{
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        background: 'rgba(102, 126, 234, 0.2)',
                                        color: '#667eea',
                                        fontSize: '14px',
                                        fontWeight: '600'
                                    }}>
                                        {taxi.count} ครั้ง
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ opacity: 0.6, textAlign: 'center', padding: '40px' }}>ยังไม่มีข้อมูลการแสกน</p>
                    )}
                </div>
            </main>
        </div>
    )
}

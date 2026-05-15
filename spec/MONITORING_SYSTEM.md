# Monitoring System - API Documentation

## Overview
Sistem monitoring telah dikonfigurasi untuk mengambil data secara dinamis dari database. Data ditampilkan di mobile app untuk apoteker memonitor kepatuhan pasien.

## Available Endpoints

### 1. Today's Summary
**Endpoint:** `GET /monitoring/today-summary`

**Response:**
```json
{
  "today": {
    "total": 15,        // Total jadwal obat hari ini
    "taken": 12,        // Diminum dengan patuh
    "missed": 2,        // Tidak patuh/terlewat
    "pending": 1        // Belum ada input
  },
  "alerts": {
    "count": 2,
    "patients": [
      {
        "id": 1,
        "nama": "Budi Santoso",
        "last_status": "terlewat"
      }
    ]
  },
  "recent_activity": [
    {
      "id": 5,
      "title": "Pasien Baru: Siti Aminah",
      "time": "2 jam yang lalu",
      "type": "new_patient"
    }
  ]
}
```

### 2. Weekly Monitoring
**Endpoint:** `GET /monitoring/mingguan`

**Query Parameters:**
- `pasien_id` (required): ID pasien
- `start_date` (required): Tanggal mulai minggu (format: YYYY-MM-DD)

**Response:**
```json
{
  "minggu_mulai": "2026-05-12",
  "minggu_akhir": "2026-05-18",
  "obat": {
    "logs": {
      "2026-05-12": [
        {
          "id": 1,
          "status": "diminum",
          "skor": 1,
          "waktu": "08:00"
        }
      ]
    },
    "summary": {
      "total_skor": 15,
      "total_logs": 18,
      "persentase": 83.33
    }
  },
  "cairan": { /* similar structure */ }
}
```

### 3. Monthly Monitoring
**Endpoint:** `GET /monitoring/bulanan`

**Query Parameters:**
- `pasien_id` (required): ID pasien
- `month` (required): Bulan (0-11, dimana 0 = Januari)
- `year` (required): Tahun

**Response:**
```json
{
  "bulan": "Mei",
  "tahun": 2026,
  "minggu": [
    {
      "minggu_ke": 1,
      "mulai": "2026-05-01",
      "akhir": "2026-05-07",
      "obat": {
        "score": 15,
        "count": 18,
        "persentase": 83.33,
        "status": "PATUH"
      },
      "cairan": { /* similar */ }
    }
  ]
}
```

### 4. Patient List (with Adherence)
**Endpoint:** `GET /pasien`

**Response:**
```json
[
  {
    "id": 1,
    "nama": "Budi Santoso",
    "usia": 45,
    "reminder_obat_count": 5,
    "logs_obat": [
      {
        "id": 1,
        "status": "diminum",
        "skor": 1,
        "tanggal": "2026-05-12"
      }
    ],
    "rekapan_obat": [
      {
        "status_kepatuhan": "PATUH"
      }
    ]
  }
]
```

Status kepatuhan dihitung dinamis:
- **PATUH**: Score >= 80%
- **TIDAK_PATUH**: Score < 80% (tapi ada data)
- **BELUM_ADA_DATA**: Belum ada log konsumsi

## Frontend Implementation

### Hooks
#### useMonitoring()
Mengelola semua monitoring API calls:

```javascript
const { 
  todayData,           // Data summary hari ini
  weeklyData,          // Data mingguan pasien
  monthlyData,         // Data bulanan pasien
  isLoading,           // Loading state
  error,               // Error message
  fetchTodaySummary,   // Function
  fetchWeeklyMonitoring,
  fetchMonthlyMonitoring,
  logConsumption
} = useMonitoring();
```

#### usePatients()
Fetch daftar pasien dengan adherence status:

```javascript
const { 
  patients,      // Array pasien dengan rekapan_obat[0].status_kepatuhan
  isLoading,     // Loading state
  fetchPatients  // Function
} = usePatients();
```

### Screens

#### MonitoringListScreen
- Menampilkan daftar semua pasien
- Summary cards: Total, Patuh, Tidak Patuh
- Alert section dari today-summary
- Searchable patient list
- **Semua data diambil dari database secara dinamis**

#### DashboardHomeScreen
- Main card dengan statistik hari ini (dari `/monitoring/today-summary`)
- Alert patients yang membutuhkan perhatian
- Recent activity dari pasien baru
- **Semua data diambil dari database secara dinamis**

## Data Flow

```
Backend (Database)
    ↓
API Controllers
├── PasienController/index → GET /pasien
├── MonitoringController/todaySummary → GET /monitoring/today-summary
├── MonitoringController/weeklyMonitoring → GET /monitoring/mingguan
└── MonitoringController/monthlyMonitoring → GET /monitoring/bulanan
    ↓
Frontend Hooks
├── usePatients()
└── useMonitoring()
    ↓
Screens & Components
├── MonitoringListScreen
├── DashboardHomeScreen
└── PatientDetailScreen
```

## Status Kepatuhan - Kalkulasi Dinamis

Status kepatuhan dihitung dari log consumption:
- Score per log: 1 (diminum) atau 0 (terlewat)
- Percentage: (Total Score / Total Logs) × 100
- Status:
  - PATUH: >= 80%
  - TIDAK_PATUH: < 80%
  - BELUM_ADA_DATA: Tidak ada logs

## Best Practices

1. **Always use hooks** untuk API calls
2. **Implement error handling** di setiap screen
3. **Use RefreshControl** untuk manual refresh
4. **Cache data** dengan useCallback
5. **Validate params** sebelum API call

## Future Enhancements

- [ ] Real-time updates menggunakan WebSocket
- [ ] Offline mode dengan local caching
- [ ] Detailed adherence analytics per medication
- [ ] Predictive alerts untuk pasien yang berisiko
- [ ] Export reports PDF/Excel

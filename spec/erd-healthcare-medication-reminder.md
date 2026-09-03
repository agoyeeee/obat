# Healthcare Medication Reminder System - ERD

```mermaid
erDiagram
    %% =============================
    %% ENTITIES
    %% =============================
    apoteker {
        int id PK
        string nama
        string no_hp
        string password
    }

    pasien {
        int id PK
        string nama
        int usia
        string jenis_kelamin
        float berat_badan
        date tgl_diagnosa
    }

    kontak_pasien {
        int id PK
        int pasien_id FK
        int apoteker_id FK
    }

    obat {
        int id PK
        string nama_obat
        string klasifikasi
        string indikasi
        json dosis_inisiasi
        string dosis_lazim
        string dosis_target "nullable"
        int frekuensi_default "nullable"
        string frekuensi_keterangan "nullable"
        string kontraindikasi
        string efek_samping
        string monitoring
        string cara_pemakaian
    }

    merk {
        int id PK
        string nama_merk
        int obat_id FK
    }

    waktu_konsumsi {
        int id PK
        string label_waktu
        string jam
        string frekuensi
    }

    reminder_obat {
        int id PK
        int pasien_id FK
        int obat_id FK
        int merk_id FK "nullable"
        string dosis
        string sediaan
        int waktu_konsumsi_id FK
        int jumlah_obat
        string cara_pemakaian
        int skor_kepatuhan
    }

    reminder_cairan {
        int id PK
        int pasien_id FK
        int jumlah_ml
        string waktu
        int skor_kepatuhan
    }

    rekapan_obat {
        int id PK
        int pasien_id FK
        date tanggal
        int total_skor
    }

    rekapan_cairan {
        int id PK
        int pasien_id FK
        date tanggal
        int total_skor
    }

    kuisioner {
        int id PK
        string pertanyaan
        string tipe
    }

    rekap_kuisioner {
        int id PK
        int pasien_id FK
        date tanggal
        int total_skor
    }

    jawaban_kuisioner {
        int id PK
        int rekap_kuisioner_id FK
        int kuisioner_id FK
        string jawaban
        int skor
    }

    %% =============================
    %% RELATIONSHIPS
    %% =============================
    pasien ||--o{ reminder_obat : has
    pasien ||--o{ reminder_cairan : has
    pasien ||--o{ rekapan_obat : has
    pasien ||--o{ rekapan_cairan : has
    pasien ||--o{ rekap_kuisioner : has

    rekap_kuisioner ||--o{ jawaban_kuisioner : contains
    kuisioner ||--o{ jawaban_kuisioner : answered_in

    obat ||--o{ merk : has
    obat ||--o{ reminder_obat : used_in
    merk ||--o{ reminder_obat : optional_brand_for
    waktu_konsumsi ||--o{ reminder_obat : schedules

    pasien ||--o{ kontak_pasien : linked
    apoteker ||--o{ kontak_pasien : linked

    %% =============================
    %% VISUAL STYLING (PASTEL)
    %% =============================
    style apoteker fill:#FFF4E6,stroke:#B08968,stroke-width:1px,color:#2D2A26
    style pasien fill:#E8F7FF,stroke:#5A8CA8,stroke-width:1px,color:#1F2D3A
    style kontak_pasien fill:#F3E8FF,stroke:#7E5A9B,stroke-width:1px,color:#2D2240

    style obat fill:#EAFBE7,stroke:#6FA46A,stroke-width:1px,color:#213122
    style merk fill:#F9F7D9,stroke:#B7A74B,stroke-width:1px,color:#3C3617
    style waktu_konsumsi fill:#E9F0FF,stroke:#6B81B8,stroke-width:1px,color:#1F2C4D

    style reminder_obat fill:#FFEAF2,stroke:#B86A8D,stroke-width:1px,color:#3E1F2E
    style reminder_cairan fill:#E8FFF7,stroke:#5FA08B,stroke-width:1px,color:#1D3A31

    style rekapan_obat fill:#FFF1F1,stroke:#B87474,stroke-width:1px,color:#3A1F1F
    style rekapan_cairan fill:#F1FFF1,stroke:#73A973,stroke-width:1px,color:#1F381F

    style kuisioner fill:#F2EEFF,stroke:#7964B0,stroke-width:1px,color:#2A2146
    style rekap_kuisioner fill:#EAF2FF,stroke:#6384B7,stroke-width:1px,color:#1E2A42
    style jawaban_kuisioner fill:#FFF7EC,stroke:#B88D57,stroke-width:1px,color:#3A2C1A
```

## Legend

- PK: Primary Key (identifier unik untuk setiap record).
- FK: Foreign Key (kolom referensi ke PK pada tabel lain).
- Nullable FK: FK yang boleh kosong (contoh: reminder_obat.merk_id).

Relationship symbols (Mermaid ER):

- || : exactly one
- o| : zero or one
- |{ : one or many
- o{ : zero or many

Cardinality examples used:

- 1:N represented as `||--o{`
- M:N represented via junction table `kontak_pasien`:
  - `pasien ||--o{ kontak_pasien`
  - `apoteker ||--o{ kontak_pasien`

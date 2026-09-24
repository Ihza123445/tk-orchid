-- CreateTable
CREATE TABLE "SiteSetting" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "HeroSlide" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "eyebrow" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "accent" TEXT,
    "description" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "imageAlt" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "GalleryItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Facility" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Testimonial" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "relation" TEXT NOT NULL,
    "quote" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Faq" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- Konten awal website (lihat src/lib/cms/defaults.ts)
INSERT INTO "HeroSlide" ("eyebrow", "title", "accent", "description", "image", "imageAlt", "sortOrder", "isActive", "createdAt", "updatedAt") VALUES ('Sekolah pertama yang terasa seperti rumah', 'Tempat si kecil', 'tumbuh bahagia.', 'Belajar melalui bermain, bergerak, berkarya, dan berteman dalam lingkungan yang hangat, aman, dan penuh perhatian.', 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1920&q=80', 'Anak tersenyum saat mengikuti kegiatan kreatif', 0, 1, '2026-09-24T00:00:00.000+00:00', '2026-09-24T00:00:00.000+00:00');
INSERT INTO "HeroSlide" ("eyebrow", "title", "accent", "description", "image", "imageAlt", "sortOrder", "isActive", "createdAt", "updatedAt") VALUES ('Kurikulum Merdeka untuk anak usia dini', 'Setiap rasa ingin tahu', 'punya ruang.', 'Guru mendampingi anak menemukan jawaban lewat cerita, proyek sederhana, seni, musik, dan pengalaman sehari-hari.', 'https://images.unsplash.com/photo-1544776193-352d25ca82cd?auto=format&fit=crop&w=900&q=75', 'Guru mendampingi anak-anak belajar bersama', 1, 1, '2026-09-24T00:00:00.000+00:00', '2026-09-24T00:00:00.000+00:00');
INSERT INTO "HeroSlide" ("eyebrow", "title", "accent", "description", "image", "imageAlt", "sortOrder", "isActive", "createdAt", "updatedAt") VALUES ('Penerimaan murid baru TK Orchid', 'Awal yang hangat untuk', 'masa depan cerah.', 'Kenali program kami, jadwalkan kunjungan, lalu pilih langkah belajar terbaik untuk putra-putri Anda.', 'https://images.unsplash.com/photo-1607453998774-d533f65dac99?auto=format&fit=crop&w=900&q=75', 'Anak-anak tertawa dan berekspresi bersama', 2, 1, '2026-09-24T00:00:00.000+00:00', '2026-09-24T00:00:00.000+00:00');
INSERT INTO "Facility" ("title", "description", "image", "sortOrder", "isActive", "createdAt", "updatedAt") VALUES ('Ruang kelas tematik', 'Meja dan area bermain mudah diatur ulang untuk proyek individu maupun kelompok.', 'https://images.unsplash.com/photo-1544776193-352d25ca82cd?auto=format&fit=crop&w=900&q=75', 0, 1, '2026-09-24T00:00:00.000+00:00', '2026-09-24T00:00:00.000+00:00');
INSERT INTO "Facility" ("title", "description", "image", "sortOrder", "isActive", "createdAt", "updatedAt") VALUES ('Area bermain aktif', 'Anak berlari, melompat, dan melatih koordinasi tubuh dengan leluasa.', 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=75', 1, 1, '2026-09-24T00:00:00.000+00:00', '2026-09-24T00:00:00.000+00:00');
INSERT INTO "Facility" ("title", "description", "image", "sortOrder", "isActive", "createdAt", "updatedAt") VALUES ('Pojok literasi', 'Ruang tenang untuk membaca gambar, mendengar cerita, dan bercakap.', 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=800&q=75', 2, 1, '2026-09-24T00:00:00.000+00:00', '2026-09-24T00:00:00.000+00:00');
INSERT INTO "Facility" ("title", "description", "image", "sortOrder", "isActive", "createdAt", "updatedAt") VALUES ('Studio seni', 'Area eksplorasi cat, tekstur, bentuk, dan bahan-bahan terbuka.', 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&w=800&q=75', 3, 1, '2026-09-24T00:00:00.000+00:00', '2026-09-24T00:00:00.000+00:00');
INSERT INTO "Facility" ("title", "description", "image", "sortOrder", "isActive", "createdAt", "updatedAt") VALUES ('Ruang musik & gerak', 'Tempat anak mengenal irama, suara, ekspresi, dan gerakan.', 'https://images.unsplash.com/photo-1607453998774-d533f65dac99?auto=format&fit=crop&w=900&q=75', 4, 1, '2026-09-24T00:00:00.000+00:00', '2026-09-24T00:00:00.000+00:00');
INSERT INTO "Facility" ("title", "description", "image", "sortOrder", "isActive", "createdAt", "updatedAt") VALUES ('Sentra bermain konstruktif', 'Balok dan permainan manipulatif untuk melatih nalar serta imajinasi ruang.', 'https://images.unsplash.com/photo-1587691592099-24045742c181?auto=format&fit=crop&w=1920&q=80', 5, 1, '2026-09-24T00:00:00.000+00:00', '2026-09-24T00:00:00.000+00:00');
INSERT INTO "GalleryItem" ("title", "category", "image", "sortOrder", "isActive", "createdAt", "updatedAt") VALUES ('Hari ekspresi & face painting', 'Acara', 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1920&q=80', 0, 1, '2026-09-24T00:00:00.000+00:00', '2026-09-24T00:00:00.000+00:00');
INSERT INTO "GalleryItem" ("title", "category", "image", "sortOrder", "isActive", "createdAt", "updatedAt") VALUES ('Belajar tematik bersama guru', 'Kelas', 'https://images.unsplash.com/photo-1544776193-352d25ca82cd?auto=format&fit=crop&w=900&q=75', 1, 1, '2026-09-24T00:00:00.000+00:00', '2026-09-24T00:00:00.000+00:00');
INSERT INTO "GalleryItem" ("title", "category", "image", "sortOrder", "isActive", "createdAt", "updatedAt") VALUES ('Berlari di area bermain', 'Bermain', 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=75', 2, 1, '2026-09-24T00:00:00.000+00:00', '2026-09-24T00:00:00.000+00:00');
INSERT INTO "GalleryItem" ("title", "category", "image", "sortOrder", "isActive", "createdAt", "updatedAt") VALUES ('Menghias batu warna-warni', 'Seni', 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&w=800&q=75', 3, 1, '2026-09-24T00:00:00.000+00:00', '2026-09-24T00:00:00.000+00:00');
INSERT INTO "GalleryItem" ("title", "category", "image", "sortOrder", "isActive", "createdAt", "updatedAt") VALUES ('Membangun menara balok', 'Bermain', 'https://images.unsplash.com/photo-1587691592099-24045742c181?auto=format&fit=crop&w=1920&q=80', 4, 1, '2026-09-24T00:00:00.000+00:00', '2026-09-24T00:00:00.000+00:00');
INSERT INTO "GalleryItem" ("title", "category", "image", "sortOrder", "isActive", "createdAt", "updatedAt") VALUES ('Melukis poster bersama', 'Seni', 'https://images.unsplash.com/photo-1571210862729-78a52d3779a2?auto=format&fit=crop&w=800&q=75', 5, 1, '2026-09-24T00:00:00.000+00:00', '2026-09-24T00:00:00.000+00:00');
INSERT INTO "GalleryItem" ("title", "category", "image", "sortOrder", "isActive", "createdAt", "updatedAt") VALUES ('Suasana kelas pagi hari', 'Kelas', 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1920&q=80', 6, 1, '2026-09-24T00:00:00.000+00:00', '2026-09-24T00:00:00.000+00:00');
INSERT INTO "GalleryItem" ("title", "category", "image", "sortOrder", "isActive", "createdAt", "updatedAt") VALUES ('Pentas akhir semester', 'Acara', 'https://images.unsplash.com/photo-1607453998774-d533f65dac99?auto=format&fit=crop&w=900&q=75', 7, 1, '2026-09-24T00:00:00.000+00:00', '2026-09-24T00:00:00.000+00:00');
INSERT INTO "GalleryItem" ("title", "category", "image", "sortOrder", "isActive", "createdAt", "updatedAt") VALUES ('Pojok baca bersama keluarga', 'Kelas', 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=800&q=75', 8, 1, '2026-09-24T00:00:00.000+00:00', '2026-09-24T00:00:00.000+00:00');
INSERT INTO "Testimonial" ("name", "relation", "quote", "sortOrder", "isActive", "createdAt", "updatedAt") VALUES ('Bunda Alya', 'Orang tua murid TK B', 'Anak saya yang dulu pemalu sekarang berani bercerita di depan kelas. Gurunya sabar sekali dan selalu memberi kabar perkembangan.', 0, 1, '2026-09-24T00:00:00.000+00:00', '2026-09-24T00:00:00.000+00:00');
INSERT INTO "Testimonial" ("name", "relation", "quote", "sortOrder", "isActive", "createdAt", "updatedAt") VALUES ('Ayah Raka', 'Orang tua murid TK A', 'Laporan perkembangan lewat portal sangat membantu. Kami tahu apa yang dipelajari anak dan bisa melanjutkannya di rumah.', 1, 1, '2026-09-24T00:00:00.000+00:00', '2026-09-24T00:00:00.000+00:00');
INSERT INTO "Testimonial" ("name", "relation", "quote", "sortOrder", "isActive", "createdAt", "updatedAt") VALUES ('Mama Kinan', 'Orang tua murid Kelompok Bermain', 'Minggu pertama Kinan menangis, minggu kedua ia justru tidak mau pulang. Suasana sekolahnya hangat seperti rumah.', 2, 1, '2026-09-24T00:00:00.000+00:00', '2026-09-24T00:00:00.000+00:00');
INSERT INTO "Testimonial" ("name", "relation", "quote", "sortOrder", "isActive", "createdAt", "updatedAt") VALUES ('Bunda Zahra', 'Orang tua alumni', 'Zahra masuk SD dengan percaya diri, mandiri, dan senang membaca. Bekal dari TK Orchid terasa sekali.', 3, 1, '2026-09-24T00:00:00.000+00:00', '2026-09-24T00:00:00.000+00:00');
INSERT INTO "Testimonial" ("name", "relation", "quote", "sortOrder", "isActive", "createdAt", "updatedAt") VALUES ('Papa Gibran', 'Orang tua murid TK B', 'Kegiatan market day dan field trip-nya seru. Anak belajar berhitung dan berani berinteraksi tanpa merasa sedang belajar.', 4, 1, '2026-09-24T00:00:00.000+00:00', '2026-09-24T00:00:00.000+00:00');
INSERT INTO "Faq" ("question", "answer", "category", "sortOrder", "isActive", "createdAt", "updatedAt") VALUES ('Berapa usia minimal untuk mendaftar?', 'Kelompok Bermain menerima anak usia 3 tahun, TK A usia 4 tahun, dan TK B usia 5 tahun per 1 Juli tahun ajaran berjalan.', 'Pendaftaran', 0, 1, '2026-09-24T00:00:00.000+00:00', '2026-09-24T00:00:00.000+00:00');
INSERT INTO "Faq" ("question", "answer", "category", "sortOrder", "isActive", "createdAt", "updatedAt") VALUES ('Apakah bisa berkunjung sebelum mendaftar?', 'Sangat bisa. Hubungi kami melalui WhatsApp untuk menjadwalkan kunjungan sekolah dan trial class gratis bersama si kecil.', 'Pendaftaran', 1, 1, '2026-09-24T00:00:00.000+00:00', '2026-09-24T00:00:00.000+00:00');
INSERT INTO "Faq" ("question", "answer", "category", "sortOrder", "isActive", "createdAt", "updatedAt") VALUES ('Dokumen apa saja yang perlu disiapkan?', 'Fotokopi akta kelahiran, kartu keluarga, KTP orang tua, pas foto anak, dan catatan kesehatan/imunisasi bila ada.', 'Pendaftaran', 2, 1, '2026-09-24T00:00:00.000+00:00', '2026-09-24T00:00:00.000+00:00');
INSERT INTO "Faq" ("question", "answer", "category", "sortOrder", "isActive", "createdAt", "updatedAt") VALUES ('Kurikulum apa yang digunakan?', 'Kurikulum Merdeka PAUD yang diterjemahkan menjadi pembelajaran tematik berbasis bermain, proyek sederhana, dan pembiasaan karakter.', 'Pembelajaran', 3, 1, '2026-09-24T00:00:00.000+00:00', '2026-09-24T00:00:00.000+00:00');
INSERT INTO "Faq" ("question", "answer", "category", "sortOrder", "isActive", "createdAt", "updatedAt") VALUES ('Berapa jumlah anak dalam satu kelas?', 'Kami menjaga kelas tetap kecil: maksimal 12 anak untuk Kelompok Bermain dan 15 anak untuk TK A/B, dengan dua pendamping per kelas.', 'Pembelajaran', 4, 1, '2026-09-24T00:00:00.000+00:00', '2026-09-24T00:00:00.000+00:00');
INSERT INTO "Faq" ("question", "answer", "category", "sortOrder", "isActive", "createdAt", "updatedAt") VALUES ('Apakah anak diajari membaca dan menulis?', 'Literasi dan numerasi awal dikenalkan secara bertahap dan menyenangkan sesuai kesiapan anak, tanpa paksaan dan tanpa drilling.', 'Pembelajaran', 5, 1, '2026-09-24T00:00:00.000+00:00', '2026-09-24T00:00:00.000+00:00');
INSERT INTO "Faq" ("question", "answer", "category", "sortOrder", "isActive", "createdAt", "updatedAt") VALUES ('Bagaimana orang tua memantau perkembangan anak?', 'Melalui portal keluarga TK Orchid: presensi, laporan perkembangan, pengumuman, dan tagihan dapat diakses kapan saja.', 'Keluarga', 6, 1, '2026-09-24T00:00:00.000+00:00', '2026-09-24T00:00:00.000+00:00');
INSERT INTO "Faq" ("question", "answer", "category", "sortOrder", "isActive", "createdAt", "updatedAt") VALUES ('Apakah tersedia antar-jemput atau katering?', 'Informasi layanan tambahan dapat ditanyakan langsung ke kantor sekolah karena menyesuaikan kebutuhan tiap tahun ajaran.', 'Keluarga', 7, 1, '2026-09-24T00:00:00.000+00:00', '2026-09-24T00:00:00.000+00:00');
INSERT INTO "Faq" ("question", "answer", "category", "sortOrder", "isActive", "createdAt", "updatedAt") VALUES ('Bagaimana sistem pembayaran biaya sekolah?', 'Tagihan diterbitkan melalui sistem sekolah dan dapat dipantau di portal keluarga. Rincian biaya dijelaskan saat konsultasi pendaftaran.', 'Keluarga', 8, 1, '2026-09-24T00:00:00.000+00:00', '2026-09-24T00:00:00.000+00:00');

export function rowToBook(row) {
  if (!row) return null;
  return {
    id: row.id,
    judul: row.judul,
    penulis: row.penulis,
    isbn: row.isbn,
    penerbit: row.penerbit,
    tahunTerbit: row.tahun_terbit,
    kategori: row.kategori,
    jumlahEksemplar: row.jumlah_eksemplar,
    lokasiRak: row.lokasi_rak,
    kondisi: row.kondisi,
    status: row.status,
    deskripsi: row.deskripsi ?? '',
    cover: row.cover ?? '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

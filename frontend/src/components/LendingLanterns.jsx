import { Link } from 'react-router-dom';
import { Lamp, Clock, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LendingLanterns({ recentBooks = [] }) {
  // We showcase recent active entries as hanging sanctuary lanterns
  const displayItems = recentBooks.slice(0, 4);

  return (
    <div className="sanctuary-card p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-forest-sage/15">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#101513] border border-forest-amber/30 text-forest-amber">
            <Lamp size={18} className="animate-bio-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-mono tracking-widest text-forest-amber uppercase">
              Lending & Circulation Branch
            </span>
            <h3 className="font-serif text-lg font-bold text-forest-mist">
              Lentera Sirkulasi Arsip
            </h3>
          </div>
        </div>
        <span className="text-[11px] font-mono text-forest-sage bg-[#101513] px-2.5 py-1 rounded border border-forest-sage/15">
          Filamen Aktif
        </span>
      </div>

      {/* Visual Organic Forest Branch Wire */}
      <div className="relative pt-2 pb-1">
        {/* Branch line */}
        <div className="absolute top-0 left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-[#8FA294]/30 to-transparent" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-3">
          {displayItems.length === 0 ? (
            <div className="col-span-full py-8 text-center text-xs text-forest-sage">
              Seluruh lentera tenang. Belum ada sirkulasi peminjaman aktif.
            </div>
          ) : (
            displayItems.map((book, idx) => (
              <div
                key={book.id || idx}
                className="relative group p-4 rounded-xl bg-[#101513]/70 border border-forest-sage/15 hover:border-forest-amber/40 transition-all duration-300 space-y-3"
              >
                {/* Lantern Cord from Branch */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-[1px] h-3 bg-forest-sage/40" />

                {/* Lantern Head with glowing Amber filament */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="relative flex items-center justify-center h-6 w-6 rounded-full bg-forest-moss/80 border border-forest-amber/40">
                      <span className="h-2 w-2 rounded-full bg-forest-amber animate-bio-pulse" />
                      <span className="absolute inset-0 rounded-full bg-forest-amber/20 blur-sm animate-pulse" />
                    </div>
                    <span className="font-mono text-[10px] text-forest-amber tracking-wider">
                      LENTERA #{idx + 1}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-forest-sage bg-forest-lichen/60 px-1.5 py-0.5 rounded">
                    {book.status || 'Tersedia'}
                  </span>
                </div>

                {/* Book Details */}
                <div>
                  <Link
                    to={`/koleksi/${book.id}`}
                    className="font-serif font-bold text-sm text-forest-mist hover:text-forest-amber transition-colors line-clamp-1 block"
                  >
                    {book.judul}
                  </Link>
                  <p className="text-[11px] text-forest-dew/90 truncate mt-0.5">
                    {book.penulis}
                  </p>
                </div>

                {/* Shelf & Condition Info */}
                <div className="pt-2 border-t border-forest-sage/15 flex items-center justify-between text-[11px] font-mono text-forest-sage font-medium">
                  <span>{book.lokasiRak}</span>
                  <span className="text-forest-amber font-semibold">{book.jumlahEksemplar} eks.</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom';
import Layout from './components/Layout';
import { ToastHost } from './components/Toast';
import BookForm from './components/BookForm';
import Dashboard from './pages/Dashboard';
import Collection from './pages/Collection';
import BookDetail from './pages/BookDetail';
import Categories from './pages/Categories';
import Racks from './pages/Racks';

export default function App() {
  return (
    <BrowserRouter>
      <ToastHost />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="koleksi" element={<Collection />} />
          <Route path="koleksi/:id" element={<BookDetail />} />
          <Route path="tambah" element={<BookForm />} />
          <Route path="edit/:id" element={<BookFormWrapper />} />
          <Route path="kategori" element={<Categories />} />
          <Route path="rak" element={<Racks />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function BookFormWrapper() {
  const { id } = useParams();
  return <BookForm bookId={id} />;
}

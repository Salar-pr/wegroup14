import { BrowserRouter, Route, Routes } from 'react-router-dom';

function HomePage() {
  return <main><h1>University Hub</h1><p>Frontend starter is ready.</p></main>;
}

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}

import { createRoot } from 'react-dom/client';
import App from '@/views/App/App.tsx';
import { GlobalProvider } from '@/store/global/Global.context';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import '@/assets/styles/index.css';
import ScrumPoker from '@/views/ScrumPoker/ScrumPoker.tsx';

interface RouteConfig {
  path: string;
  element: React.ReactNode;
}

export const routes: RouteConfig[] = [
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/room/:roomId',
    element: <ScrumPoker />,
  },
];

createRoot(document.getElementById('root')!).render(
  <BrowserRouter future={{ v7_startTransition: true }}>
    <GlobalProvider>
      <Routes>
        {routes.map((route) => (
          <Route key={route.path} {...route} />
        ))}
      </Routes>
    </GlobalProvider>
  </BrowserRouter>,
);

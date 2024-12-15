import React, { ReactNode, useEffect } from 'react';
import Header from './Header/Header';

interface ILayoutProps {
  children: ReactNode;
  title?: string;
}

const Layout: React.FC<ILayoutProps> = (props) => {
  useEffect(() => {
    document.title = props.title || 'Sword Estimator';
  }, []);

  return (
    <div className={`flex flex-col min-h-screen`}>
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {props.children}
      </main>
      <footer className="bg-background border-t">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Sword Estimator. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Layout;

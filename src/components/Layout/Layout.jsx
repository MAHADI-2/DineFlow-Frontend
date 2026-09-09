import Navbar from './navAndFooter/Navber';
import Footer from './navAndFooter/Footer';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
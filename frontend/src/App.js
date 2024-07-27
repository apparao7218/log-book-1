import './App.css';
import Footer from './pages/footer/footer';
import Header from './pages/header/header';
import Home from './pages/home/home';

function App() {
  return (
    <>
      <Header />
      <div className="content">
        <Home />
      </div>
      <Footer />
    </>
  );
}

export default App;

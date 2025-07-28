import '../styles/home.css';

const Home = () => {
  return (
    <main className="home-container">
      {/* Aquí puedes dejar solo una portada, imagen o mensaje de bienvenida si lo deseas */}
      <div className="home-content">
        <div className="home-text-box">
          <div className="home-text-bg-auto">
            <h1 className="home-title">Bienvenido</h1>
            <h2 className="home-subtitle">condominio</h2>
          </div>
        </div>
      </div>
      <div className="home-images">
        <div className="home-image"></div>
        <div className="home-image2"></div>
      </div>
    </main>
  );
};

export default Home;
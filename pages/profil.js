import Link from "next/link";

const ANIME_BANNER =
  "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1600&q=80";

const ANIME_AVATAR =
  "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?auto=format&fit=crop&w=500&q=80";

export default function Profile() {
  return (
    <div className="page">
      <nav className="nav">
        <div className="logo">R_hmt ofc</div>

        <div className="navlinks">
          <Link href="/" className="navlink">
            Downloader
          </Link>
          <Link href="/profile" className="navlink active">
            Profile
          </Link>
        </div>
      </nav>

      <div className="banner" style={{ backgroundImage: `url(${ANIME_BANNER})` }}>
        <div className="overlay"></div>

        <div className="profileBox">
          <img src={ANIME_AVATAR} className="avatar" alt="avatar" />

          <h1 className="name">R_hmt</h1>
          <p className="role">Anime Dev Persona • Mobile Developer</p>

          <div className="bio">
            <p>
              I build tools from a phone.
              <br />
              I reverse systems just to understand them.
            </p>
          </div>

          <div className="chips">
            <span className="chip">Next.js</span>
            <span className="chip">Node.js</span>
            <span className="chip">Reverse API</span>
            <span className="chip">Automation</span>
            <span className="chip">Mobile Dev</span>
          </div>

          <div className="quote">
            “Not a company. Just a dev lab.”
          </div>
        </div>
      </div>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #05060a;
          color: white;
          font-family: Arial, sans-serif;
        }

        .nav {
          position: sticky;
          top: 0;
          z-index: 50;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 18px;
          background: rgba(0, 0, 0, 0.45);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .logo {
          font-weight: bold;
          font-size: 18px;
          letter-spacing: 0.5px;
        }

        .navlinks {
          display: flex;
          gap: 12px;
        }

        .navlink {
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          font-size: 14px;
          padding: 6px 10px;
          border-radius: 10px;
        }

        .navlink:hover {
          background: rgba(255, 255, 255, 0.08);
          color: white;
        }

        .navlink.active {
          background: rgba(255, 255, 255, 0.12);
          color: white;
        }

        .banner {
          height: calc(100vh - 58px);
          background-size: cover;
          background-position: center;
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }

        .overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            rgba(0, 0, 0, 0.85),
            rgba(5, 6, 10, 0.8)
          );
        }

        .profileBox {
          position: relative;
          z-index: 10;
          max-width: 540px;
          width: 100%;
          padding: 22px;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(14px);
          text-align: center;
        }

        .avatar {
          width: 130px;
          height: 130px;
          border-radius: 999px;
          object-fit: cover;
          border: 2px solid rgba(255, 255, 255, 0.25);
          box-shadow: 0px 0px 40px rgba(147, 197, 253, 0.25);
        }

        .name {
          margin: 12px 0 0 0;
          font-size: 34px;
          font-weight: bold;
        }

        .role {
          margin-top: 8px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
        }

        .bio {
          margin-top: 14px;
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.6;
        }

        .chips {
          margin-top: 16px;
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
        }

        .chip {
          padding: 8px 12px;
          border-radius: 999px;
          font-size: 12px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: rgba(255, 255, 255, 0.8);
        }

        .quote {
          margin-top: 18px;
          font-style: italic;
          color: rgba(255, 255, 255, 0.65);
        }
      `}</style>
    </div>
  );
    }

import { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [prompt, setPrompt] = useState("");
  const [playlistName, setPlaylistName] = useState("");
  const [playlistUrl, setPlaylistUrl] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const spotifyToken = params.get("token");

    if (spotifyToken) {
      setToken(spotifyToken);
      localStorage.setItem("spotify_token", spotifyToken);
      window.history.replaceState({}, document.title, "/");
    } else {
      const savedToken = localStorage.getItem("spotify_token");
      if (savedToken) {
        setToken(savedToken);
      }
    }
  }, []);

  const generatePlaylist = async () => {
    setErrorMessage("");
    if (!prompt.trim()) {
      setPrompt("");
      setErrorMessage("Please enter a vibe");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/playlist/generate`,
        { prompt },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setPlaylistName(response.data.playlist.name);
      setPlaylistUrl(response.data.playlist.external_urls.spotify);
      setPrompt("");
    } catch (error: any) {
      console.log(error);

      if (error.response?.status === 401) {
        localStorage.removeItem("spotify_token");
        setToken("");
        setPrompt("");
        setErrorMessage("Session expired. Please login again.");
        return;
      }

      setPrompt("");
      setErrorMessage("Failed to generate playlist. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("spotify_token");
    setToken("");
    setPrompt("");
    setPlaylistName("");
    setPlaylistUrl("");
  };

  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>

      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(to right, #141e30, #243b55)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "white",
          fontFamily: "Arial",
        }}
      >
        <div
          style={{
            position: "relative",
            textAlign: "center",
            padding: "30px",
            borderRadius: "20px",
            background: "rgba(255,255,255,0.1)",
            backdropFilter: "blur(10px)",
            width: "400px",
          }}
        >
          {token && (
            <button
              onClick={logout}
              style={{
                position: "absolute",
                top: "15px",
                right: "15px",
                padding: "8px 14px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              Logout
            </button>
          )}

          <h1>Moodify 🎵</h1>

          {token ? (
            <>
              <p
                style={{
                  marginBottom: "15px",
                  color: "#1DB954",
                }}
              >
                Connected to Spotify ✅
              </p>

              <input
                placeholder="Describe your vibe..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "10px",
                  border: "none",
                  marginBottom: "15px",
                }}
              />

              <button
                onClick={generatePlaylist}
                style={{
                  padding: "12px 20px",
                  borderRadius: "10px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Generate Playlist
              </button>
              {errorMessage && (
                <p
                  style={{
                    color: "#ff4d4d",

                    marginTop: "15px",

                    fontSize: "14px",
                  }}
                >
                  {errorMessage}
                </p>
              )}
            </>
          ) : (
            <button
              onClick={() => {
                window.location.href = `${import.meta.env.VITE_API_URL}/auth/spotify/login`;
              }}
              style={{
                padding: "12px 20px",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Login with Spotify
            </button>
          )}

          {playlistName && (
            <h2 style={{ marginTop: "20px", fontSize: "18px" }}>
              Your playlist{" "}
              <span style={{ color: "#1DB954" }}>{playlistName}</span> created
              ✅
            </h2>
          )}
          {playlistUrl && (
            <a
              href={playlistUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#1DB954",
                display: "block",
                marginTop: "10px",
              }}
            >
              Open Playlist 🎧
            </a>
          )}

          {loading && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "rgba(0,0,0,0.7)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: "20px",
              }}
            >
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  border: "5px solid white",
                  borderTop: "5px solid transparent",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default App;

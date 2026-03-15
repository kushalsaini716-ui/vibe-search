import { useState } from "react";
import "./App.css";
import { GoogleGenerativeAI } from "@google/generative-ai";
import movies from "./movies.json";

function App() {
  const [response, setresponse] = useState("");
  const [result, setresult] = useState([]);
  const [loading, setloading] = useState(false);
  const [emptymessage, setemptymessage] = useState("");
  const [error, seterror] = useState("");

  const prompt = `
Convert the following movie mood into filters.

Return ONLY JSON.

{
 "genre": "",
 "keywords": []
}

User query: ${response}
`;

  const handleSearch = async () => {
    if (!response.trim()) return;
    if (loading) return;

    setloading(true);

    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

      const model = genAI.getGenerativeModel({
        model: "gemini-flash-latest"
      });

      const aiOutput = await model.generateContent(prompt);

      const text = aiOutput.response.text();
      const match = text.match(/\{[\s\S]*\}/); 
      
        const validJson = JSON.parse(JSON.stringify(match[0]));
      

      const filters = JSON.parse(validJson);

      const filtermovies = movies.filter(movie => {

        const matchgenre =
          filters.genre &&
          movie.genre.toLowerCase().includes(filters.genre.toLowerCase());

        const keywordmatch =
          filters.keywords &&
          filters.keywords.some(keyword =>
            movie.short_plot_summary
              .toLowerCase()
              .includes(keyword.toLowerCase())
          );


        return matchgenre || keywordmatch;
      });

      setresult(filtermovies);

    } catch (err) {
      console.error(err);
    }

    setloading(false);
  };

  const suggestion = [
    "a sci-fi movie that feels like Blade Runner but safe for kids",
    "something funny and relaxing for a rainy Sunday",
    "an 80s adventure movie involving treasure hunting",
    "a romantic movie that won't make me cry",
    "high-energy action with great choreography",
  ];



  return (
    <>
      <div className="streamflix">
        <h4>S T R E A M F L I X</h4>
      </div>
      <div className="VB-heading">
        <h1>VIBE</h1>
        <h1>SEARCH</h1>
      </div>

      <div className="search-bar">
        <input
          value={response}
          onChange={(e) => setresponse(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          type="text"
          className="search-input"
          placeholder="Describe your mood & Find your movie."
        />
        <button className="search-btn" onClick={handleSearch}>
          Search
        </button>
      </div>


      <div className="suggestions">
        {suggestion.map((s, i) => (
          <button
            key={i}
            className="suz-box"
            onClick={() => {
              setresponse(s);
              handleSearch();
            }}>

            {s}

          </button>))}
      </div>
      <div className="scanning">
        {loading && <p>Scanning library...</p>}
        {error && <p className="error">{error}</p>}
      </div>

      <div className="result">

        {result.map(movie => (
          <div key={movie.id} className="movie-card">
            <h3 className="moviecontent">{movie.title}</h3>
            <p className="moviecontent">Genre:   {movie.genre}</p>
            <p className="moviecontent">Year:   {movie.release_year}</p>
            <p className="moviecontent"> Rating:   {movie.rating}</p>
          </div>
        ))}
        {emptymessage && <p>{emptymessage}</p>}
      </div>
    </>
  );
}

export default App;

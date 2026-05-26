"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./CarAutocomplete.module.css";

export default function CarAutocomplete() {
  const [brands, setBrands] = useState([]);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const wrapperRef = useRef(null);

  // Fetch the car brands when the component mounts
  useEffect(() => {
    async function fetchCarBrands() {
      try {
        const response = await fetch(
          "https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleType/car?format=json"
        );
        const data = await response.json();
        if (data && data.Results) {
          // Extract only the make names and sort them alphabetically
          const brandNames = data.Results.map((item) => item.MakeName).sort();
          setBrands(brandNames);
        }
      } catch (error) {
        console.error("Erro ao buscar marcas de carros:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCarBrands();
  }, []);

  // Filter suggestions when the user types
  useEffect(() => {
    if (query.trim() === "") {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const filtered = brands.filter((brand) =>
      brand.toLowerCase().includes(query.toLowerCase())
    );

    setSuggestions(filtered);
    setIsOpen(true);
  }, [query, brands]);

  // Handle clicking outside to close the dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.autocompleteWrapper} ref={wrapperRef}>
      <input
        type="text"
        className={styles.input}
        placeholder={isLoading ? "Carregando marcas..." : "Digite a marca do carro..."}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => {
          if (query.trim() !== "" && suggestions.length > 0) setIsOpen(true);
        }}
        disabled={isLoading}
      />
      {isOpen && suggestions.length > 0 && (
        <ul className={styles.suggestionsList}>
          {suggestions.map((brand, index) => (
            <li
              key={index}
              className={styles.suggestionItem}
              onClick={() => {
                setQuery(brand);
                setIsOpen(false);
              }}
            >
              {/* Highlight the matching part */}
              {highlightMatch(brand, query)}
            </li>
          ))}
        </ul>
      )}
      {isOpen && query.trim() !== "" && suggestions.length === 0 && (
        <div className={styles.noResults}>Nenhuma marca encontrada.</div>
      )}
    </div>
  );
}

// Helper to highlight the matched text
function highlightMatch(text, query) {
  const parts = text.split(new RegExp(`(${query})`, "gi"));
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <strong key={i} style={{ color: "#0070f3" }}>
            {part}
          </strong>
        ) : (
          part
        )
      )}
    </span>
  );
}

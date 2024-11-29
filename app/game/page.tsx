"use client";
import { useState } from "react";

export default function GameRoute() {
  const [userAddress, setUserAddress] = useState(""); // Estado para la dirección del usuario
  const [responseData, setResponseData] = useState(null); // Estado para almacenar la respuesta de la API

  // Función para manejar la llamada a la API
  const callApi = async () => {
    try {
      const res = await fetch("/api/random-generator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userAddress }),
      });

      if (!res.ok) {
        throw new Error("Failed to fetch");
      }

      const data = await res.json();
      setResponseData(data); // Guarda la respuesta en el estado
      console.log(data);
    } catch (error) {
      console.error("Error calling the API:", error);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 gap-y-3">
      <h1>GAME</h1>

      {/* Input para la dirección de la wallet */}
      <input
        type="text"
        placeholder="Enter your wallet address"
        value={userAddress}
        onChange={(e) => setUserAddress(e.target.value)} // Actualiza el estado con la dirección del usuario
        className="border p-2 mb-4"
      />

      {/* Botón para hacer la llamada a la API */}
      <button
        onClick={callApi}
        disabled={!userAddress} // Deshabilita el botón si no hay dirección
        className="bg-blue-500 text-white p-2 rounded"
      >
        Get Random Data
      </button>

      {/* Muestra los datos de la respuesta */}
      {responseData && (
        <div className="mt-4">
          <h3>Response Data:</h3>
          <pre>{JSON.stringify(responseData, null, 2)}</pre>
        </div>
      )}
    </main>
  );
}
